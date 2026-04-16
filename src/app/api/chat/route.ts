import { getClinics, getSpecializations } from '../../../lib/firebase';
import { specTranslations } from '../../../i18n';
import type { Clinic } from '../../../types/clinic';

const ALLOWED_ORIGINS = [
    'https://zoryxweb-production.up.railway.app',
    'https://web.zoryx.app',
    'http://localhost:3000'
];

// Rate limiting: максимум 20 запросов в минуту с одного IP
const rateLimit = new Map<string, { count: number; reset: number }>();

// Кэшируем полные объекты клиник — нужно для фильтрации
let clinicsCache: { clinics: Clinic[]; specs: string[]; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

// Обратный словарь: любое переведённое название → ключ специализации
// Строится один раз при загрузке модуля
const reverseSpecMap = new Map<string, string>();
for (const [key, langs] of Object.entries(specTranslations)) {
    reverseSpecMap.set(key.toLowerCase().replace(/_/g, ' '), key);
    for (const tr of Object.values(langs)) {
        if (tr) reverseSpecMap.set(tr.toLowerCase(), key);
    }
}

// Псевдонимы для слов которые не совпадают по префиксу
// (нутри-о-лог ≠ нутри-ц-иология, окулист ≠ офтальмология и т.д.)
const manualAliases: [string, string][] = [
    ['нутриолог',    'Nutriční_terapie'],
    ['нутрициолог',  'Nutriční_terapie'],
    ['диетолог',     'Nutriční_terapie'],
    ['nutritionist', 'Nutriční_terapie'],
    ['dietitian',    'Nutriční_terapie'],
    ['окулист',      'Oftalmologie'],
    ['oculist',      'Oftalmologie'],
    ['лор',          'ORL'],
    ['ent',          'ORL'],
    ['лікар',        'Praktický_lékař_pro_dospělé'],
    ['хирург',       'Všeobecná_chirurgie'],
    ['surgeon',      'Všeobecná_chirurgie'],
    ['педиатр',      'Praktický_lékař_pro_děti'],
    ['педіатр',      'Praktický_lékař_pro_děti'],
    ['pediatrician', 'Praktický_lékař_pro_děti'],
    ['скорая',       'Urgentní_příjem'],
    ['urgent',       'Urgentní_příjem'],
    ['emergency',    'Urgentní_příjem'],
];
for (const [alias, key] of manualAliases) {
    reverseSpecMap.set(alias, key);
}

/** Извлекает "Praha N" из текстов разговора (поддерживает RU/UK/CS/EN написание) */
function extractDistrict(texts: string[]): string | null {
    for (const text of texts) {
        const m = text.match(/Praha\s*(\d+)/i)           // Praha 7, PRAHA7
            ?? text.match(/Praze\s*(\d+)/i)              // v Praze 7 (чешский дательный)
            ?? text.match(/Prague\s*(\d+)/i)             // Prague 7 (английский)
            ?? text.match(/[Пп]раг[аеуи]?\s*(\d+)/)     // Прага 7, Праге 7, Прагу 7
            ?? text.match(/прах[аеуи]?\s*(\d+)/i);       // опечатки
        if (m) return `Praha ${m[1]}`;
    }
    return null;
}

/** Находит ключ специализации по переводу на любом языке (берёт самое длинное совпадение) */
function detectSpecKey(text: string): string | null {
    const lower = text.toLowerCase();
    let bestKey: string | null = null;
    let bestLen = 0;

    // 1. Точное вхождение: "урология" есть в тексте → подходит для EN/CS
    for (const [searchStr, key] of reverseSpecMap) {
        if (lower.includes(searchStr) && searchStr.length > bestLen) {
            bestKey = key;
            bestLen = searchStr.length;
        }
    }

    // 2. Префикс-совпадение (двустороннее) — работает на всех 4 языках:
    // RU: "уролог" → "урология".startsWith("уролог") ✅
    // UK: "уролог" → "урологія".startsWith("уролог") ✅
    // CS: "urolog" → "urologie".startsWith("urolog") ✅
    // EN: "urologist" → "urologist".startsWith("urology") ✅ (обратная проверка)
    //     "dentist"   → "dentist".startsWith("dentistry") ✅
    const words = lower.split(/\s+/).filter(w => w.length >= 5);
    for (const word of words) {
        for (const [searchStr, key] of reverseSpecMap) {
            const fwd = searchStr.startsWith(word); // уролог → урология
            const rev = word.startsWith(searchStr); // urologist → urology
            if ((fwd || rev) && word.length > bestLen) {
                bestKey = key;
                bestLen = word.length;
            }
        }
    }

    return bestKey;
}

/** Строит строку клиник для промпта GPT */
function buildClinicList(clinics: Clinic[]): string {
    return clinics
        .map(c => `- ${c.name} | специализации: ${c.specializations.join(', ')} | языки: ${c.languages.join(', ')} | адрес: ${c.address}`)
        .join('\n');
}

export async function POST(req: Request) {
    const origin = req.headers.get('origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    const now = Date.now();
    const limit = rateLimit.get(ip);
    if (limit && now < limit.reset && limit.count >= 20) {
        return Response.json({ error: 'Too many requests' }, { status: 429 });
    }
    rateLimit.set(ip, {
        count: (limit && now < limit.reset ? limit.count : 0) + 1,
        reset: limit && now < limit.reset ? limit.reset : now + 60_000,
    });

    const { message, history, lang, activeLangs, activeDistrict } = await req.json();

    // Загружаем клиники с кэшем (теперь храним полные объекты)
    if (!clinicsCache || Date.now() - clinicsCache.ts > CACHE_TTL) {
        const clinicsData = await getClinics();
        const specsData = await getSpecializations(clinicsData);
        clinicsCache = { clinics: clinicsData, specs: specsData, ts: Date.now() };
    }
    const allClinics = clinicsCache.clinics;
    const specializations = clinicsCache.specs;

    // Валидация входных данных
    if (!message || typeof message !== 'string') {
        return Response.json({ error: 'Invalid message' }, { status: 400 });
    }
    if (message.length > 500) {
        return Response.json({ error: 'Message too long' }, { status: 400 });
    }
    const cleanMessage = message.replace(/<[^>]*>/g, '').trim();
    if (!cleanMessage) {
        return Response.json({ error: 'Empty message' }, { status: 400 });
    }

    // Валидация истории
    const safeHistory = ((history || []) as unknown[])
        .slice(-12)
        .filter((m): m is { role: string; content: string } => {
            if (typeof m !== 'object' || m === null) return false;
            const msg = m as Record<string, unknown>;
            return (msg.role === 'user' || msg.role === 'assistant')
                && typeof msg.content === 'string'
                && msg.content.length < 500;
        });

    // ─── Фильтрация клиник в коде, а не в голове GPT ───────────────────────

    // Собираем все тексты пользователя из разговора
    const userTexts = [
        ...safeHistory.filter(m => m.role === 'user').map(m => m.content),
        cleanMessage,
    ];

    // 1. Извлекаем район (Praha 7, Praha 11 и т.д.)
    const district = extractDistrict(userTexts);

    // 2. Определяем специализацию (уролог → Urologie, стоматолог → Stomatologie)
    const specKey = detectSpecKey(userTexts.join(' '));

    // 3. Фильтруем клиники по специализации
    // Ищем по точному ключу И по схожим русским/украинским переводам —
    // чтобы "педиатр" находил и Pediatrie, и Praktický_lékař_pro_děti
    let filtered = allClinics;
    if (specKey) {
        const targetEn = specTranslations[specKey]?.en;
        const targetRu = specTranslations[specKey]?.ru?.toLowerCase();
        const targetUk = specTranslations[specKey]?.uk?.toLowerCase();
        const userWord = userTexts.join(' ').toLowerCase();

        const bySpec = allClinics.filter(c =>
            c.specializations.some(s => {
                if (s === specKey) return true;
                const tr = specTranslations[s.replace(/ /g, '_')] ?? specTranslations[s];
                if (!tr) return false;
                // Совпадение по английскому переводу
                if (targetEn && tr.en === targetEn) return true;
                // Совпадение по русскому/украинскому — слово из запроса является
                // префиксом перевода (педиатр → педиатрия, педиатр → педиатр)
                const ruTr = tr.ru?.toLowerCase() ?? '';
                const ukTr = tr.uk?.toLowerCase() ?? '';
                for (const word of userWord.split(/\s+/).filter(w => w.length >= 5)) {
                    if (ruTr.startsWith(word) || word.startsWith(ruTr.slice(0, 5))) return true;
                    if (ukTr.startsWith(word) || word.startsWith(ukTr.slice(0, 5))) return true;
                    if (targetRu && (ruTr.startsWith(targetRu.slice(0, 5)))) return true;
                    if (targetUk && (ukTr.startsWith(targetUk.slice(0, 5)))) return true;
                }
                return false;
            })
        );
        if (bySpec.length > 0) filtered = bySpec;
    }

    // 4. Фильтруем по языкам из UI (если пользователь выбрал в фильтрах)
    const safeLangs = Array.isArray(activeLangs)
        ? (activeLangs as unknown[]).filter((l): l is string => typeof l === 'string' && l.length < 50)
        : [];
    if (safeLangs.length > 0) {
        const byLang = filtered.filter(c =>
            safeLangs.some(l => c.languages.some(cl => cl.toLowerCase() === l.toLowerCase()))
        );
        if (byLang.length > 0) filtered = byLang;
    }

    // 5. Фильтруем по району из UI (приоритет над текстом чата)
    const safeDistrict = typeof activeDistrict === 'string' && activeDistrict.length < 20
        ? activeDistrict
        : null;
    const effectiveDistrict = safeDistrict ?? district;

    let districtNote = '';
    if (effectiveDistrict) {
        const byDistrict = filtered.filter(c => c.address.includes(effectiveDistrict));
        if (byDistrict.length > 0) {
            filtered = byDistrict;
        } else {
            districtNote = `\nВАЖНО: В базе нет клиник ИМЕННО в ${effectiveDistrict} с данной специализацией. Сообщи об этом одной фразой, затем ОБЯЗАТЕЛЬНО порекомендуй лучшую клинику из списка ниже — не отказывайся от рекомендации.`;
        }
    }

    const clinicList = buildClinicList(filtered);

    // ───────────────────────────────────────────────────────────────────────

    const langNames: Record<string, string> = {
        ru: 'русском', uk: 'украинском', cs: 'чешском', en: 'английском',
    };
    const langName = langNames[lang as string] || 'русском';

    const systemPrompt = `Ты медицинский помощник сайта Zoryx — каталога клиник в Праге.
Доступные специализации: ${specializations.join(', ')}.
${districtNote}
Клиники, подходящие под запрос пользователя (уже отфильтрованы):
${clinicList || 'Подходящих клиник не найдено.'}

Правила:
- Рекомендуй ТОЛЬКО клиники из списка выше. Не придумывай клиники и адреса.
- Если список пустой — честно скажи что подходящих клиник не нашлось и предложи обратиться на сайт zoryx.app.
- Учитывай предпочтения по языку врача из истории разговора.
- Веди разговор ТОЛЬКО на ${langName} языке.
- В конце ответа ВСЕГДА добавляй эти две строки на русском языке — без исключений, даже если перечислил несколько клиник (выбери одну лучшую):
**Рекомендуемая специализация: [название из списка]**
**Рекомендуемая клиника: [точное название клиники из списка]**`;

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 20000);

    let openAIRes: Response;
    try {
        openAIRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            signal: abortController.signal,
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                stream: true,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...safeHistory,
                    { role: 'user', content: cleanMessage },
                ],
                max_tokens: 800,
            }),
        });
    } catch {
        clearTimeout(timeout);
        return Response.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    clearTimeout(timeout);

    if (!openAIRes.ok) {
        console.error(`OpenAI error: ${openAIRes.status} ${openAIRes.statusText}`);
        return Response.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    // Стримим ответ клиенту, в конце добавляем метаданные (clinicId, specKey)
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
        async start(controller) {
            const reader = openAIRes.body!.getReader();
            const decoder = new TextDecoder();
            let fullAnswer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    for (const line of chunk.split('\n')) {
                        if (!line.startsWith('data: ')) continue;
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            const text: string = parsed.choices?.[0]?.delta?.content ?? '';
                            if (text) {
                                fullAnswer += text;
                                controller.enqueue(encoder.encode(text));
                            }
                        } catch { /* неполный JSON в чанке — пропускаем */ }
                    }
                }
            } finally {
                reader.releaseLock();
            }

            // Извлекаем clinicId из полного накопленного ответа
            let clinicId: string | null = null;
            const nameMatch = fullAnswer.match(/Рекомендуемая клиника:\s*\*?\*?([^\n*]+)/);
            if (nameMatch) {
                const name = nameMatch[1].trim().toLowerCase();
                const found = filtered.find(c =>
                    c.name.toLowerCase().includes(name) ||
                    name.includes(c.name.toLowerCase())
                );
                clinicId = found?.id ?? null;
            }
            if (!clinicId && filtered.length === 1 && filtered !== allClinics) {
                clinicId = filtered[0].id;
            }

            // Отправляем метаданные последним чанком
            controller.enqueue(
                encoder.encode(`\n__META__${JSON.stringify({ clinicId, specKey })}`)
            );
            controller.close();
        },
    });

    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
        },
    });
}

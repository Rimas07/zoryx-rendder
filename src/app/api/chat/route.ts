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
    for (const [searchStr, key] of reverseSpecMap) {
        if (lower.includes(searchStr) && searchStr.length > bestLen) {
            bestKey = key;
            bestLen = searchStr.length;
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

    const { message, history, lang } = await req.json();

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
    // Используем английский перевод как общий знаменатель —
    // в Firebase один ключ может быть 'Urgentni_příjem', другой 'Urgentní příjem',
    // оба имеют одинаковый en: 'Emergency', поэтому сравниваем по нему
    let filtered = allClinics;
    if (specKey) {
        const targetEn = specTranslations[specKey]?.en;
        const bySpec = allClinics.filter(c =>
            c.specializations.some(s =>
                s === specKey ||
                (targetEn && specTranslations[s]?.en === targetEn)
            )
        );
        if (bySpec.length > 0) filtered = bySpec;
    }

    // 4. Фильтруем по району
    let districtNote = '';
    if (district) {
        const byDistrict = filtered.filter(c => c.address.includes(district));
        if (byDistrict.length > 0) {
            filtered = byDistrict;
        } else {
            // Клиник в этом районе нет — скажем GPT об этом явно
            districtNote = `\nВАЖНО: В базе нет клиник в ${district} с данной специализацией. Сообщи об этом пользователю и предложи ближайший вариант из списка ниже.`;
        }
    }

    const clinicList = buildClinicList(filtered);

    // ───────────────────────────────────────────────────────────────────────

    const langNames: Record<string, string> = {
        ru: 'русском', uk: 'украинском', cs: 'чешском', en: 'английском',
    };
    const langName = langNames[lang as string] || 'русском';

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 15000);

    let response: Response;
    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            signal: abortController.signal,
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Ты медицинский помощник сайта Zoryx — каталога клиник в Праге.
Доступные специализации: ${specializations.join(', ')}.
${districtNote}
Клиники, подходящие под запрос пользователя (уже отфильтрованы):
${clinicList || 'Подходящих клиник не найдено.'}

Правила:
- Рекомендуй ТОЛЬКО клиники из списка выше. Не придумывай клиники и адреса.
- Если список пустой — честно скажи что подходящих клиник не нашлось и предложи обратиться на сайт zoryx.app.
- Учитывай предпочтения по языку врача из истории разговора.
- Веди разговор ТОЛЬКО на ${langName} языке.
- Последние две строки ответа ВСЕГДА пиши на русском языке точно в этом формате (даже если ведёшь беседу на другом языке):
**Рекомендуемая специализация: [название из списка]**
**Рекомендуемая клиника: [точное название клиники из списка]**`
                    },
                    ...safeHistory,
                    { role: 'user', content: cleanMessage }
                ],
                max_tokens: 800,
            }),
        });
    } catch {
        clearTimeout(timeout);
        return Response.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    clearTimeout(timeout);

    if (!response.ok) {
        console.error(`OpenAI error: ${response.status} ${response.statusText}`);
        return Response.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
        console.error('OpenAI unexpected response:', JSON.stringify(data));
        return Response.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    return Response.json({ answer });
}

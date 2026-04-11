import { getClinics, getSpecializations } from '../../../lib/firebase';

const ALLOWED_ORIGINS = [
    'https://zoryxweb-production.up.railway.app',
    'https://web.zoryx.app',
   
];

// Живёт между запросами — не внутри функции
const rateLimit = new Map<string, { count: number; reset: number }>();

export async function POST(req: Request) {
    const origin = req.headers.get('origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting: максимум 20 запросов в минуту с одного IP
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

    // Загружаем клиники на сервере — клиент не может их подменить
    const clinics = await getClinics();
    const specializations = await getSpecializations(clinics);

    // Валидация истории — только user/assistant, не system, не длиннее 1000 символов
    const safeHistory = ((history || []) as unknown[])
        .slice(-6) // последние 6 сообщений (3 пары вопрос-ответ)
        .filter((m): m is { role: string; content: string } => {
            if (typeof m !== 'object' || m === null) return false;
            const msg = m as Record<string, unknown>;
            return (msg.role === 'user' || msg.role === 'assistant')
                && typeof msg.content === 'string'
                && msg.content.length < 500; // максимум 500 символов на сообщение
        });

    // Валидация входных данных
    if (!message || typeof message !== 'string') {
        return Response.json({ error: 'Invalid message' }, { status: 400 });
    }
    // Лимит длины сообщения
    if (message.length > 500) {
        return Response.json({ error: 'Message too long' }, { status: 400 });
    }
    // Убираем HTML теги из сообщения
    const cleanMessage = message.replace(/<[^>]*>/g, '').trim();
    if (!cleanMessage) {
        return Response.json({ error: 'Empty message' }, { status: 400 });
    }

    const clinicList = clinics
        .map(c => `- ${c.name} | специализации: ${c.specializations.join(', ')} | языки: ${c.languages.join(', ')} | адрес: ${c.address}`)
        .join('\n');

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
Клиники в каталоге:
${clinicList}

Пользователь может описывать симптомы, просить врача говорящего на определённом языке (русский=ru, украинский=uk, чешский=cs, английский=en), или упоминать район Праги (Praha 1, Praha 7 и т.д.).
Подбери подходящую клинику из списка с учётом всех критериев пользователя.
Если запрашиваемая специализация отсутствует в списке — предложи ближайшую подходящую.
Веди разговор ТОЛЬКО на ${langName} языке. Последние две строки с рекомендациями ВСЕГДА пиши на русском языке точно в этом формате:
**Рекомендуемая специализация: [название из списка]**
**Рекомендуемая клиника: [точное название клиники из списка]**`
                },
                ...safeHistory,
                { role: 'user', content: cleanMessage }
            ],
            max_tokens: 500,
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
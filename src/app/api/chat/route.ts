export async function POST(req: Request) {
    const { message, specializations, clinics } = await req.json();

    const clinicList = (clinics as { id: string; name: string; specializations: string[] }[])
        .map(c => `- ${c.name} (${c.specializations.join(', ')})`)
        .join('\n');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            messages: [
                {
                    role: 'system',
                    content: `Ты медицинский помощник сайта Zoryx — каталога клиник в Праге.
Доступные специализации: ${specializations.join(', ')}.
Клиники в каталоге:
${clinicList}

Пользователь описывает симптомы — ты определяешь нужную специализацию, даёшь краткий совет и рекомендуешь конкретную клинику из списка выше.
Отвечай на том языке на котором пишет пользователь.
Всегда заканчивай ответ в формате:
**Рекомендуемая специализация: [название]**
**Рекомендуемая клиника: [название клиники из списка]**`
                },
                { role: 'user', content: message }
            ],
            max_tokens: 500,
        }),
    });

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data));
    const answer = data.choices?.[0]?.message?.content || 'Не удалось получить ответ';
    return Response.json({ answer });
}
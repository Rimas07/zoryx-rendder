export async function POST(req: Request) {
    const { message, specializations, clinics } = await req.json();

    const clinicList = (clinics as { id: string; name: string; specializations: string[]; languages: string[]; address: string }[])
        .map(c => `- ${c.name} | специализации: ${c.specializations.join(', ')} | языки: ${c.languages.join(', ')} | адрес: ${c.address}`)
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

Пользователь может описывать симптомы, просить врача говорящего на определённом языке (русский=ru, украинский=uk, чешский=cs, английский=en), или упоминать район Праги (Praha 1, Praha 7 и т.д.).
Подбери подходящую клинику из списка с учётом всех критериев пользователя.
Если запрашиваемая специализация отсутствует в списке — предложи ближайшую подходящую.
Веди разговор на языке пользователя, но последние две строки с рекомендациями ВСЕГДА пиши на русском языке точно в этом формате:
**Рекомендуемая специализация: [название из списка]**
**Рекомендуемая клиника: [точное название клиники из списка]**`
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
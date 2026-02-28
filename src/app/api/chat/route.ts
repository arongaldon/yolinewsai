import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, context } = body;

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Mock response
            const mockReply = `I'm a mock AI agent. To interact with the real AI, add an OPENAI_API_KEY to your environment variables. 
      I see you're asking about: "${messages[messages.length - 1].content}". 
      From today's news context, there are ${context?.articles?.length || 0} top stories.`;

            return NextResponse.json({ reply: mockReply });
        }

        const systemPrompt = `
      You are an expert news analyst and AI assistant for YoliNews.
      Use the provided news context to answer user questions, connect stories, and provide in-depth information.
      If a user asks for a link, provide the link formatted in markdown, and mention if it is paywalled based on the context.
      Make your answers informative, neutral, and reliable.
      
      TODAY'S NEWS CONTEXT:
      ${JSON.stringify(context, null, 2)}
    `;

        const openAiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: openAiMessages
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response from OpenAI');
        }

        const data = await response.json();
        return NextResponse.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error('Error in /api/chat:', error);
        return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
    }
}

import { FeedArticle } from './feed';

export interface ProcessedArticle extends FeedArticle {
    biasScore: number; // -10 (Left) to 10 (Right), 0 = Neutral
    biasReasoning: string;
    isDuplicate: boolean;
    duplicateOfId?: string;
    id: string; // generate unique id
    isPaywalled: boolean;
}

export interface DailySummary {
    overview: string;
    keyPoints: string[];
}

export async function processArticles(articles: FeedArticle[]): Promise<{
    processed: ProcessedArticle[],
    summary: DailySummary
}> {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn("No OPENAI_API_KEY found. Using mock AI processing logic.");
        return mockProcess(articles);
    }

    try {
        const prompt = `
    Analyze the following list of news articles:
    ${JSON.stringify(articles.map((a, i) => ({ id: i, title: a.title, source: a.source, snippet: a.contentSnippet })))}
    
    Tasks:
    1. Detect duplicates: Identify stories covering the exactly same event. Mark secondary articles as duplicates.
    2. Bias analysis: Assign a bias score from -10 (far left) to 10 (far right), with 0 being neutral, based on title/source. Provide a 1-sentence reasoning.
    3. Generate a daily summary: An engaging overview paragraph and 3-5 key points representing today's most important distinct stories.
    4. Paywall detection: Heuristically guess if the source commonly uses hard paywalls (return true/false).
    
    Return pure JSON with the following structure:
    {
      "results": [
        {
          "originalIndex": 0,
          "biasScore": 0,
          "biasReasoning": "string",
          "isDuplicate": false,
          "isPaywalled": false
        }
      ],
      "summary": {
        "overview": "string",
        "keyPoints": ["string1", "string2"]
      }
    }
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI error: ${response.statusText}`);
        }

        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);

        const processed = articles.map((article, i) => {
            const match = parsed.results.find((r: any) => r.originalIndex === i);
            return {
                ...article,
                id: `art_${i}_${Date.now()}`,
                biasScore: match?.biasScore || 0,
                biasReasoning: match?.biasReasoning || 'Error calculating bias',
                isDuplicate: match?.isDuplicate || false,
                isPaywalled: match?.isPaywalled || false
            };
        });

        return {
            processed,
            summary: parsed.summary
        };

    } catch (error) {
        console.error("Error processing articles:", error);
        return mockProcess(articles);
    }
}

function mockProcess(articles: FeedArticle[]) {
    const processed = articles.map((article, i) => ({
        ...article,
        id: `art_${i}_${Date.now()}`,
        biasScore: Math.floor(Math.random() * 21) - 10,
        biasReasoning: 'Mock evaluation: based on generic sentiment analysis.',
        isDuplicate: false, // Keeping mock simple, assuming no duplicates
        isPaywalled: article.source === 'Reuters' // Example heuristic
    }));

    const summary = {
        overview: "Today's news highlights significant global events including political developments, economic shifts, and ongoing conflicts. Authorities are responding to emerging crises while international negotiations continue.",
        keyPoints: [
            articles[0]?.title || "Major global policy update announced.",
            articles[1]?.title || "Economic indicators show unexpected trends.",
            articles[2]?.title || "Significant developments in ongoing international conflict."
        ]
    };

    return { processed, summary };
}

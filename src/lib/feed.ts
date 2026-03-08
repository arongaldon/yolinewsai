import Parser from 'rss-parser';

export interface FeedArticle {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
    image?: string;
}

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media:content'],
            ['media:thumbnail', 'media:thumbnail'],
            ['content:encoded', 'content:encoded'],
            'image'
        ]
    }
});

const FALLBACK_FEEDS = [
    { name: 'AP News', url: 'https://apnews.com/index.rss' },
    { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
    { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml' },
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-en-world' },
    { name: 'France 24', url: 'https://www.france24.com/en/rss' },
    { name: 'Kyodo News', url: 'https://english.kyodonews.net/rss/news.xml' }
];

async function getAIFeeds(): Promise<{ name: string, url: string }[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return FALLBACK_FEEDS;

    try {
        const prompt = `
        Provide a list of 5 to 7 reliable, trustworthy, and working RSS feed URLs for major news organizations from various different countries around the world.
        Include a diverse mix of media (e.g., European, Asian, Middle Eastern, Latin American).
        Provide only valid, well-known RSS feed endpoints that are highly likely to work.
        
        Return pure JSON with the following structure:
        {
            "feeds": [
                { "name": "Publisher Name", "url": "https://example.com/rss.xml" }
            ]
        }`;

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

        if (!response.ok) throw new Error("Failed to fetch feeds from AI");
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        if (parsed.feeds && parsed.feeds.length > 0) {
            console.log("AI dynamically selected feeds:", parsed.feeds.map((f: any) => f.name).join(', '));
            return parsed.feeds;
        }
    } catch (e) {
        console.error("AI feed generation failed, falling back to default.", e);
    }
    
    return FALLBACK_FEEDS;
}

export async function fetchTopHeadlines(): Promise<FeedArticle[]> {
    const articles: FeedArticle[] = [];
    const feedsToUse = await getAIFeeds();

    for (const feed of feedsToUse) {
        try {
            const parsed = await parser.parseURL(feed.url);

            // Get top 5 from each feed to prevent overload
            const items = (parsed.items || []).slice(0, 5);

            for (const item of items) {
                if (item.title && item.link) {
                    let image: string | undefined;

                    // 1. Try enclosure
                    if (item.enclosure && item.enclosure.url) {
                        image = item.enclosure.url;
                    } 
                    // 2. Try media:content or media:thumbnail (with $ attributes)
                    else {
                        const media = item['media:content'] || item['media:thumbnail'];
                        if (media && media.$ && media.$.url) {
                            image = media.$.url;
                        } else if (media && typeof media === 'string') {
                            image = media;
                        }
                    }

                    // 3. Fallback: Parse img tags or direct URLs in content
                    const htmlContent = item['content:encoded'] || item.content || '';
                    if (!image && htmlContent) {
                        const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
                        if (imgMatch && imgMatch[1]) {
                            image = imgMatch[1];
                        }
                    }
                    if (!image && item.image) {
                        if (typeof item.image === 'string') image = item.image;
                        else if (item.image.url) image = item.image.url;
                    }
                    if (!image && item.contentSnippet) {
                        const urlMatch = item.contentSnippet.match(/https?:\/\/[^\s"'>]+\.(?:jpg|jpeg|png|gif|webp)/i);
                        if (urlMatch) {
                            image = urlMatch[0];
                        }
                    }

                    // Ignore tiny tracking images or logos
                    if (image && (
                        image.includes('favicon') || 
                        image.includes('logo') || 
                        image.includes('tracker') || 
                        image.includes('1x1') || 
                        image.includes('pixel')
                    )) {
                        image = undefined;
                    }

                    articles.push({
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate || new Date().toISOString(),
                        contentSnippet: item.contentSnippet || item.content || '',
                        source: feed.name,
                        image: image
                    });
                }
            }
        } catch (error) {
            console.error(`Error fetching feed ${feed.name}:`, error);
        }
    }

    // Sort by date descending
    return articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

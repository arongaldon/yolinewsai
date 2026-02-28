import Parser from 'rss-parser';

export interface FeedArticle {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
    source: string;
}

const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail']
    }
});

const DEFAULT_FEEDS = [
    { name: 'AP News', url: 'https://apnews.com/index.rss' },
    { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
    { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml' },
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' }
];

export async function fetchTopHeadlines(): Promise<FeedArticle[]> {
    const articles: FeedArticle[] = [];

    for (const feed of DEFAULT_FEEDS) {
        try {
            const parsed = await parser.parseURL(feed.url);

            // Get top 5 from each feed to prevent overload
            const items = (parsed.items || []).slice(0, 5);

            for (const item of items) {
                if (item.title && item.link) {
                    articles.push({
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate || new Date().toISOString(),
                        contentSnippet: item.contentSnippet || item.content || '',
                        source: feed.name,
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

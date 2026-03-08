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

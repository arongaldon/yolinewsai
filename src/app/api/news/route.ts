import { NextResponse } from 'next/server';
import { fetchTopHeadlines } from '@/lib/feed';
import { processArticles } from '@/lib/ai';

// Cache the response in memory for 15 minutes to avoid hitting APIs too often
let cachedNews: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 0; // Temporarily force clear cache

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    // Create a cache key that includes the language so we don't serve english to spanish users
    const cacheKey = `news_${lang}`;
    
    const now = Date.now();
    if (cachedNews && cachedNews[cacheKey] && (now - lastFetchTime) < CACHE_DURATION) {
        return NextResponse.json(cachedNews[cacheKey]);
    }

    try {
        const rawArticles = await fetchTopHeadlines();
        const processed = await processArticles(rawArticles, lang);

        // remove duplicates
        const uniqueArticles = processed.processed.filter(a => !a.isDuplicate);

        if (!cachedNews) cachedNews = {};

        cachedNews[cacheKey] = {
            articles: uniqueArticles,
            summary: processed.summary,
            timestamp: now
        };
        lastFetchTime = now;

        return NextResponse.json(cachedNews[cacheKey]);
    } catch (error) {
        console.error('Error in /api/news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

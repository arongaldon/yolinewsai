import { NextResponse } from 'next/server';
import { fetchTopHeadlines } from '@/lib/feed';
import { processArticles } from '@/lib/ai';

// Cache the response in memory for 15 minutes to avoid hitting APIs too often
let cachedNews: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 15 * 60 * 1000;

export async function GET() {
    const now = Date.now();
    if (cachedNews && (now - lastFetchTime) < CACHE_DURATION) {
        return NextResponse.json(cachedNews);
    }

    try {
        const rawArticles = await fetchTopHeadlines();
        const processed = await processArticles(rawArticles);

        // remove duplicates
        const uniqueArticles = processed.processed.filter(a => !a.isDuplicate);

        cachedNews = {
            articles: uniqueArticles,
            summary: processed.summary,
            timestamp: now
        };
        lastFetchTime = now;

        return NextResponse.json(cachedNews);
    } catch (error) {
        console.error('Error in /api/news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

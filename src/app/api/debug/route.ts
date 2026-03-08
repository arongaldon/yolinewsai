import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail', 'content:encoded', 'image', 'enclosure']
    }
});

export async function GET() {
    try {
        const parsed = await parser.parseURL('https://feeds.npr.org/1001/rss.xml');
        fs.writeFileSync('/home/arong/yolinewsai/debug.json', JSON.stringify(parsed.items.slice(0, 2), null, 2));
        return NextResponse.json({ ok: true, t: Date.now() });
    } catch (e) {
        return NextResponse.json({ error: String(e) });
    }
}

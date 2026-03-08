import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail']
    }
});

async function run() {
    const parsed = await parser.parseURL('https://feeds.npr.org/1001/rss.xml');
    const item = parsed.items.find((i: any) => i.enclosure || i['media:content'] || i.content);
    console.log("enclosure", item?.enclosure);
    console.log("media:content", item?.['media:content']);
    console.log("media:thumbnail", item?.['media:thumbnail']);
    console.log("content", item?.content?.substring(0, 100)); // Maybe it has img src?
}

run().catch(console.error);

import Parser from 'rss-parser';

const parser = new Parser();
const BBC_RSS_URL = 'https://feeds.bbci.co.uk/news/world/rss.xml';

export type NewsItem = {
    title: string;
    snippet: string;
};

export async function fetchLatestHeadlines(): Promise<NewsItem[]> {
    try {
        const feed = await parser.parseURL(BBC_RSS_URL);

        // Take top 5 items
        return feed.items.slice(0, 5).map(item => ({
            title: item.title || "Unknown Headline",
            snippet: item.contentSnippet || item.content || ""
        }));
    } catch (error) {
        console.error("Failed to fetch RSS feed:", error);
        return [];
    }
}

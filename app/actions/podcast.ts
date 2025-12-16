'use server';

import { fetchLatestHeadlines } from '@/lib/news';
import { generateNewsScript, generateAudio } from '@/lib/gemini';

export async function generateDailyPodcast(language: string) {
    try {
        // 1. Fetch News
        console.log("Creating Podcast: Fetching headlines...");
        const headlines = await fetchLatestHeadlines();
        if (headlines.length === 0) throw new Error("No news found.");

        // 2. Generate Script
        console.log("Creating Podcast: Generating script...");
        const script = await generateNewsScript(headlines, language);

        // 3. Generate Audio
        console.log("Creating Podcast: Generating audio...");
        const audio = await generateAudio(script, language);

        if (!audio) throw new Error("Audio generation failed.");

        return {
            success: true,
            audioBase64: audio.data,
            script: script
        };
    } catch (error) {
        console.error("Podcast Error:", error);
        return { success: false, error: "Failed to generate podcast." };
    }
}

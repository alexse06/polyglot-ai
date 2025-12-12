'use server';

import { generateText } from '@/lib/gemini';

export async function translateWord(word: string, contextSentence: string, targetLanguage: string = 'FR') {
    try {
        const prompt = `
        As a language expert, analyze the word "${word}" in the context of the sentence: "${contextSentence}".
        Provide the translation and grammatical details for a user whose native language is "${targetLanguage}".
        
        Return ONLY valid JSON with this structure:
        {
            "translation": "The translated word",
            "type": "noun/verb/adjective/etc",
            "gender": "masculine/feminine/neutral" (if applicable, else null),
            "explanation": "Brief explanation of meaning or usage in this context (max 10 words)"
        }
        `;

        const response = await generateText(prompt);
        // Clean markdown code blocks if present
        const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanResponse);

    } catch (error) {
        console.error("Translation error:", error);
        return null;
    }
}

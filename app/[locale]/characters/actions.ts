'use server';

import { getGeminiModel } from '@/lib/gemini';
import fs from 'fs/promises';
import path from 'path';

export async function getLanguageCharacters(languageCode: string) {
    const CACHE_DIR = path.join(process.cwd(), 'data', 'characters');
    const CACHE_FILE = path.join(CACHE_DIR, `${languageCode}.json`);

    // 1. Check Cache
    try {
        await fs.access(CACHE_FILE);
        const cachedData = await fs.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(cachedData);
    } catch (e) {
        // Cache miss, proceed to generation
    }

    const model = await getGeminiModel();

    // 2. Refined Prompt
    const prompt = `
    I need a structured guide to the writing system (alphabet/syllabary) for the language code "${languageCode}".
    
    If the language uses the Latin alphabet (EN, ES, FR, DE, IT, PT):
    Provide a JSON with "type": "LATIN" and a "groups" array containing "Special Characters" (accents, unique letters like ñ, ß, ç) and their pronunciation.
    
    If it is CHINESE (CN/ZH):
    - "type": "SCRIPT"
    - "scriptName": "Pinyin & Basics"
    - Provide 2 Groups: 
      1. "Initials" (b, p, m, f...) with pronunciation guide.
      2. "Finals" (a, o, e, i...) with pronunciation guide.
      3. "Tones" (visual representation if possible, or description).
      4. "Basic Radicals" (top 10 common radicals like Water, Person, Tree) with their Hanzi and meaning.
    
    If it is JAPANESE (JP/JA):
    - "type": "SCRIPT"
    - "scriptName": "Kana"
    - Provide 2 Groups:
      1. "Hiragana" (Complete basic 46 chart: あ-ん).
      2. "Katakana" (Complete basic 46 chart: ア-ン).
      
    If it is RUSSIAN (RU):
    - "type": "SCRIPT"
    - "scriptName": "Cyrillic"
    - Provide 3 Groups:
      1. "Vowels" (А, Е, Ё, И, О, У, Ы, Э, Ю, Я) with pronunciation.
      2. "Consonants" (Б, В, Г, Д, etc.) with pronunciation.
      3. "Signs" (Soft Sign Ь, Hard Sign Ъ).
    - ENSURE every character object has "symbol" and "romanization".
    
    JSON Format:
    {
        "type": "LATIN" | "SCRIPT",
        "scriptName": "Hiragana/Pinyin/etc",
        "description": "Brief overview.",
        "groups": [
            {
                "title": "Group Title",
                "characters": [
                    { "symbol": "あ", "romanization": "a", "pronunciation": "ah", "name": "optional" }
                ]
            }
        ]
    }
    
    Return ONLY JSON.
    `;

    try {
        console.log(`[Characters] Generating for ${languageCode}...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);

            // 3. Save to Cache
            try {
                await fs.mkdir(CACHE_DIR, { recursive: true });
                await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
                console.log(`[Characters] Cached data for ${languageCode}`);
            } catch (writeError) {
                console.error("Failed to write cache", writeError);
            }

            return data;
        }
        return null;
    } catch (e) {
        console.error("Character fetch failed", e);
        return null;
    }
}

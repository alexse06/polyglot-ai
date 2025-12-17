
import { generateAudio } from '../lib/gemini';
import { getConfig } from '../lib/languageConfig';

async function testTTS() {
    console.log("Testing TTS...");
    try {
        const text = "Bonjour, je suis Napoléon.";
        const voice = "Fenrir";
        const lang = "FR";

        console.log(`Generating audio for: "${text}" with voice ${voice} (${lang})`);

        // Test 1: Using current config
        const result = await generateAudio(text, lang, voice);

        if (result) {
            console.log("SUCCESS: Audio generated.");
            console.log("Mime:", result.mimeType);
            console.log("Data Length:", result.data.length);
        } else {
            console.error("FAILURE: result is null");
        }
    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
}

testTTS();

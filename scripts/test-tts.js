const fs = require('fs');
const path = require('path');

// Load env manually
try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.warn("Could not read .env.local");
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found in .env.local");
    process.exit(1);
}

async function testTTS() {
    const model = 'gemini-2.5-flash-preview-tts';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const text = "Hola, esto es una prueba de audio.";

    const payload = {
        contents: [
            {
                parts: [{ text: text }]
            }
        ],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: "Kore"
                    }
                }
            }
        }
    };

    console.log(`Requesting TTS from ${model}...`);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Status:", response.status);
            console.error("Error Body:", err);
            return;
        }

        const data = await response.json();
        console.log("Success!");
        console.log("Keys:", Object.keys(data));
        if (data.candidates && data.candidates[0]) {
            console.log("Candidate parts:", data.candidates[0].content?.parts);
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testTTS();

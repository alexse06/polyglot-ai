const { GoogleGenerativeAI } = require('@google/generative-ai');

const fs = require('fs');
const path = require('path');

let apiKey = '';
try {
    let envPath = path.resolve(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        envPath = path.resolve(__dirname, '..', '.env');
    }
    console.log("Reading env from:", envPath);
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim().replace(/^["']|["']$/g, '');
    }
} catch (e) {
    console.error("Could not read env", e);
}

if (!apiKey) apiKey = process.env.GEMINI_API_KEY;

if (apiKey) console.log("Key found starting with:", apiKey.substring(0, 5));
else { console.error("No key"); process.exit(1); }

const genAI = new GoogleGenerativeAI(apiKey);
// Use the alias used in the app
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

async function run() {
    console.log("Testing SDK with gemini-2.0-flash-exp for Audio...");
    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: "Hello, this is a test." }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: "Aoede"
                        }
                    }
                }
            }
        });

        const response = result.response;
        console.log("Response received.");
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            if (parts[0].inlineData) {
                console.log("Success! Audio data present.");
            } else {
                console.log("No audio data in response parts.");
            }
        } else {
            console.log("No candidates.");
        }

    } catch (e) {
        console.error("SDK Error:", e);
    }
}

run();

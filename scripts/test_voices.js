
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testVoice(voiceName, text, filename) {
    console.log(`Testing voice: ${voiceName} with text: "${text}"`);
    const model = "gemini-2.5-flash-preview-tts"; // As per config
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: voiceName
                    }
                }
            }
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].inlineData) {
            const audioData = data.candidates[0].content.parts[0].inlineData.data;
            const buffer = Buffer.from(audioData, 'base64');
            fs.writeFileSync(filename, buffer);
            console.log(`Saved audio to ${filename}`);
        } else {
            console.error("No audio data in response", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

async function main() {
    // Test Kore (Current ES)
    await testVoice("Kore", "Hola, me llamo Kore y hablo español.", "test_kore_es.mp3");
    // Test Puck
    await testVoice("Puck", "Hola, me llamo Puck y hablo español.", "test_puck_es.mp3");
    // Test Fenrir
    await testVoice("Fenrir", "Hola, me llamo Fenrir y hablo español.", "test_fenrir_es.mp3");
}

main();

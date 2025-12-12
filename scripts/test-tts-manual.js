
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
// require("dotenv").config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;

async function testVoice(voiceName, text, filename) {
    console.log(`Testing voice: ${voiceName} with text: "${text}"`);
    const model = "gemini-2.5-flash-preview-tts";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            responseMimeType: "audio/mp3",
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
        console.log("Full Response:", JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].inlineData) {
            const inlineData = data.candidates[0].content.parts[0].inlineData;
            console.log("MIME Type:", inlineData.mimeType);
            const audioData = inlineData.data;
            const buffer = Buffer.from(audioData, 'base64');
            fs.writeFileSync(filename, buffer);
            console.log(`Saved audio to ${filename}`);
        } else {
            console.error("No audio data in response");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

async function main() {
    console.log("Testing Kore voice with model gemini-2.5-flash-preview-tts...");
    await testVoice("Kore", "Hello, I am your English tutor.", "test_kore_en.mp3", "gemini-2.5-flash-preview-tts");
}

main();

const https = require('https');
const fs = require('fs');
const path = require('path');

let apiKey = '';
try {
    let envPath = path.resolve(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        envPath = path.resolve(__dirname, '..', '.env');
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim().replace(/^["']|["']$/g, '');
    }
} catch (e) {
    console.error("Could not read env", e);
    process.exit(1);
}

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

// User provided config
const MODEL_NAME = "gemini-2.5-flash-preview-tts";
const VOICE_NAME = "Achernar";
const LANGUAGE_CODE = "en-US";

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

const payload = {
    contents: [{ parts: [{ text: "Hello, this is a test of the specific configuration you requested." }] }],
    generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: VOICE_NAME
                }
            }
        }
    }
};

console.log("Testing User Config:");
console.log(`Model: ${MODEL_NAME}`);
console.log(`Voice: ${VOICE_NAME}`);
console.log(`Lang: ${LANGUAGE_CODE}`);

const req = https.request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        try {
            const json = JSON.parse(data);
            if (res.statusCode !== 200) {
                console.error("Error:", JSON.stringify(json, null, 2));
            } else {
                console.log("Success! Audio generated.");
            }
        } catch (e) {
            console.log("Raw Response:", data);
        }
    });
});

req.write(JSON.stringify(payload));
req.end();

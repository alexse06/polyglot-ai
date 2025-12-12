const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY missing");
    process.exit(1);
}

const model = 'gemini-2.0-flash-exp';
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const payload = {
    contents: [{ parts: [{ text: "Hello, this is a test." }] }],
    generationConfig: {
        responseModalities: ["TEXT"]
    }
};

console.log("Testing Gemini TTS with model:", model);
console.log("Voice:", "Aoede");

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
                console.error("Error Response:", JSON.stringify(json, null, 2));
            } else {
                const audio = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
                if (audio) {
                    console.log("Success! Audio data received.");
                } else {
                    console.log("Success response but no audio data found:", JSON.stringify(json, null, 2));
                }
            }
        } catch (e) {
            console.error("Raw Body:", data);
        }
    });
});

req.on('error', (e) => {
    console.error("Request Error:", e);
});

req.write(JSON.stringify(payload));
req.end();

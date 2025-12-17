'use server';

import { getGeminiModel } from '@/lib/gemini';
import { getCharacter } from '@/lib/chrono-characters';

export async function chatWithChronoCharacter(
    characterId: string,
    userMessage: string,
    history: { role: string; parts: string }[],
    language: string = "EN"
) {
    const character = getCharacter(characterId);
    if (!character) throw new Error("Character not found");

    const model = await getGeminiModel();

    const { getUserId } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');
    const userId = await getUserId();

    let targetLanguage = language;
    if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.learningLanguage) {
            // Convert code (e.g. 'ES') to name (e.g. 'Spanish') for the prompt
            const { getConfig } = await import('@/lib/languageConfig');
            targetLanguage = getConfig(user.learningLanguage).aiPrompt.targetLanguage;
        }
    }

    // Construct the System Prompt (Persona)
    const systemPrompt = `
    ACT AS: ${character.name} (${character.title}).
    CONTEXT: ${character.scenarioContext}
    
    Current User Language: ${targetLanguage}
    
    INSTRUCTIONS:
    1. Respond in ${targetLanguage} (but keep character flavor, e.g., French accent/words if Napoléon).
    2. Be URGENT and EMOTIONAL.
    3. Keep responses SHORT (maximum 2 sentences). This is a phone call.
    4. NEVER break character.
    5. Determine if the user solved your problem. If yes, say "[PROBLEM SOLVED]" at the end.
    6. IMPORTANT: Do NOT speak English unless the Current User Language IS English.
    `;

    // Format history for Gemini SDK
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts }]
    }));

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I am ready to act." }] },
            ...formattedHistory
        ] as any, // Cast to any to avoid strict typing issues with specific SDK versions if needed
    });

    try {
        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();
        return { success: true, text: responseText };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Call dropped." };
    }
}


export async function transcribeAudio(base64Audio: string, languageCode: string = "ES") {
    const { getUserId } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');
    const userId = await getUserId();

    let targetLangCode = languageCode;
    if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.learningLanguage) {
            targetLangCode = user.learningLanguage;
        }
    }

    // Reusing correctUserAudio for now as it gives us transcript
    const { correctUserAudio } = await import('@/lib/gemini');
    return await correctUserAudio(base64Audio, targetLangCode);
}


export async function generateChronoAudio(text: string, voiceId: string, language: string = "ES") {
    // FALLBACK: Use ElevenLabs because Gemini REST Audio is unavailable for 2.0/2.5 models.
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error("ElevenLabs API Key missing");
        return null; // Handle error gracefully
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2", // Better for mixed languages (Frida implies Spanish/French mix)
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("ElevenLabs TTS Error:", err);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return { data: base64, mimeType: "audio/mpeg" }; // ElevenLabs returns MP3 by default
    } catch (e) {
        console.error("ElevenLabs TTS Exception:", e);
        return null;
    }
}

export async function getElevenLabsKey() {
    return process.env.ELEVENLABS_API_KEY || null;
}

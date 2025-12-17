'use server';

import { revalidatePath } from 'next/cache';
import { correctUserAudio } from '@/lib/gemini';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";

export async function createVoice(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error("No file provided");
    }

    const data = new FormData();
    data.append('name', `User Clone ${Date.now()}`);
    data.append('files', file);
    data.append('description', 'User cloned voice for imitation app');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: data,
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("ElevenLabs Error:", error);
            throw new Error(`Failed to clone voice: ${error}`);
        }

        const json = await response.json();
        return { success: true, voiceId: json.voice_id };
    } catch (error) {
        console.error(error);
        return { success: false, error: String(error) };
    }
}

export async function generateClonedAudio(voiceId: string, text: string) {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`TTS Failed: ${error}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return { success: true, audio: `data:audio/mpeg;base64,${base64}` };

    } catch (error) {
        console.error(error);
        return { success: false, error: String(error) };
    }
}

export async function getElevenLabsKey() {
    return process.env.ELEVENLABS_API_KEY || null;
}

export async function correctAudioAction(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file");

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Fetch User Language
    const { getUserId } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');

    const userId = await getUserId();
    let userLanguage = "ES"; // Default

    if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.learningLanguage) {
            userLanguage = user.learningLanguage;
        }
    }

    // Default to 'ES' (Spanish) or pass from client. For now assumes Spanish context of app.
    return await correctUserAudio(base64, userLanguage);
}

export async function getUserLanguageName() {
    const { getUserId } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/db');
    const { getConfig } = await import('@/lib/languageConfig');

    const userId = await getUserId();
    if (!userId) return "Spanish"; // Default

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const langCode = user?.learningLanguage || "ES";
    const config = getConfig(langCode);
    return config.aiPrompt.targetLanguage; // e.g., "Japanese", "French"
}

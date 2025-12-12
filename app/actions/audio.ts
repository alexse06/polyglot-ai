'use server'

import { generateAudio } from '@/lib/gemini';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function getAudio(text: string, languageOverride?: string) {
    try {
        let language = "ES";
        if (languageOverride) {
            language = languageOverride;
        } else {
            const userId = await getUserId();
            if (userId) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user?.learningLanguage) language = user.learningLanguage;
            }
        }

        const audioBase64 = await generateAudio(text, language);
        return audioBase64; // Returns base64 string or null
    } catch (e) {
        console.error("Audio generation failed", e);
        return null;
    }
}

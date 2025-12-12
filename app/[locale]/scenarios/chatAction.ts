'use server'

import { generateConversationResponse } from '@/lib/gemini';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function sendScenarioMessage(
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    message: string,
    systemInstruction: string
) {
    // We pass the scenario's initialPrompt as the systemInstruction
    const userId = await getUserId();
    const learningLanguage = (await prisma.user.findUnique({ where: { id: userId || "" } }))?.learningLanguage || "ES";

    return await generateConversationResponse(history, message, systemInstruction, learningLanguage);
}

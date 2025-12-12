'use server'

import { generateConversationResponse } from '@/lib/gemini';
import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/auth';

export async function sendMessage(history: { role: "user" | "model"; parts: { text: string }[] }[], message: string) {
    try {
        const userId = await getUserId();

        // 1. Get or Create Conversation
        let conversationId: string | undefined;

        // Default to ES if anything fails (though user should exist)
        const learningLanguage = (await prisma.user.findUnique({ where: { id: userId || "" } }))?.learningLanguage || "ES";

        if (userId) {
            // Find the most recent active conversation or create one
            let conversation = await prisma.conversation.findFirst({
                where: { userId, language: learningLanguage }, // Filter by language
                orderBy: { updatedAt: 'desc' }
            });

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: { userId, language: learningLanguage }
                });
            }
            conversationId = conversation.id;

            // Save User Message
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'user',
                    content: message
                }
            });

            // Award small XP for chatting (e.g. 1 XP per message)
            const crypto = require('crypto'); // simple import if needed or just use import at top
            try {
                await import('@/lib/progress').then(p => p.addXP(userId, learningLanguage, 1));
            } catch (e) { console.error("XP Error", e); }
        }

        const response = await generateConversationResponse(history, message, undefined, learningLanguage);

        // response is now { text, correction, suggestions } or a fallback object

        if (userId && conversationId) {
            // Save AI Message (Text + Transliteration)
            await prisma.message.create({
                data: {
                    conversationId: conversationId,
                    role: 'model',
                    content: response.text || (typeof response === 'string' ? response : ""),
                    transliteration: response.transliteration // Save it!
                }
            });
        }

        return response; // Return full object to client
    } catch (error) {
        console.error("Error in chat:", error);
        // Use a generic English fallback or try to detect language if possible,
        // but since we are in a catch block, we might not have 'learningLanguage' easily if it failed before fetching it.
        // However, we fetched it early in the function.
        // We'll assume 'learningLanguage' variable is available from the scope key,
        // but 'learningLanguage' is defined inside the try block.
        // We need to move the definition out or use a safe default.
        return {
            text: "Error: Could not process message. (Erreur technique)",
            transliteration: null,
            correction: null,
            suggestions: []
        };
    }
}

export async function getChatHistory() {
    const userId = await getUserId();
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const learningLanguage = user?.learningLanguage || "ES";

    const conversation = await prisma.conversation.findFirst({
        where: { userId, language: learningLanguage },
        orderBy: { updatedAt: 'desc' },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!conversation) return [];

    return conversation.messages.map((m: { role: string; content: string; transliteration?: string | null }) => ({
        role: m.role as 'user' | 'model',
        content: m.content,
        transliteration: m.transliteration
    }));
}

export async function clearChatHistory() {
    const userId = await getUserId();
    if (!userId) return;

    await prisma.conversation.deleteMany({
        where: { userId }
    });

    // revalidatePath('/chat');
}

export async function getUserLanguage() {
    const userId = await getUserId();
    if (!userId) return "ES";
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.learningLanguage || "ES";
}

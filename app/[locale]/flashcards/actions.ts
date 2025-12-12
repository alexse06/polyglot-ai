'use server'

import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/auth';

export async function getDueFlashcards() {
    const userId = await getUserId();
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const learningLanguage = user?.learningLanguage || "ES";

    const now = new Date();
    return await prisma.userFlashcard.findMany({
        where: {
            userId,
            language: learningLanguage, // Filter by language
            nextReview: { lte: now }
        },
        orderBy: { nextReview: 'asc' },
        take: 20 // Limit review session size
    });
}

// SM-2 Algorithm Implementation
export async function reviewFlashcard(cardId: string, rating: number) {
    // rating: 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
    // Map to quality: 0-5 scale roughly
    // let's simplify: 
    // 1 (Forgotten/Wrong) -> Reset
    // 2 (Hard) -> Interval * 1.2
    // 3 (Good) -> Interval * 2.5

    const userId = await getUserId();
    if (!userId) return;

    const card = await prisma.userFlashcard.findUnique({ where: { id: cardId } });
    if (!card) return;

    let { interval, repetition, easeFactor } = card;

    if (rating === 1) { // Wrong/Forgotten
        repetition = 0;
        interval = 1;
    } else {
        if (rating === 2) { // Hard
            interval = Math.max(1, Math.floor(interval * 1.2));
            easeFactor = Math.max(1.3, easeFactor - 0.15);
        } else if (rating === 3) { // Easy/Good
            if (repetition === 0) interval = 1;
            else if (repetition === 1) interval = 6;
            else interval = Math.floor(interval * easeFactor);

            repetition++;
            easeFactor += 0.1;
        }
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    await prisma.userFlashcard.update({
        where: { id: cardId },
        data: {
            interval,
            repetition,
            easeFactor,
            nextReview
        }
    });

    // Also award XP for reviewing!
    if (rating > 1) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const language = user?.learningLanguage || "ES";
        try {
            const { addXP } = await import('@/lib/progress');
            await addXP(userId, language, 5); // 5 XP per review
        } catch (e) {
            console.error("XP Error", e);
        }
    }

    return { success: true };
}

export async function createFlashcard(front: string, back: string) {
    const userId = await getUserId();
    if (!userId) return;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const learningLanguage = user?.learningLanguage || "ES";

    // Check duplicate
    const existing = await prisma.userFlashcard.findFirst({
        where: { userId, front, language: learningLanguage }
    });

    if (existing) return;

    await prisma.userFlashcard.create({
        data: {
            userId,
            front,
            back,
            language: learningLanguage,
            nextReview: new Date() // Due immediately
        }
    });
}

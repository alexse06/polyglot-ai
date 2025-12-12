
import { prisma } from '@/lib/db';

export async function ensureUserLanguageProgress(userId: string, language: string) {
    let progress = await prisma.userLanguageProgress.findUnique({
        where: {
            userId_language: {
                userId,
                language
            }
        }
    });

    if (!progress) {
        progress = await prisma.userLanguageProgress.create({
            data: {
                userId,
                language,
                xp: 0,
                level: "A1",
                streak: 0
            }
        });
    }

    return progress;
}

export async function getUserProgress(userId: string, language: string) {
    return ensureUserLanguageProgress(userId, language);
}

export async function addXP(userId: string, language: string, amount: number) {
    const progress = await ensureUserLanguageProgress(userId, language);
    return prisma.userLanguageProgress.update({
        where: { id: progress.id },
        data: { xp: { increment: amount } }
    });
}

'use server'

import { prisma } from '@/lib/db';
import { getUserId, logout } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Profile Stats
export async function getUserProfile() {
    const userId = await getUserId();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            languageProgress: true, // Fetch progress
            _count: {
                select: { lessonProgress: { where: { completed: true } } }
            },
            lessonProgress: {
                where: { completed: true },
                select: { completedAt: true },
                orderBy: { completedAt: 'desc' },
                take: 1
            }
        }
    });

    if (!user) return null;

    const lang = user.learningLanguage || "ES";
    const progress = user.languageProgress.find(p => p.language === lang);
    const level = progress?.level || "A1";
    const xp = progress?.xp || 0;
    const streak = progress?.streak || 0;

    // Level Logic 
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentLevelIndex = levels.indexOf(level);
    const nextLevel = levels[currentLevelIndex + 1] || null;

    // XP progress to next level (generic logic)
    const xpForNextLevel = (currentLevelIndex + 1) * 1000;
    const xpProgress = Math.min(100, Math.floor((xp % 1000) / 10)); // Simplified

    // Map new variables to old expected names where possible or update return
    // The UI likely expects: nextLevel, xpProgress (or progressPercent?), xpThresholds?
    // Let's provide what the updated UI (if updated) or old UI needs.
    // Assuming we want:
    const nextLevelXP = xpForNextLevel;
    const progressPercent = xpProgress;
    const canUpgrade = nextLevel && xp >= nextLevelXP;

    return {
        ...user,
        level,
        xp,
        streak,
        nextLevel,
        nextLevelXP,
        progressPercent,
        canUpgrade,
        xpval: xp,
        xpTarget: xpForNextLevel
    };
}

export async function updateUserLevel(level: string) {
    const userId = await getUserId();
    if (!userId) return;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const lang = user?.learningLanguage || "ES";

    await prisma.userLanguageProgress.upsert({
        where: { userId_language: { userId, language: lang } },
        update: { level },
        create: { userId, language: lang, level }
    });

    revalidatePath('/dashboard');
    revalidatePath('/profile');
}

export async function updateUserLanguage(language: string) {
    const userId = await getUserId();
    if (!userId) return;

    await prisma.user.update({
        where: { id: userId },
        data: { learningLanguage: language }
    });
    revalidatePath('/', 'layout');
}

export async function resetUserProgress() {
    const userId = await getUserId();
    if (!userId) return;

    await prisma.userLessonProgress.deleteMany({
        where: { userId }
    });

    // Reset all language progress
    await prisma.userLanguageProgress.updateMany({
        where: { userId },
        data: { xp: 0, streak: 0, level: 'A1', lastStudyDate: null }
    });

    // Reset global user lastActive if needed, but keeping it is fine.
    // Ensure we don't try to set level/xp on User


    revalidatePath('/dashboard');
    revalidatePath('/profile');
}

export async function logOutAction() {
    await logout();
    redirect('/login');
}

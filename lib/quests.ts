import { prisma } from '@/lib/db';
import { addXP } from '@/lib/progress';

export async function generateDailyQuests(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check existing
    const existing = await prisma.dailyQuest.findMany({
        where: {
            userId,
            date: { gte: today }
        }
    });

    if (existing.length > 0) return existing;

    // Generate new ones
    // 1. Complete a lesson
    // 2. Chat for 5 messages
    // 3. Earn 50 XP
    const newQuests = [
        { type: 'LESSON', target: 1 },
        { type: 'CHAT', target: 5 },
        { type: 'XP', target: 50 }
    ];

    const created = [];
    for (const q of newQuests) {
        const quest = await prisma.dailyQuest.create({
            data: {
                userId,
                type: q.type,
                target: q.target,
                date: new Date()
            }
        });
        created.push(quest);
    }

    return created;
}

export async function claimQuestReward(questId: string, userId: string) {
    const quest = await prisma.dailyQuest.findUnique({
        where: { id: questId }
    });

    if (!quest || quest.userId !== userId || !quest.completed || quest.claimed) {
        return null;
    }

    // Mark claimed
    await prisma.dailyQuest.update({
        where: { id: questId },
        data: { claimed: true }
    });

    // Add XP
    const reward = getQuestReward(quest.type);

    // We guess language for now as global XP, or fetch user preference.
    // Ideally quests should be language agnostic or tied to current.
    // For simplicity, we assume 'ES' or fetch user's generic profile.
    // But addXP requires language. Let's fetch user.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const lang = user?.learningLanguage || 'ES';

    await addXP(userId, lang, reward);

    return reward;
}

export function getQuestDescription(type: string, target: number): string {
    switch (type) {
        case 'LESSON': return `Terminer ${target} leçon${target > 1 ? 's' : ''}`;
        case 'CHAT': return `Échanger ${target} messages avec l'IA`;
        case 'XP': return `Gagner ${target} XP`;
        case 'STREAK': return `Atteindre une série de ${target} jours`;
        default: return 'Objectif mystère';
    }
}

export function getQuestReward(type: string): number {
    switch (type) {
        case 'LESSON': return 20;
        case 'CHAT': return 15;
        case 'XP': return 10;
        case 'STREAK': return 50;
        default: return 10;
    }
}

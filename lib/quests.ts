import { prisma } from './db';

const QUEST_TYPES = [
    { type: 'CHAT', target: 5, xp: 50, description: 'Send 5 messages in Chat' }, // Send 5 messages
    { type: 'LESSON', target: 1, xp: 100, description: 'Complete 1 Lesson' }, // Finish 1 lesson
    { type: 'XP', target: 50, xp: 30, description: 'Earn 50 XP' }, // Earn 50 XP
    { type: 'STREAK', target: 1, xp: 20, description: 'Maintain your streak' } // Login (auto-complete)
];

export async function generateDailyQuests(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if quests exist for today
    const existingQuests = await prisma.dailyQuest.findMany({
        where: {
            userId: userId,
            date: {
                gte: today
            }
        }
    });

    if (existingQuests.length > 0) {
        return existingQuests;
    }

    // Generate 3 random quests
    // Use a simple random selection for now
    const shuffled = [...QUEST_TYPES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const newQuests = [];
    for (const quest of selected) {
        const created = await prisma.dailyQuest.create({
            data: {
                userId,
                type: quest.type,
                target: quest.target,
                progress: quest.type === 'STREAK' ? 1 : 0, // Auto-complete streak on generation (login)
                completed: quest.type === 'STREAK', // Auto-complete streak
                date: new Date()
            }
        });
        newQuests.push(created);
    }

    return newQuests;
}

export async function updateQuestProgress(userId: string, type: string, amount: number = 1) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const quests = await prisma.dailyQuest.findMany({
        where: {
            userId,
            type,
            date: { gte: today },
            completed: false
        }
    });

    for (const quest of quests) {
        const newProgress = quest.progress + amount;
        const isCompleted = newProgress >= quest.target;

        await prisma.dailyQuest.update({
            where: { id: quest.id },
            data: {
                progress: newProgress,
                completed: isCompleted
            }
        });
    }
}

export async function claimQuestReward(questId: string, userId: string) {
    const quest = await prisma.dailyQuest.findUnique({
        where: { id: questId, userId }
    });

    if (!quest || !quest.completed || quest.claimed) return null;

    // Find reward XP based on type
    const questDef = QUEST_TYPES.find(q => q.type === quest.type);
    const xpReward = questDef ? questDef.xp : 20;

    // Update quest as claimed
    await prisma.dailyQuest.update({
        where: { id: questId },
        data: { claimed: true }
    });

    // Award XP to user (UserLanguageProgress)
    // Note: We need to know WHICH language to award.
    // Ideally, award to the *current* learning language or 'User' global XP if we had one.
    // For now, let's fetch the user's current learning language and award it there.

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { languageProgress: true }
    });

    if (user) {
        const currentLang = user.learningLanguage || 'EN';
        const { addXP } = await import('./progress');
        await addXP(userId, currentLang, xpReward);
    }

    return xpReward;
}

export function getQuestDescription(type: string, target: number) {
    const def = QUEST_TYPES.find(q => q.type === type);
    if (!def) return 'Unknown Quest';
    return def.description.replace(def.target.toString(), target.toString());
}

export function getQuestReward(type: string) {
    const def = QUEST_TYPES.find(q => q.type === type);
    return def ? def.xp : 0;
}

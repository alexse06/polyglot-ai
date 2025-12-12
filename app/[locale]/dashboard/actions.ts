'use server';

import { generateDailyQuests, claimQuestReward as claimRewardLib, getQuestDescription, getQuestReward } from '@/lib/quests';
import { revalidatePath } from 'next/cache';
import { getOrCreateUser } from '@/lib/auth';

export async function getDashboardQuests() {
    const user = await getOrCreateUser();
    if (!user) return [];

    const quests = await generateDailyQuests(user.id);

    // Format for client
    return quests.map((q: any) => ({
        id: q.id,
        type: q.type,
        description: getQuestDescription(q.type, q.target),
        target: q.target,
        progress: q.progress,
        completed: q.completed,
        claimed: q.claimed,
        reward: getQuestReward(q.type)
    }));
}

export async function claimQuestReward(questId: string) {
    const user = await getOrCreateUser();
    if (!user) return false;

    const reward = await claimRewardLib(questId, user.id);
    if (reward) {
        revalidatePath('/dashboard');
        return true;
    }
    return false;
}

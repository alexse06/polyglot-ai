'use client';

import { useState } from 'react';
import { Trophy, CheckCircle, Circle, Flame, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import { claimQuestReward } from '@/app/[locale]/dashboard/actions'; // We will create this server action next

interface Quest {
    id: string;
    type: string;
    description: string;
    target: number;
    progress: number;
    completed: boolean;
    claimed: boolean;
    reward: number; // XP
}

interface Props {
    quests: Quest[];
}

import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';

export function DailyQuestsWidget({ quests: initialQuests }: Props) {
    const t = useTranslations('Quests');
    const router = useRouter();
    const [quests, setQuests] = useState(initialQuests);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const handleClaim = async (questId: string) => {
        setLoadingMap(prev => ({ ...prev, [questId]: true }));
        try {
            const success = await claimQuestReward(questId);
            if (success) {
                // Update local state to show as claimed
                setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));

                // Trigger confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                // Refresh Server Components to update Header XP
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to claim quest", error);
        } finally {
            setLoadingMap(prev => ({ ...prev, [questId]: false }));
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <Flame className="text-orange-500" size={24} fill="currentColor" />
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    {t('title')}
                </h3>
            </div>

            <div className="space-y-4">
                {quests.map((quest) => (
                    <div key={quest.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold text-sm text-gray-200">{t(quest.type, { target: quest.target })}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{t('reward')}: <span className="text-yellow-400 font-bold">+{quest.reward} XP</span></p>
                            </div>
                            {quest.claimed ? (
                                <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded flex items-center gap-1">
                                    <CheckCircle size={12} /> {t('claimed')}
                                </span>
                            ) : quest.completed ? (
                                <button
                                    onClick={() => handleClaim(quest.id)}
                                    disabled={loadingMap[quest.id]}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition animate-pulse"
                                >
                                    <Sparkles size={12} /> {t('claim')}
                                </button>
                            ) : (
                                <span className="text-gray-500 text-xs">
                                    {quest.progress} / {quest.target}
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={twMerge("h-full transition-all duration-500", quest.completed ? "bg-green-500" : "bg-blue-500")}
                                style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

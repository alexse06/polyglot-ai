'use client'

import { useState, useEffect } from 'react';
import { getUserProfile, updateUserLevel, resetUserProgress, logOutAction, updateUserLanguage } from './actions';
import { LANGUAGE_CONFIG } from '@/lib/languageConfig';
import Link from 'next/link';
import { ArrowLeft, Trash2, LogOut, Settings, Award, Globe, Check, Flame, Clock, Trophy, Zap, Crown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import ActivityHeatmap from '@/components/ui/ActivityHeatmap';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserProfile().then(u => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    const handleLevelChange = async (newLevel: string) => {
        setUser((prev: any) => ({ ...prev, level: newLevel }));
        await updateUserLevel(newLevel);
    };

    const handleReset = async () => {
        if (confirm("Are you sure? This will wipe all progress.")) {
            await resetUserProgress();
            window.location.reload();
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-purple-500 animate-spin"></div>
                <p className="text-gray-500 font-mono animate-pulse">Loading Profile Data...</p>
            </div>
        </div>
    );

    if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Error loading profile.</div>;

    const activityDates = user.lessonProgress?.map((p: any) => p.completedAt) || [];

    return (
        <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
            <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 relative z-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" /> Back to Dashboard
                </Link>

                {/* Profile Header Card */}
                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 md:p-12 mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-20">
                        {/* Avatar Container - Centered on mobile */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-gray-800 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-2xl relative z-10">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-2 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full border-2 border-black shadow-lg flex items-center gap-1 z-20">
                                <Crown size={12} className="fill-black" />
                                <span className="whitespace-nowrap">LVL {user.level}</span>
                            </div>
                        </div>

                        {/* Info Container - Centered on mobile, Left on Desktop */}
                        <div className="text-center md:text-left space-y-3 flex-1 w-full min-w-0">
                            <div className="space-y-1">
                                <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 truncate px-2 md:px-0">
                                    {user.name || 'Polyglot User'}
                                </h1>
                                <p className="text-gray-400 font-medium text-sm sm:text-base truncate px-4 md:px-0">{user.email}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                <div className="px-4 py-2 rounded-xl bg-gray-800/50 border border-white/5 flex items-center gap-2 shrink-0">
                                    <Flame className="text-orange-500 fill-orange-500" size={18} />
                                    <span className="font-bold text-orange-400 text-sm sm:text-base whitespace-nowrap">{user.streak || 0} Streak</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-gray-800/50 border border-white/5 flex items-center gap-2 shrink-0">
                                    <Zap className="text-yellow-500 fill-yellow-500" size={18} />
                                    <span className="font-bold text-yellow-400 text-sm sm:text-base whitespace-nowrap">{user.xp} XP</span>
                                </div>
                            </div>
                        </div>

                        {/* Logout (Desktop Only) */}
                        <button
                            onClick={() => logOutAction()}
                            className="hidden md:flex shrink-0 items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition font-bold"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* XP Progress */}
                        {user.nextLevel && (
                            <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-200 flex items-center gap-2">
                                            <Trophy className="text-yellow-500" size={18} /> Next Milestone: {user.nextLevel}
                                        </h3>
                                    </div>
                                    <span className="text-sm font-mono text-purple-400">
                                        {Math.round(user.progressPercent)}%
                                    </span>
                                </div>

                                <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-1000"
                                        style={{ width: `${user.progressPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 text-right">
                                    {user.canUpgrade ? "Ready to upgrade!" : `${user.nextLevelXP - user.xp} XP remaining`}
                                </p>

                                {user.canUpgrade && (
                                    <button
                                        onClick={() => handleLevelChange(user.nextLevel)}
                                        className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:scale-[1.02] transition shadow-lg shadow-yellow-500/20 animate-pulse"
                                    >
                                        Level Up to {user.nextLevel}! 🚀
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Activity Heatmap */}
                        <div className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-1 overflow-hidden">
                            <ActivityHeatmap dates={activityDates} />
                        </div>
                    </div>

                    {/* Sidebar / Settings Column */}
                    <div className="space-y-6">
                        {/* Language Selector */}
                        <section className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-200">
                                <Globe size={18} className="text-blue-400" /> Target Language
                            </h2>
                            <div className="space-y-2">
                                {Object.values(LANGUAGE_CONFIG).map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setUser((prev: any) => ({ ...prev, learningLanguage: lang.code }));
                                            updateUserLanguage(lang.code);
                                        }}
                                        className={twMerge(
                                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group text-left",
                                            user.learningLanguage === lang.code
                                                ? "bg-blue-600/20 border-blue-500/50 text-white"
                                                : "bg-black/20 border-transparent hover:bg-white/5 text-gray-400"
                                        )}
                                    >
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className="font-medium flex-1">{lang.label}</span>
                                        {user.learningLanguage === lang.code && <Check size={16} className="text-blue-400" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Level Selector */}
                        <section className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-200">
                                <Settings size={18} className="text-gray-400" /> Difficulty Level
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { lvl: 'A1', label: 'Beginner', desc: 'Slow speech, basic words.', color: 'border-green-500/30 bg-green-500/5 text-green-400' },
                                    { lvl: 'A2', label: 'Elementary', desc: 'Simple daily topics.', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
                                    { lvl: 'B1', label: 'Intermediate', desc: 'Natural pace, more vocab.', color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' },
                                    { lvl: 'B2', label: 'Upper Int.', desc: 'Fluent, complex ideas.', color: 'border-orange-500/30 bg-orange-500/5 text-orange-400' },
                                    { lvl: 'C1', label: 'Advanced', desc: 'Full fluency & nuance.', color: 'border-red-500/30 bg-red-500/5 text-red-400' }
                                ].map(item => (
                                    <button
                                        key={item.lvl}
                                        onClick={() => handleLevelChange(item.lvl)}
                                        className={twMerge(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 text-left group hover:scale-[1.02]",
                                            user.level === item.lvl
                                                ? `bg-gray-800 border-white/20 shadow-lg ${item.color.replace('text-', 'ring-1 ring-')}`
                                                : "bg-black/20 border-transparent hover:bg-white/5"
                                        )}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={twMerge("font-bold text-lg", item.color.split(' ').pop())}>{item.lvl}</span>
                                                <span className="text-sm font-medium text-gray-300">{item.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        {user.level === item.lvl && (
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-black shadow-lg">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6">
                            <h2 className="text-sm font-bold flex items-center gap-2 mb-3 text-red-400 uppercase tracking-wider">
                                <Trash2 size={14} /> Danger Zone
                            </h2>
                            <button
                                onClick={handleReset}
                                className="w-full py-2 rounded-lg border border-red-500/30 text-red-500/80 hover:bg-red-500/10 hover:text-red-400 transition text-sm font-medium"
                            >
                                Reset Progress
                            </button>
                        </section>

                        <button
                            onClick={() => logOutAction()}
                            className="md:hidden w-full py-4 rounded-2xl bg-gray-900 text-gray-400 font-bold flex items-center justify-center gap-2"
                        >
                            <LogOut size={20} /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

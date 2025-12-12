'use client'

import { useState, useEffect } from 'react';
import { getUserProfile, updateUserLevel, resetUserProgress, logOutAction, updateUserLanguage } from './actions';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, LogOut, Settings, Award, Globe, Check, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import ActivityHeatmap from '@/components/ui/ActivityHeatmap';

export default function ProfilePage() {
    const router = useRouter();
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
        if (confirm("Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible.")) {
            await resetUserProgress();
            window.location.reload();
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Chargement...</div>;
    if (!user) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Erreur.</div>;

    const activityDates = user.lessonProgress?.map((p: any) => p.completedAt) || [];

    return (
        <div className="min-h-screen text-white p-6 pb-24">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 glass-button px-4 py-2 rounded-full">
                <ArrowLeft size={20} /> Retour au Dashboard
            </Link>

            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl font-bold text-black border-4 border-white/20 shadow-xl shadow-yellow-500/20">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{user.name || 'Utilisateur'}</h1>
                        <p className="text-gray-400">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold border border-yellow-500/50">
                                Niveau {user.level}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-sm font-bold border border-blue-500/50">
                                {user.xp} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Level Progress */}
                {user.nextLevel && (
                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                                style={{ width: `${user.progressPercent}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-end mb-2 mt-2">
                            <div>
                                <h3 className="font-bold text-lg text-gray-200">Prochain Niveau : {user.nextLevel}</h3>
                                <p className="text-gray-400 text-sm">
                                    {user.canUpgrade
                                        ? "Vous êtes prêt pour le niveau supérieur !"
                                        : `Encore ${user.nextLevelXP - user.xp} XP pour atteindre le niveau ${user.nextLevel}`
                                    }
                                </p>
                            </div>
                            <Award className={twMerge("w-8 h-8", user.canUpgrade ? "text-yellow-400 animate-bounce" : "text-gray-600")} />
                        </div>

                        {user.canUpgrade ? (
                            <button
                                onClick={() => handleLevelChange(user.nextLevel)}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:scale-[1.02] transition shadow-lg shadow-yellow-500/20 animate-pulse-glow"
                            >
                                Passer au niveau {user.nextLevel} ! 🚀
                            </button>
                        ) : (
                            <div className="w-full h-3 bg-gray-800 rounded-full mt-4 overflow-hidden">
                                <div
                                    className="h-full bg-gray-600 transition-all duration-1000"
                                    style={{ width: `${user.progressPercent}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}

                <ActivityHeatmap dates={activityDates} />

                <section className="glass-card rounded-2xl p-6 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="text-gray-400" /> Préférences
                    </h2>

                    <div className="bg-gray-800/30 rounded-xl p-4">
                        <label className="block text-sm text-gray-400 mb-2">Niveau CECRL Cible</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => handleLevelChange(lvl)}
                                    className={twMerge(
                                        "py-2 rounded-lg font-bold transition",
                                        user.level === lvl
                                            ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                                            : "glass-button text-gray-300 hover:bg-white/10"
                                    )}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="glass-card rounded-2xl p-6 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Globe className="text-blue-400" /> Langue d'Apprentissage
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={async () => {
                                setUser((prev: any) => ({ ...prev, learningLanguage: 'ES' }));
                                await updateUserLanguage('ES');
                                router.refresh();
                            }}
                            className={twMerge(
                                "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                                user.learningLanguage === 'ES'
                                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-100 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                                    : "bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <span className="text-4xl drop-shadow-md grayscale group-hover:grayscale-0 transition-all duration-300">🇪🇸</span>
                                <div className="text-left">
                                    <span className={twMerge("block font-bold text-lg", user.learningLanguage === 'ES' ? "text-yellow-400" : "text-gray-300")}>Espagnol</span>
                                </div>
                            </div>
                            {user.learningLanguage === 'ES' && (
                                <div className="bg-yellow-500/20 p-1.5 rounded-full border border-yellow-500/30">
                                    <Check size={18} className="text-yellow-400" />
                                </div>
                            )}
                            {user.learningLanguage === 'ES' && (
                                <div className="absolute inset-0 bg-yellow-500/5 blur-xl group-hover:bg-yellow-500/10 transition-colors"></div>
                            )}
                        </button>

                        <button
                            onClick={async () => {
                                setUser((prev: any) => ({ ...prev, learningLanguage: 'EN' }));
                                await updateUserLanguage('EN');
                                router.refresh();
                            }}
                            className={twMerge(
                                "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                                (user.learningLanguage === 'EN' || !user.learningLanguage)
                                    ? "bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                                    : "bg-gray-800/30 border-gray-700/50 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <span className="text-4xl drop-shadow-md grayscale group-hover:grayscale-0 transition-all duration-300">🇬🇧</span>
                                <div className="text-left">
                                    <span className={twMerge("block font-bold text-lg", (user.learningLanguage === 'EN' || !user.learningLanguage) ? "text-blue-400" : "text-gray-300")}>Anglais</span>
                                    <span className="text-xs opacity-60">Langue par défaut</span>
                                </div>
                            </div>
                            {(user.learningLanguage === 'EN' || !user.learningLanguage) && (
                                <div className="bg-blue-500/20 p-1.5 rounded-full border border-blue-500/30">
                                    <Check size={18} className="text-blue-400" />
                                </div>
                            )}
                            {(user.learningLanguage === 'EN' || !user.learningLanguage) && (
                                <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                            )}
                        </button>
                    </div>
                </section>

                <section className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-red-500">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                        <Trash2 /> Zone Danger
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Réinitialiser votre progression effacera tout votre XP, vos séries et l'historique de vos leçons.
                    </p>
                    <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500/10 transition font-bold"
                    >
                        Réinitialiser ma progression
                    </button>
                </section>

                <div className="grid grid-cols-2 gap-4">
                    <Link href="/legal" className="py-4 rounded-2xl glass-card text-gray-300 hover:bg-white/10 hover:text-white transition font-bold flex items-center justify-center gap-2">
                        <Shield size={20} /> Mentions Légales
                    </Link>
                    <button
                        onClick={() => logOutAction()}
                        className="py-4 rounded-2xl glass-card text-gray-300 hover:bg-white/10 hover:text-white transition font-bold flex items-center justify-center gap-2"
                    >
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </div>
        </div>
    );
}

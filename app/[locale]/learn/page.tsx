export const dynamic = 'force-dynamic';

import { getLessons, generateNextLessonAction } from './actions';
import Link from 'next/link';
import { CheckCircle, Lock, Play, Star, Sparkles, BookOpen, ArrowLeft, Trophy } from 'lucide-react';
import { GenerateButton } from './GenerateButton';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import LearningLanguageToggler from '@/components/LearningLanguageToggler';

export default async function LearnPage() {
    const lessonsData = await getLessons();
    const lessons: any[] = lessonsData;

    const { getConfig } = await import('@/lib/languageConfig');
    const { getOrCreateUser } = await import('@/lib/auth');
    const user = await getOrCreateUser();
    const learningLang = user?.learningLanguage || 'ES';
    const config = getConfig(learningLang);

    // Calculate total progress
    const completedCount = lessons.filter(l => l.progress.length > 0 && l.progress[0].completed).length;
    const progressPercentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    return (
        <div className="min-h-screen text-white pb-20 bg-black">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none fixed"></div>
            <div className="absolute top-0 left-0 w-full h-96 bg-yellow-500/5 blur-[100px] pointer-events-none fixed"></div>

            {/* Header */}
            <header className="fixed top-0 w-full z-20 backdrop-blur-xl bg-black/50 border-b border-white/5 px-4 py-4 md:px-6 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        Leçons
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">
                            {config.label}
                        </span>
                    </h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/characters" className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition" title="Alphabet / Écriture">
                        <BookOpen size={20} />
                    </Link>
                </div>
            </header>

            <main className="pt-24 max-w-2xl mx-auto px-4 space-y-8 relative z-10">

                {/* Hero Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-2">
                        <Trophy size={14} /> Parcours A1
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        Maîtrisez <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{config.label}</span>
                    </h2>

                    {/* Progress Bar */}
                    <div className="max-w-xs mx-auto mt-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>Progression</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Timeline / Course List */}
                <div className="relative space-y-8 pl-4 sm:pl-0">
                    {/* Vertical Line */}
                    <div className="absolute left-[34px] sm:left-[28px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-yellow-500/50 via-gray-800 to-gray-900 -z-10 hidden sm:block"></div>

                    {lessons.map((lesson, index) => {
                        const isCompleted = lesson.progress.length > 0 && lesson.progress[0].completed;
                        const isUnlocked = index === 0 || (lessons[index - 1].progress.length > 0 && lessons[index - 1].progress[0].completed);

                        return (
                            <div key={lesson.id} className="relative flex flex-col sm:flex-row items-center gap-6 group/item">

                                {/* Timeline Node (Desktop) */}
                                <div className={`hidden sm:flex shrink-0 w-14 h-14 rounded-full items-center justify-center border-4 z-10 transition-all duration-500 ${isCompleted
                                        ? "bg-black border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                                        : isUnlocked
                                            ? "bg-gray-900 border-white text-white animate-pulse-glow"
                                            : "bg-black border-gray-800 text-gray-600"
                                    }`}>
                                    {isCompleted ? <CheckCircle size={24} fill="currentColor" className="text-black" /> : isUnlocked ? <span className="font-bold text-lg">{index + 1}</span> : <Lock size={20} />}
                                </div>

                                <Link
                                    href={isUnlocked ? `/learn/${lesson.id}` : '#'}
                                    className={twMerge(
                                        "flex-1 w-full p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                                        isCompleted
                                            ? "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10"
                                            : isUnlocked
                                                ? "bg-gray-900/80 border-white/20 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1"
                                                : "bg-gray-900/50 border-white/5 opacity-50 grayscale cursor-not-allowed"
                                    )}
                                >
                                    {/* Mobile Node Indicator */}
                                    <div className={`sm:hidden absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center border ${isCompleted ? "bg-yellow-500 border-yellow-500 text-black" : isUnlocked ? "bg-white text-black border-white" : "bg-transparent border-gray-700 text-gray-700"
                                        }`}>
                                        {isCompleted ? <CheckCircle size={16} /> : isUnlocked ? <span className="font-bold text-xs">{index + 1}</span> : <Lock size={14} />}
                                    </div>

                                    <div className="pr-10 sm:pr-0">
                                        <h3 className={twMerge(
                                            "font-bold text-lg mb-1 transition-colors",
                                            isUnlocked ? "text-white group-hover/item:text-yellow-400" : "text-gray-500"
                                        )}>
                                            {lesson.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2">{lesson.description}</p>
                                    </div>

                                    {isUnlocked && !isCompleted && (
                                        <div className="mt-4 flex items-center text-xs font-bold text-yellow-400 uppercase tracking-wider">
                                            Start Lesson <ArrowLeft className="rotate-180 ml-1 w-3 h-3 group-hover/item:translate-x-1 transition-transform" />
                                        </div>
                                    )}

                                    {isCompleted && (
                                        <div className="absolute bottom-4 right-4 flex gap-1">
                                            <Star size={14} className="text-yellow-500 fill-yellow-500 animate-in zoom-in delay-100" />
                                            <Star size={14} className="text-yellow-500 fill-yellow-500 animate-in zoom-in delay-200" />
                                            <Star size={14} className="text-yellow-500 fill-yellow-500 animate-in zoom-in delay-300" />
                                        </div>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Infinite Generation Trigger */}
                <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-purple-300 group-hover:scale-110 transition-transform duration-500">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-white mb-2">Continuez l'aventure !</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                            L'IA génère une nouvelle leçon personnalisée pour votre niveau actuel.
                        </p>
                        <form action={generateNextLessonAction}>
                            <GenerateButton />
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

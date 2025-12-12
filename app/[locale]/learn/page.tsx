export const dynamic = 'force-dynamic';

import { getLessons, generateNextLessonAction } from './actions';
import Link from 'next/link';
import { CheckCircle, Lock, Play, Star, Sparkles, BookOpen } from 'lucide-react';
import { GenerateButton } from './GenerateButton';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import LearningLanguageToggler from '@/components/LearningLanguageToggler';

export default async function LearnPage() {
    const lessonsData = await getLessons();
    const lessons: any[] = lessonsData;

    // Check specific language for UI strings
    // We can infer from the first lesson, or fetch user. 
    // Fetching user is safer if no lessons exist yet.
    const { getConfig } = await import('@/lib/languageConfig');
    const { getOrCreateUser } = await import('@/lib/auth');
    const user = await getOrCreateUser();
    const learningLang = user?.learningLanguage || 'ES';
    const config = getConfig(learningLang);

    return (
        <div className="min-h-screen text-white pb-20">
            <header className="fixed top-0 w-full z-20 glass-panel backdrop-blur px-4 py-3 flex justify-between items-center rounded-b-2xl mb-8 transition-all duration-300">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white transition group flex items-center gap-1 p-2 rounded-lg hover:bg-white/5">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> <span className="hidden sm:inline">Retour</span>
                    </Link>
                    <h1 className="font-bold text-lg sm:text-xl">Leçons</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/characters" className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition" title="Alphabet / Écriture">
                        <BookOpen size={20} />
                    </Link>
                    <LearningLanguageToggler currentLanguage={learningLang} />
                </div>
            </header>

            <main className="pt-20 sm:pt-24 max-w-2xl mx-auto px-4 space-y-8">
                <div className="text-center mb-8 mt-4">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse-glow inline-block">
                        Parcours A1 ({config.label})
                    </h2>
                    <p className="text-sm sm:text-base text-gray-400 mt-2">
                        Maîtrisez les bases du {config.label.toLowerCase()}
                    </p>
                </div>

                <div className="space-y-6">
                    {lessons.map((lesson, index) => {
                        const isCompleted = lesson.progress.length > 0 && lesson.progress[0].completed;
                        const isUnlocked = index === 0 || (lessons[index - 1].progress.length > 0 && lessons[index - 1].progress[0].completed);

                        return (
                            <div key={lesson.id} className="relative flex items-center group/item">
                                {/* Trace line */}
                                {index !== lessons.length - 1 && (
                                    <div className="absolute left-[28px] top-[50px] w-1 h-20 bg-gray-800 -z-10 group-hover/item:bg-gray-700 transition"></div>
                                )}

                                <Link
                                    href={isUnlocked ? `/learn/${lesson.id}` : '#'}
                                    className={twMerge(
                                        "flex items-center gap-4 w-full p-4 rounded-xl border transition duration-300",
                                        isCompleted
                                            ? "glass-card border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10"
                                            : isUnlocked
                                                ? "glass-card border-white/10 hover:border-yellow-400 hover:scale-[1.02]"
                                                : "bg-white/5 border-transparent opacity-50 cursor-not-allowed grayscale"
                                    )}
                                >
                                    <div className={twMerge(
                                        "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-transform duration-500",
                                        isCompleted ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black rotate-0" : isUnlocked ? "bg-gray-800 text-white border-2 border-yellow-500 group-hover/item:rotate-12" : "bg-gray-800 text-gray-500"
                                    )}>
                                        {isCompleted ? <CheckCircle size={24} /> : isUnlocked ? <Play size={24} className="ml-1" /> : <Lock size={20} />}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className={twMerge("font-bold text-lg transition", isUnlocked ? "group-hover/item:text-yellow-400" : "")}>{lesson.title}</h3>
                                        <p className="text-sm text-gray-400">{lesson.description}</p>
                                    </div>

                                    {isCompleted && (
                                        <div className="flex flex-col items-center text-yellow-500 animate-in zoom-in">
                                            <div className="flex">
                                                <Star size={16} fill="currentColor" className="animate-pulse" />
                                                <Star size={16} fill="currentColor" className="animate-pulse delay-75" />
                                                <Star size={16} fill="currentColor" className="animate-pulse delay-150" />
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Infinite Generation Trigger */}
                <div className="mt-8 p-6 glass-card rounded-2xl border-dashed border-2 border-gray-700 text-center space-y-4">
                    <div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto text-purple-400">
                        <Sparkles size={32} />
                    </div>
                    <h3 className="font-bold text-xl">Envie de plus ?</h3>
                    <p className="text-gray-400 text-sm">
                        L'IA peut générer une nouvelle leçon personnalisée pour votre niveau actuel.
                    </p>
                    <form action={generateNextLessonAction}>
                        <GenerateButton />
                    </form>
                </div>
            </main>
        </div>
    );
}

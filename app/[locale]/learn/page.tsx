export const dynamic = 'force-dynamic';

import { getLearningPath, generateNextLessonAction } from './actions';
import Link from 'next/link';
import { GenerateButton } from './GenerateButton';
import LearningMap from '@/components/LearningMap';
import { getOrCreateUser } from '@/lib/auth';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default async function LearnPage() {
    console.log('[LearnPage] Rendering...');

    // 1. Authenticate & Get User Config
    const user = await getOrCreateUser();
    if (!user) return <div>Access Denied</div>;

    const learningLanguage = user.learningLanguage || 'EN';
    const isEnglish = learningLanguage === 'EN';

    // 2. Fetch The Path
    const units = await getLearningPath(user.id, learningLanguage);

    return (
        <div className="min-h-screen text-white pb-20 bg-gray-950">
            {/* Header */}
            <header className="fixed top-0 w-full z-20 glass-panel backdrop-blur px-4 py-3 flex justify-between items-center rounded-b-2xl mb-8 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white transition group flex items-center gap-1">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Retour
                    </Link>
                    <h1 className="font-bold">Mon Parcours ({learningLanguage})</h1>
                </div>
            </header>

            <main className="pt-24 max-w-2xl mx-auto px-4">
                {/* Intro */}
                <div className="text-center mb-12">
                    <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30 inline-block mb-4">
                        Niveau Actuel: {user.level || 'A1'}
                    </span>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse-glow">
                        {isEnglish ? 'Learning Path' : 'Carte d\'Apprentissage'}
                    </h2>
                    <p className="text-gray-400 mt-2">
                        {isEnglish ? "Complete units to unlock new content" : "Complétez les unités pour progresser"}
                    </p>
                </div>

                {/* THE MAP */}
                <div className="mb-24">
                    <LearningMap units={units} />
                </div>

                {/* Infinite Generation Trigger */}
                <div className="p-6 glass-card rounded-2xl border-dashed border-2 border-gray-700 text-center space-y-4">
                    <div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto text-purple-400">
                        <Sparkles size={32} />
                    </div>
                    <h3 className="font-bold text-xl">
                        {isEnglish ? "Need more?" : "Envie de plus ?"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {isEnglish
                            ? "AI can generate a custom lesson for your level."
                            : "L'IA peut générer une nouvelle leçon personnalisée pour votre niveau actuel."}
                    </p>
                    <form action={generateNextLessonAction}>
                        <GenerateButton />
                    </form>
                </div>
            </main>
        </div>
    );
}

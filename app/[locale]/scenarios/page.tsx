export const dynamic = 'force-dynamic';

import { getScenarios, generateNewScenario } from './actions';
import { CreateScenarioButton } from './CreateScenarioButton';
import Link from 'next/link';
import { Play, Sparkles, Trophy, Globe, Zap, ArrowRight, Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default async function ScenariosPage() {

    const scenarios = await getScenarios();

    return (
        <div className="min-h-screen bg-black text-white pb-20 relative overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition group">
                        <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition" size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight">Missions</h1>
                        <p className="text-xs text-purple-400 font-medium uppercase tracking-widest hidden md:block">Simulation Center</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <form action={generateNewScenario}>
                        <CreateScenarioButton />
                    </form>
                </div>
            </header>

            <main className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
                <div className="text-center max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        <Globe size={12} /> Real-World Simulations
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                        Immersion Tasks
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Engage in AI-generated roleplay scenarios to practice spontaneous speaking in realistic contexts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map((scenario: any, index: number) => {
                        const isCompleted = scenario.progress.length > 0 && scenario.progress[0].completed;

                        return (
                            <Link
                                key={scenario.id}
                                href={`/scenarios/${scenario.id}`}
                                className="group relative h-full flex flex-col"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>

                                <div className="relative h-full bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-4 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-purple-500/30 group-hover:shadow-2xl group-hover:shadow-purple-500/20">

                                    {/* Decoration Circles */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition duration-500"></div>

                                    {/* Header */}
                                    <div className="flex justify-between items-start z-10">
                                        <div className={twMerge(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                            isCompleted ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-purple-500 to-indigo-600"
                                        )}>
                                            {isCompleted ? <Trophy size={24} /> : <Zap size={24} />}
                                        </div>

                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider backdrop-blur-md">
                                            Level {scenario.level}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow space-y-2 z-10">
                                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition line-clamp-2">
                                            {scenario.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                            {scenario.description}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between z-10">
                                        {isCompleted ? (
                                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                                                <Star size={16} fill="currentColor" /> Completed
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-white font-bold text-sm group-hover:translate-x-1 transition">
                                                Start Mission <ArrowRight size={16} />
                                            </div>
                                        )}

                                        {/* Hover Effect Icon */}
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Play size={14} fill="white" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

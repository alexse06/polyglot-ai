export const dynamic = 'force-dynamic';

import { getScenarios, generateNewScenario } from './actions';
import { CreateScenarioButton } from './CreateScenarioButton';
import Link from 'next/link';
import { Play, Sparkles, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default async function ScenariosPage() {

    const scenarios = await getScenarios();

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            <header className="fixed top-0 w-full z-10 bg-gray-900/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white">
                        ← Retour
                    </Link>
                    <h1 className="font-bold">Missions & Scénarios</h1>
                </div>
                <form action={generateNewScenario}>
                    <CreateScenarioButton />
                </form>
            </header>

            <main className="pt-20 max-w-2xl mx-auto px-4 space-y-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Mises en Situation
                    </h2>
                    <p className="text-gray-400">Pratiquez dans des situations réelles avec l'IA.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenarios.map((scenario: any) => {
                        const isCompleted = scenario.progress.length > 0 && scenario.progress[0].completed;

                        return (
                            <Link
                                key={scenario.id}
                                href={`/scenarios/${scenario.id}`}
                                className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition duration-300 overflow-hidden"
                            >
                                {isCompleted && (
                                    <div className="absolute top-2 right-2 text-yellow-500">
                                        <Trophy size={20} />
                                    </div>
                                )}

                                <div className="mb-4 text-purple-400 bg-purple-500/10 w-fit p-3 rounded-xl group-hover:scale-110 transition">
                                    <Sparkles size={24} />
                                </div>

                                <h3 className="text-lg font-bold mb-2">{scenario.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 h-10 overflow-hidden">{scenario.description}</p>

                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <span>Niveau {scenario.level}</span>
                                    {isCompleted ? (
                                        <span className="text-green-500 flex items-center gap-1">Complété</span>
                                    ) : (
                                        <span className="group-hover:text-white transition flex items-center gap-1">
                                            Commencer <Play size={12} />
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

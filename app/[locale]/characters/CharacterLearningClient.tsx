'use client';

import { useState } from 'react';
import { useTTS } from '@/hooks/useTTS';
import { Volume2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Character {
    symbol: string;
    romanization?: string;
    pronunciation?: string;
    name?: string;
}

interface Group {
    title: string;
    characters: Character[];
}

interface CharacterData {
    type: string; // 'LATIN' | 'SCRIPT'
    scriptName?: string; // 'Hiragana', etc.
    description: string;
    groups: Group[];
}

export default function CharacterLearningClient({ data, lang }: { data: CharacterData; lang: string }) {
    const { speak } = useTTS();
    const [activeGroup, setActiveGroup] = useState<string>(data.groups[0]?.title || '');

    const currentGroup = data.groups.find(g => g.title === activeGroup) || data.groups[0];

    return (
        <div className="space-y-8">
            {/* Header / Intro */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            {data.scriptName || (data.type === 'LATIN' ? 'L\'Alphabet' : 'Écriture')}
                        </h2>
                        <p className="text-gray-300 leading-relaxed max-w-2xl">
                            {data.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {data.groups.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {data.groups.map(group => (
                        <button
                            key={group.title}
                            onClick={() => setActiveGroup(group.title)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeGroup === group.title
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {group.title}
                        </button>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentGroup?.characters.map((char, idx) => (
                    <motion.button
                        key={`${char.symbol}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => speak(char.symbol, lang)}
                        className="relative group bg-gray-800/50 hover:bg-indigo-600/20 border border-gray-700 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center transition-all aspect-square"
                    >
                        <span className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                            {char.symbol}
                        </span>

                        {(char.romanization || char.name) && (
                            <span className="text-indigo-400 font-medium text-lg">
                                {char.romanization || char.name}
                            </span>
                        )}

                        {char.pronunciation && (
                            <span className="text-gray-500 text-xs mt-1">
                                /{char.pronunciation}/
                            </span>
                        )}

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Volume2 size={16} className="text-indigo-400" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

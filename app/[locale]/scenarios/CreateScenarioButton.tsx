'use client'

import { useFormStatus } from 'react-dom';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function CreateScenarioButton() {
    const { pending } = useFormStatus();
    const [funFact, setFunFact] = useState("AI is crafting a unique scenario...");

    useEffect(() => {
        if (!pending) return;

        const facts = [
            "Generating context...",
            "Creating character personas...",
            "Setting the scene...",
            "Preparing vocabulary...",
            "Optimizing for your level..."
        ];

        const interval = setInterval(() => {
            setFunFact(facts[Math.floor(Math.random() * facts.length)]);
        }, 3000);

        return () => clearInterval(interval);
    }, [pending]);

    return (
        <div className="flex items-center gap-4">
            {pending && (
                <span className="text-xs text-purple-300/80 animate-pulse hidden md:flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> {funFact}
                </span>
            )}

            <button
                type="submit"
                disabled={pending}
                className="group relative bg-white text-black pl-4 pr-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                {pending ? (
                    <Loader2 size={18} className="animate-spin text-black" />
                ) : (
                    <div className="bg-black text-white p-1 rounded-full group-hover:rotate-90 transition duration-500">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                )}

                <span className="relative z-10">
                    {pending ? "Generating..." : "New Mission"}
                </span>
            </button>
        </div>
    );
}

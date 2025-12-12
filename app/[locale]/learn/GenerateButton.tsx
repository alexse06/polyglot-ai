'use client'

import { useFormStatus } from 'react-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function GenerateButton() {
    const { pending } = useFormStatus();
    const [funFact, setFunFact] = useState("L'espagnol est la 2e langue la plus parlée au monde.");

    useEffect(() => {
        if (!pending) return;

        const facts = [
            "L'espagnol est la 2e langue la plus parlée au monde.",
            "Le Mexique compte plus de locuteurs espagnols que l'Espagne.",
            "La lettre 'ñ' était à l'origine un double 'nn'.",
            "L'espagnol est la langue officielle de 21 pays.",
            "L'arabe a influencé environ 4000 mots espagnols."
        ];

        const interval = setInterval(() => {
            setFunFact(facts[Math.floor(Math.random() * facts.length)]);
        }, 3000);

        return () => clearInterval(interval);
    }, [pending]);

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                disabled={pending}
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition flex items-center gap-2 mx-auto disabled:opacity-50 shadow-lg hover:shadow-purple-500/20"
            >
                {pending ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {pending ? "Création en cours..." : "Générer une leçon magique"}
            </button>
            {pending && (
                <p className="text-sm text-gray-400 animate-pulse text-center max-w-xs">
                    <span className="text-purple-400 font-bold">Le saviez-vous ?</span> <br />
                    {funFact}
                </p>
            )}
        </div>
    );
}

'use client'

import { useFormStatus } from 'react-dom';
import { Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function CreateScenarioButton() {
    const { pending } = useFormStatus();
    const [funFact, setFunFact] = useState("Les Espagnols ont deux noms de famille.");

    useEffect(() => {
        if (!pending) return;

        const facts = [
            "Les Espagnols ont deux noms de famille.",
            "L'hymne national espagnol n'a pas de paroles.",
            "Madrid est la capitale la plus haute d'Europe.",
            "L'Espagne produit 45% de l'huile d'olive mondiale.",
            "On mange 12 raisins à minuit au Nouvel An."
        ];

        const interval = setInterval(() => {
            setFunFact(facts[Math.floor(Math.random() * facts.length)]);
        }, 3000);

        return () => clearInterval(interval);
    }, [pending]);

    return (
        <div className="flex items-center gap-4">
            <button
                type="submit"
                disabled={pending}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
            >
                {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {pending ? "Génération..." : "Nouvelle Mission"}
            </button>
            {pending && (
                <span className="text-xs text-purple-400 animate-pulse hidden md:block max-w-[200px] truncate">
                    💡 {funFact}
                </span>
            )}
        </div>
    );
}

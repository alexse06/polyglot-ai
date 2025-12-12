'use client'

import { useState, useEffect } from 'react';
import { getDueFlashcards, reviewFlashcard } from './actions';
import { ArrowLeft, Volume2, Check, X, Brain } from 'lucide-react';
import { useRouter, Link } from '@/navigation'; // Use locale-aware navigation
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

import { useTTS } from '@/hooks/useTTS';

export default function FlashcardsPage() {
    const router = useRouter();
    const [cards, setCards] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionOver, setSessionOver] = useState(false);

    const { speak, isPlaying } = useTTS();

    useEffect(() => {
        getDueFlashcards().then(data => {
            setCards(data);
            setLoading(false);
        });
    }, []);

    // Removed auto-play useEffect

    const handleRate = async (rating: number) => {
        // Optimistic update
        const currentCard = cards[currentIndex];
        await reviewFlashcard(currentCard.id, rating);

        // Refresh XP in header
        router.refresh();

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setSessionOver(true);
            confetti();
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Chargement...</div>;

    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 text-center max-w-sm">
                    <Brain size={48} className="mx-auto mb-4 text-green-500" />
                    <h1 className="text-2xl font-bold mb-2">Tout est à jour !</h1>
                    <p className="text-gray-400 mb-6">Vous avez révisé toutes vos cartes pour le moment. Revenez plus tard ou faites une nouvelle leçon.</p>
                    <Link href="/dashboard" className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition">
                        Retour au Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (sessionOver) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 text-center max-w-sm animate-in zoom-in">
                    <TrophyIcon />
                    <h1 className="text-2xl font-bold mb-2">Session Terminée !</h1>
                    <p className="text-gray-400 mb-6">Vous avez révisé {cards.length} cartes. Votre cerveau vous remercie.</p>
                    <Link href="/dashboard" className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition">
                        Continuer
                    </Link>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <header className="p-4 flex items-center justify-between">
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                    <ArrowLeft />
                </Link>
                <span className="font-mono text-sm text-gray-500">
                    {currentIndex + 1} / {cards.length}
                </span>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
                <div
                    onClick={() => !isFlipped && setIsFlipped(true)}
                    className={twMerge(
                        "w-full aspect-[4/5] bg-gray-900 rounded-3xl border border-gray-800 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-500 transform",
                        isFlipped ? "rotate-y-180 bg-gray-800 relative" : "hover:border-gray-700"
                    )}
                    style={{ perspective: '1000px' }}
                >
                    {!isFlipped ? (
                        <>
                            <span className="text-sm text-gray-500 uppercase tracking-widest mb-4">
                                {currentCard.language === 'EN' ? 'Anglais' : (currentCard.language === 'ES' ? 'Espagnol' : currentCard.language)}
                            </span>
                            <h2 className="text-4xl font-bold">{currentCard.front}</h2>
                            <p className="text-gray-600 mt-8 text-sm">(Appuyez pour révéler)</p>
                        </>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-300 transform rotate-y-180 flex flex-col items-center">
                            <span className="text-sm text-gray-500 uppercase tracking-widest mb-4">Traduction</span>
                            <h2 className="text-3xl font-bold mb-2">{currentCard.back}</h2>
                            <div className="h-1 w-20 bg-gray-700 mx-auto my-4 rounded-full"></div>
                            <p className="text-xl text-yellow-500 font-medium mb-4">{currentCard.front}</p>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speak(currentCard.front, currentCard.language || "ES");
                                }}
                                className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 p-3 rounded-full transition group"
                                title="Écouter la prononciation"
                            >
                                <Volume2 className={twMerge("w-6 h-6", isPlaying ? "text-white animate-pulse" : "group-hover:scale-110")} />
                            </button>
                        </div>
                    )}
                </div>

                {isFlipped && (
                    <div className="flex gap-2 w-full mt-8 animate-in slide-in-from-bottom">
                        <button
                            onClick={() => handleRate(1)}
                            className="flex-1 bg-red-900/30 border border-red-900/50 text-red-400 py-4 rounded-xl font-bold hover:bg-red-900/50 transition flex flex-col items-center text-sm"
                        >
                            <span className="text-lg mb-1">👎</span>
                            À revoir
                        </button>
                        <button
                            onClick={() => handleRate(2)}
                            className="flex-1 bg-blue-900/30 border border-blue-900/50 text-blue-400 py-4 rounded-xl font-bold hover:bg-blue-900/50 transition flex flex-col items-center text-sm"
                        >
                            <span className="text-lg mb-1">🤔</span>
                            Difficile
                        </button>
                        <button
                            onClick={() => handleRate(3)}
                            className="flex-1 bg-green-900/30 border border-green-900/50 text-green-400 py-4 rounded-xl font-bold hover:bg-green-900/50 transition flex flex-col items-center text-sm"
                        >
                            <span className="text-lg mb-1">⚡</span>
                            Facile
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

function TrophyIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-yellow-500 h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
    )
}

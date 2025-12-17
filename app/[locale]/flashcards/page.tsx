'use client'

import { useState, useEffect } from 'react';
import { getDueFlashcards, reviewFlashcard } from './actions';
import { ArrowLeft, Volume2, Check, X, Brain, RotateCw, Trophy, Sparkles, Star } from 'lucide-react';
import { useRouter, Link } from '@/navigation';
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

    const handleRate = async (rating: number) => {
        const currentCard = cards[currentIndex];
        await reviewFlashcard(currentCard.id, rating);
        router.refresh();

        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 300); // Wait for flip back or slide
        } else {
            setSessionOver(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#ec4899', '#eab308']
            });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <Brain className="w-12 h-12 text-indigo-500" />
                <p className="text-gray-500 font-mono text-sm">LOADING NEURAL PATHWAYS...</p>
            </div>
        </div>
    );

    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center max-w-sm relative z-10 shadow-2xl shadow-indigo-500/10">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-white">All Caught Up!</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        You've reviewed all your cards for now. Your brain is getting stronger! 🧠
                    </p>
                    <Link href="/dashboard" className="inline-flex items-center justify-center w-full bg-white text-black font-bold px-6 py-4 rounded-xl hover:bg-gray-200 transition transform hover:scale-[1.02]">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (sessionOver) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

                <div className="bg-gray-900/50 backdrop-blur-xl p-10 rounded-3xl border border-yellow-500/20 text-center max-w-sm animate-in zoom-in duration-500 relative z-10 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/30 border-4 border-black">
                            <Trophy className="w-12 h-12 text-black" fill="currentColor" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-2 mt-10 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">Session Complete!</h1>
                    <p className="text-gray-400 mb-8">
                        You reviewed <span className="text-white font-bold">{cards.length} cards</span>.
                        <br />Keep up the momentum!
                    </p>

                    <Link href="/dashboard" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-6 py-4 rounded-xl hover:opacity-90 transition transform hover:scale-[1.02] shadow-lg shadow-orange-500/20">
                        Continue Learning
                    </Link>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-purple-900/10 blur-[120px] pointer-events-none"></div>

            <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition flex items-center gap-2">
                    <ArrowLeft size={20} /> <span className="hidden sm:inline font-medium">Exit</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="text-sm font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {currentIndex + 1} / {cards.length}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-10 perspective-1000">
                {/* 3D Card Container */}
                <div
                    onClick={() => !isFlipped && setIsFlipped(true)}
                    className={twMerge(
                        "w-full aspect-[3/4] sm:aspect-[4/5] relative preserve-3d transition-transform duration-700 cursor-pointer",
                        isFlipped ? "rotate-y-180" : "hover:scale-[1.02]"
                    )}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* FRONT of Card */}
                    <div className="absolute inset-0 backface-hidden bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-white/10 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                        {/* Card Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2rem] pointer-events-none"></div>

                        <span className="relative z-10 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 border border-indigo-500/30">
                            {currentCard.language === 'EN' ? 'English' : (currentCard.language === 'ES' ? 'Spanish' : currentCard.language)}
                        </span>

                        <h2 className="relative z-10 text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                            {currentCard.front}
                        </h2>

                        <div className="relative z-10 mt-auto flex flex-col items-center gap-2 text-gray-500 animate-pulse">
                            <Sparkles size={16} />
                            <span className="text-xs uppercase tracking-widest">Tap to Reveal</span>
                        </div>
                    </div>

                    {/* BACK of Card */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-black/60 backdrop-blur-xl rounded-[2rem] border border-white/10 flex flex-col items-center justify-center p-8 text-center shadow-2xl overflow-hidden">
                        {/* Decorative background for back */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black pointer-events-none"></div>
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>

                        <span className="relative z-10 text-xs text-gray-500 uppercase tracking-widest mb-6">Translation</span>

                        <h2 className="relative z-10 text-3xl font-bold text-white mb-6">
                            {currentCard.back}
                        </h2>

                        <div className="w-12 h-1 bg-white/10 rounded-full mb-6"></div>

                        <div className="relative z-10 text-2xl text-yellow-500 font-medium mb-8">
                            {currentCard.front}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                speak(currentCard.front, currentCard.language || "ES");
                            }}
                            className="relative z-10 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group mb-4"
                            title="Play Pronunciation"
                        >
                            <Volume2 className={twMerge("w-7 h-7", isPlaying ? "text-indigo-400 animate-pulse" : "group-hover:text-indigo-400")} />
                        </button>
                    </div>
                </div>

                {/* Rating Buttons (Visible only when flipped) */}
                <div className={twMerge(
                    "flex gap-3 w-full mt-8 transition-all duration-500 transform",
                    isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}>
                    <button
                        onClick={() => handleRate(1)}
                        className="flex-1 bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-xl font-bold hover:bg-red-500/20 hover:border-red-500/40 transition active:scale-95 flex flex-col items-center gap-1 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">😫</span>
                        <span className="text-xs uppercase tracking-wide opacity-70">Hard</span>
                    </button>
                    <button
                        onClick={() => handleRate(2)}
                        className="flex-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 py-4 rounded-xl font-bold hover:bg-blue-500/20 hover:border-blue-500/40 transition active:scale-95 flex flex-col items-center gap-1 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🤔</span>
                        <span className="text-xs uppercase tracking-wide opacity-70">Okay</span>
                    </button>
                    <button
                        onClick={() => handleRate(3)}
                        className="flex-1 bg-green-500/10 border border-green-500/20 text-green-400 py-4 rounded-xl font-bold hover:bg-green-500/20 hover:border-green-500/40 transition active:scale-95 flex flex-col items-center gap-1 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">⚡</span>
                        <span className="text-xs uppercase tracking-wide opacity-70">Easy</span>
                    </button>
                </div>
            </main>
        </div>
    );
}

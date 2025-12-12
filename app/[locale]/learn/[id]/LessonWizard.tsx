'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeLesson, explainError } from '../actions';
import { X, Check, ArrowRight, Lightbulb, Volume2, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import { useTTS } from '@/hooks/useTTS';

export default function LessonWizard({ lesson, content }: { lesson: any, content: any }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [inputAnswer, setInputAnswer] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
    const [score, setScore] = useState(0);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const router = useRouter();

    const exercises = content.exercises || [];
    const currentExercise = exercises[currentStep];
    const progress = ((currentStep) / exercises.length) * 100;

    const { speak, isPlaying } = useTTS();

    // speak function removed, using hook directly.

    const handleExplain = async () => {
        setIsExplaining(true);
        const wrongAns = selectedOption || inputAnswer;
        const correctAns = currentExercise.correctAdjusted || currentExercise.correctAnswer;

        try {
            const result = await explainError(currentExercise.question, wrongAns, correctAns);
            setExplanation(result.explanation);
        } catch (e) {
            console.error(e);
        } finally {
            setIsExplaining(false);
        }
    };

    const handleCheck = () => {
        let isCorrect = false;

        // Normalization helper: remove punctuation, lowercase, trim duplicate spaces, remove accents (NFD)
        // Normalization helper: remove punctuation, lowercase, trim duplicate spaces, remove accents (NFD)
        const normalize = (str: string | null | undefined) => {
            if (!str) return "";
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/[.,/#!$%^&*;:{}=\-_`~()¿¡]/g, "") // Remove punctuation
                .replace(/\s{2,}/g, " ").trim();
        };

        if (currentExercise.type === 'TRANSLATE_TO_TARGET' || currentExercise.type === 'COMPLETE_SENTENCE') {
            const possibleAnswers = [currentExercise.correctAdjusted, currentExercise.correctAnswer].filter(Boolean);

            // Check text input
            if (inputAnswer) {
                const normalizedInput = normalize(inputAnswer);
                isCorrect = possibleAnswers.some(ans => normalize(ans) === normalizedInput);
            }

            // Check selected option (if applicable)
            if (currentExercise.options && selectedOption) {
                isCorrect = possibleAnswers.some(ans => normalize(ans) === normalize(selectedOption));
            }
        } else if (currentExercise.type === 'MULTIPLE_CHOICE') {
            isCorrect = normalize(selectedOption || "") === normalize(currentExercise.correctAnswer);
        }

        if (isCorrect) {
            setStatus('CORRECT');
            setScore(prev => prev + 10);
            const audio = new Audio('/sounds/correct.mp3'); // We don't have sounds yet but good practice
        } else {
            setStatus('WRONG');
        }
    };

    const handleNext = async () => {
        if (currentStep < exercises.length - 1) {
            setCurrentStep(prev => prev + 1);
            setStatus('IDLE');
            setSelectedOption(null);
            setInputAnswer('');
        } else {
            // Finish
            confetti();
            await completeLesson(lesson.id, score);
            router.push('/learn');
            router.refresh(); // Ensure the UI updates immediately
        }
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-6">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </header>

            {/* Exercise Content */}
            <main className="flex-1 flex flex-col justify-center">
                <div className="mb-6 flex items-center gap-4">
                    <h2 className="text-2xl font-bold">{currentExercise.question}</h2>
                    {currentExercise.type === 'TRANSLATE_TO_TARGET' && (
                        <button
                            onClick={() => speak(currentExercise.correctAdjusted || "", lesson.language)}
                            className="p-3 bg-gray-800 rounded-full text-blue-400 hover:bg-gray-700 hover:scale-110 transition"
                            title="Écouter la phrase"
                        >
                            <Volume2 size={24} />
                        </button>
                    )}
                </div>

                {currentExercise.type === 'MULTIPLE_CHOICE' && (
                    <div className="grid grid-cols-1 gap-3">
                        {currentExercise.options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => !status.startsWith('CORRECT') && setSelectedOption(opt)}
                                className={twMerge(
                                    "p-4 rounded-xl border-2 text-left text-lg font-semibold transition group flex flex-col",
                                    selectedOption === opt
                                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                        : "border-gray-700 hover:bg-gray-800"
                                )}
                                disabled={status !== 'IDLE'}
                            >
                                <span>{opt}</span>
                                {/* We don't have per-option transliteration in the schema yet, only main exercise transliteration 
                                    Update: The schema addition was generic "answers in non-Latin scripts". 
                                    Let's stick to showing the main transliteration in the feedback logic.
                                */}
                            </button>
                        ))}
                    </div>
                )}

                {(currentExercise.type === 'TRANSLATE_TO_TARGET' || currentExercise.type === 'COMPLETE_SENTENCE') && (
                    <div className="space-y-4">
                        {currentExercise.options ? (
                            <div className="flex flex-wrap gap-2">
                                {currentExercise.options.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => setSelectedOption(opt)}
                                        className={twMerge(
                                            "px-4 py-2 rounded-lg border-2 font-bold",
                                            selectedOption === opt
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "border-gray-700 hover:bg-gray-800"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="w-full bg-gray-800 rounded-2xl p-4 text-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                rows={3}
                                placeholder="Escribe en español..."
                                value={inputAnswer}
                                onChange={(e) => setInputAnswer(e.target.value)}
                                disabled={status !== 'IDLE'}
                            />
                        )}
                    </div>
                )}
            </main>

            {/* Footer / Feedback */}
            <footer className={twMerge(
                "fixed bottom-0 left-0 w-full p-6 border-t animate-in slide-in-from-bottom transition-colors duration-300",
                status === 'IDLE' ? "border-transparent glass-panel backdrop-blur-xl" :
                    status === 'CORRECT' ? "bg-green-900/90 border-green-700 text-green-100" :
                        "bg-red-900/90 border-red-700 text-red-100"
            )}>
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {status === 'CORRECT' && <div className="p-2 bg-green-500 text-black rounded-full"><Check /></div>}
                            {status === 'WRONG' && <div className="p-2 bg-red-500 text-black rounded-full"><X /></div>}
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">
                                    {status === 'IDLE' ? '' : status === 'CORRECT' ? 'Excellent !' : 'Incorrect'}
                                </span>
                                {status === 'WRONG' && (
                                    <span className="text-sm opacity-90">
                                        Réponse : {currentExercise.correctAnswer || currentExercise.correctAdjusted}
                                    </span>
                                )}
                                {currentExercise.transliteration && (status === 'CORRECT' || status === 'WRONG') && (
                                    <span className="text-yellow-400 italic text-sm mt-1 font-mono">
                                        ({currentExercise.transliteration})
                                    </span>
                                )}
                            </div>
                        </div>

                        {status === 'IDLE' ? (
                            <button
                                onClick={handleCheck}
                                disabled={!selectedOption && !inputAnswer}
                                className="bg-green-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Vérifier
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                {status === 'WRONG' && !explanation && (
                                    <button
                                        onClick={handleExplain}
                                        disabled={isExplaining}
                                        className="bg-red-800 border border-red-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-red-700 transition flex items-center gap-2"
                                    >
                                        {isExplaining ? <Loader2 className="animate-spin" size={20} /> : <Lightbulb size={20} />}
                                        Pourquoi ?
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className={twMerge(
                                        "font-bold px-8 py-3 rounded-xl transition flex items-center gap-2",
                                        status === 'CORRECT' ? "bg-white text-green-700 hover:bg-gray-100" : "bg-white text-red-700 hover:bg-gray-100"
                                    )}
                                >
                                    Continuer <ArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Explanation Box */}
                    {explanation && (
                        <div className="bg-black/30 p-4 rounded-xl border border-white/20 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2 items-start">
                                <Lightbulb className="text-yellow-400 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm">{explanation}</p>
                            </div>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}

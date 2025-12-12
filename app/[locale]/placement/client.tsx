'use client'

import { useState, useEffect } from 'react';
import { startPlacementTest, submitPlacementTest } from './actions';
import { Loader2 } from 'lucide-react';
import { LANGUAGE_CONFIG } from '@/lib/languageConfig';

export default function PlacementPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

    useEffect(() => {
        if (selectedLanguage) {
            startPlacementTest(selectedLanguage).then(q => {
                setQuestions(q);
                setLoading(false);
            });
        }
    }, [selectedLanguage]);

    const handleAnswer = (option: string) => {
        const newAnswers = [...answers, { ...questions[currentQuestion], answer: option }];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setLoading(true);
            submitPlacementTest(newAnswers, selectedLanguage!).then(res => {
                setResult(res);
                setLoading(false);
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-yellow-500" />
                    <p className="text-xl">Consultation du cerveau IA...</p>
                </div>
            </div>
        );
    }

    if (!selectedLanguage) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
                <div className="max-w-4xl w-full text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Bonjour !
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-12">Quelle langue souhaitez-vous apprendre ?</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Object.values(LANGUAGE_CONFIG).map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => { setLoading(true); setSelectedLanguage(lang.code); }}
                                className="group flex flex-col items-center p-6 bg-gray-800/50 hover:bg-white/5 border-2 border-gray-700 hover:border-purple-500 rounded-3xl transition-all duration-300 hover:scale-105"
                            >
                                <span className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">{lang.flag}</span>
                                <span className="text-xl font-bold text-white group-hover:text-purple-400">{lang.label}</span>
                                <span className="text-xs text-gray-400 mt-2">{lang.locale}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white p-4">
                <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
                    <h1 className="text-3xl font-bold mb-4 text-yellow-500">Félicitations !</h1>
                    <p className="text-xl mb-6">Votre niveau estimé est :</p>
                    <div className="text-6xl font-extrabold text-white mb-6">{result.level}</div>
                    <p className="text-gray-400 mb-8">{result.explanation}</p>
                    <button className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition" onClick={() => window.location.href = '/register'}>
                        Créer un compte pour sauvegarder
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="mb-8 flex justify-between items-center text-gray-400">
                    <span>Question {currentQuestion + 1} sur {questions.length}</span>
                    <span>Test de Niveau</span>
                </div>

                <h2 className="text-3xl font-bold mb-8">{q.question}</h2>

                <div className="space-y-4">
                    {q.options.map((opt: string) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="w-full text-left p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-yellow-500 text-xl"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

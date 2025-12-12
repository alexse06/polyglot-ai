'use client';

import { useState, useRef, useEffect } from 'react';
import { evaluateScenario, getScenarioHint } from '../actions';
import { Send, Mic, PlayCircle, Trophy, ArrowLeft, Lightbulb, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import { useTTS } from '@/hooks/useTTS';
import { ClickableSentence } from '@/components/ClickableWord';
import { useLocale } from 'next-intl';

// Import our new context-aware action
import { sendScenarioMessage } from '../chatAction';

type Message = {
    role: 'user' | 'model';
    content: string;
    transliteration?: string | null;
    correction?: string | null;
    suggestions?: string[];
};

type ScenarioReport = {
    score: number;
    feedback: string;
    vocabulary: string[];
    tips: string[];
    passed: boolean;
};

export default function ScenarioChatClient({ scenario }: { scenario: any }) {
    const locale = useLocale();
    const targetLang = scenario.language || "ES";

    // Initial message from the model based on the scenarionst targetLang = scenario.language || "ES";

    // Initial message from the model based on the scenario
    // Initial message from the model based on the scenario
    const greeting = scenario.language === 'EN' ? "Hello!" : "¡Hola!";
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: `${greeting} (${scenario.objective})` }
    ]);
    const [report, setReport] = useState<ScenarioReport | null>(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Custom Hooks
    const { speak, isPlaying } = useTTS();
    const router = useRouter();

    // Refs & State
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [input, setInput] = useState("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [hint, setHint] = useState<{ hint: string, suggestedPhrase: string } | null>(null);
    const [isHintLoading, setIsHintLoading] = useState(false);

    const handleGetHint = async () => {
        setIsHintLoading(true);
        try {
            const result = await getScenarioHint(
                messages.map(m => ({ role: m.role, content: m.content })),
                scenario.objective,
                targetLang,
                locale.toUpperCase()
            );
            if (result) setHint(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsHintLoading(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleMicClick = () => {
        // Simple shim for now as requested by user focus on TTS
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert("Speech recognition not supported");
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = scenario.language === 'EN' ? 'en-US' : 'es-ES';
        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setInput(text);
        };
        recognition.start();
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        try {
            // Pass the scenario's initialPrompt as context
            const response = await sendScenarioMessage(
                messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
                input,
                scenario.initialPrompt || "You are a generic tutor."
            );

            // Add correction to the message state if it exists
            setMessages(prev => [...prev, {
                role: 'model',
                content: response.text,
                transliteration: response.transliteration, // Capture transliteration
                correction: response.correction, // Capture correction
                suggestions: response.suggestions
            }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async () => {
        setIsFinishing(true);
        try {
            const result = await evaluateScenario(scenario.id, messages);
            if (result?.feedback) {
                setReport(result.feedback);
                if (result.passed) confetti();
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'évaluation.");
        } finally {
            setIsFinishing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen text-white relative">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 glass-panel flex justify-between items-center sticky top-0 z-10 mx-2 mt-2 rounded-xl">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    <ArrowLeft />
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-lg">{scenario.title}</h1>
                    <p className="text-xs text-purple-400 font-medium">Objectif : {scenario.objective}</p>
                </div>
                <button
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                >
                    {isFinishing ? 'Analyse...' : <><Trophy size={14} /> Terminer</>}
                </button>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={twMerge(
                            "flex w-full mb-4",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={twMerge(
                                "max-w-[85%] p-4 rounded-2xl text-lg leading-relaxed relative glass-card border-none",
                                msg.role === 'user'
                                    ? "bg-purple-600/80 text-white rounded-tr-none"
                                    : "bg-gray-800/50 text-gray-100 rounded-tl-none"
                            )}
                        >
                            <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                                <ClickableSentence text={msg.content} userLocale={locale} contentLocale={targetLang} />
                            </div>
                            {msg.transliteration && (
                                <p className="text-sm text-yellow-300 italic mt-1 font-mono">({msg.transliteration})</p>
                            )}
                            {msg.role === 'model' && (
                                <button
                                    onClick={() => speak(msg.content, scenario.language || "ES")}
                                    className="absolute -bottom-6 left-0 text-gray-500 hover:text-white text-xs flex items-center gap-1"
                                    disabled={isPlaying}
                                >
                                    <PlayCircle size={14} className={isPlaying ? "animate-pulse text-green-400" : ""} /> Écouter
                                </button>
                            )}
                        </div>

                        {/* Correction Display (Pedagogy) */}
                        {msg.role === 'model' && msg.correction && (
                            <div className="w-full flex justify-start mb-2 pl-4">
                                <div className="bg-red-900/30 border border-red-500/30 p-2 rounded-lg text-sm text-red-200 animate-in slide-in-from-top-2 max-w-[85%]">
                                    <span className="font-bold text-red-400 text-xs uppercase tracking-wide mr-2">Correction :</span>
                                    <span className="italic">{msg.correction}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start w-full mb-4">
                        <div className="bg-gray-800/50 p-4 rounded-2xl rounded-tl-none glass-card">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>




            {/* Hint Display */}
            {hint && (
                <div className="mx-4 mb-2 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-xl flex justify-between items-start animate-in slide-in-from-bottom-2">
                    <div>
                        <p className="text-yellow-200 text-sm font-bold flex items-center gap-2">
                            <Lightbulb size={16} /> Conseil du Coach :
                        </p>
                        <p className="text-gray-300 text-sm mt-1">{hint.hint}</p>
                        <p className="text-yellow-400 font-mono text-sm mt-1">Try: "{hint.suggestedPhrase}"</p>
                    </div>
                    <button onClick={() => setHint(null)} className="text-gray-400 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <footer className="p-4 glass-panel m-2 rounded-xl">
                <div className="max-w-4xl mx-auto flex gap-2 items-center">
                    <button
                        onClick={handleGetHint}
                        disabled={isHintLoading || loading}
                        className="p-3 rounded-full bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition border border-yellow-500/20"
                        title="Obtenir un indice"
                    >
                        {isHintLoading ? <Loader2 size={24} className="animate-spin" /> : <Lightbulb size={24} />}
                    </button>
                    <button
                        onClick={handleMicClick}
                        className={twMerge(
                            "p-3 rounded-full transition duration-300",
                            isRecording ? "bg-red-500 animate-pulse" : "bg-gray-800/50 text-purple-400 hover:bg-gray-700/50"
                        )}
                    >
                        <Mic size={24} />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Répondez pour accomplir la mission..."
                            className="w-full bg-gray-800/50 text-white rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-transparent"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </footer >


            {/* Report Modal */}
            {
                report && (
                    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-6 bg-gradient-to-br from-purple-900/50 to-gray-900 border-b border-gray-800 text-center">
                                <h2 className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Rapport de Mission</h2>
                                <div className="text-5xl font-bold mb-2 flex justify-center items-end gap-2">
                                    <span className={report.score >= 8 ? "text-green-400" : report.score >= 5 ? "text-yellow-400" : "text-red-400"}>
                                        {report.score}
                                    </span>
                                    <span className="text-xl text-gray-500 mb-2">/10</span>
                                </div>
                                <p className="text-purple-200 italic">"{report.feedback}"</p>
                            </div>

                            <div className="p-6 space-y-6 overflow-y-auto">
                                <div>
                                    <h3 className="flex items-center gap-2 font-bold mb-3 text-gray-300">
                                        <span className="text-green-400">✨</span> Vocabulaire Clé
                                    </h3>
                                    <ul className="space-y-2">
                                        {report.vocabulary?.map((word: string, i: number) => (
                                            <li key={i} className="text-sm bg-gray-800 px-3 py-2 rounded-lg text-gray-300 border border-gray-700">
                                                {word}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="flex items-center gap-2 font-bold mb-3 text-gray-300">
                                        <span className="text-yellow-400">💡</span> Conseil du Coach
                                    </h3>
                                    <div className="bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-xl text-yellow-200 text-sm">
                                        {report.tips?.map((tip: string, i: number) => (
                                            <p key={i}>{tip}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-800 bg-gray-900 flex gap-3">
                                <button
                                    onClick={() => router.push('/scenarios')}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={() => setReport(null)}
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition"
                                >
                                    Continuer
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

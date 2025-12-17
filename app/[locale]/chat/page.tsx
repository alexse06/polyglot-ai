'use client'

import { useState, useRef, useEffect, use } from 'react';
import { sendMessage, getChatHistory, clearChatHistory, getUserLanguage } from './actions';
import { RefreshCw, PlayCircle, StopCircle, ArrowLeft, Send, Mic, Trash2, Globe, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useTTS } from '@/hooks/useTTS';
import { ClickableSentence } from '@/components/ClickableWord';
import { Link } from '@/navigation';
import { getConfig } from '@/lib/languageConfig';
import { useTranslations } from 'next-intl';

type Message = {
    role: 'user' | 'model';
    content: string;
    transliteration?: string | null;
    correction?: string | null;
    suggestions?: string[];
};

type ChatPageProps = {
    params: Promise<{
        locale: string;
    }>;
};

export default function ChatPage({ params }: ChatPageProps) {
    const { locale } = use(params);
    const t = useTranslations('Chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [learningLanguage, setLearningLanguage] = useState("EN");

    useEffect(() => {
        getUserLanguage().then(lang => setLearningLanguage(lang));
        // Load history
        getChatHistory().then((history: any[]) => {
            if (history.length > 0) {
                setMessages(history);
            } else {
                const greetings: Record<string, { text: string, transliteration: string }> = {
                    EN: { text: "Hello! I am your English tutor. What can I help you with?", transliteration: "(Heh-loh! I am your English tutor...)" },
                    ES: { text: "¡Hola! Soy tu profesor de español. ¿En qué puedo ayudarte?", transliteration: "(Oh-lah! Soy too pro-feh-sor de es-pan-yol...)" },
                    DE: { text: "Hallo! Ich bin dein Deutschlehrer. Wie kann ich dir helfen?", transliteration: "(Hah-loh! Ikh bin dine Doytch-leh-rer...)" },
                    IT: { text: "Ciao! Sono il tuo insegnante di italiano. Come posso aiutarti?", transliteration: "(Chow! Soh-no il too-oh in-sen-nyan-te...)" },
                    PT: { text: "Olá! Sou seu professor de português. Como posso ajudar?", transliteration: "(Oh-lah! Soh seh-oo pro-feh-sor...)" },
                    JP: { text: "こんにちは！日本語の先生です。何かお手伝いしましょうか？", transliteration: "(Konnichiwa! Nihongo no sensei desu. Nanika otetsudai shimashouka?)" },
                    CN: { text: "你好！我是你的中文老师。有什么可以帮你的吗？", transliteration: "(Nǐ hǎo! Wǒ shì nǐ de zhōngwén lǎoshī...)" },
                    RU: { text: "Привет! Я твой учитель русского. Чем могу помочь?", transliteration: "(Privet! Ya tvoy uchitel russkogo...)" }
                };

                const greeting = greetings[learningLanguage] || greetings['EN'];
                setMessages([{
                    role: 'model',
                    content: greeting.text,
                    transliteration: greeting.transliteration
                }]);
            }
        });
    }, [learningLanguage]);

    const [isRecording, setIsRecording] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        const config = getConfig(learningLanguage);
        recognition.lang = config?.stt.lang || 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
            return;
        }

        setIsRecording(true);
        recognition.start();

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setInput(text);
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };
    };

    const { speak, isLoading: isTTSLoading } = useTTS();

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

        const response = await sendMessage(history, textToSend);

        setMessages(prev => [...prev, {
            role: 'model',
            content: response.text,
            transliteration: response.transliteration,
            correction: response.correction,
            suggestions: response.suggestions
        }]);

        setLoading(false);
        speak(response.text, learningLanguage);
    };

    const handleClear = async () => {
        if (confirm("Voulez-vous vraiment effacer l'historique de la conversation ?")) {
            setLoading(true);
            await clearChatHistory();
            setMessages([]);

            setMessages([{
                role: 'model',
                content: getConfig(learningLanguage)?.code === 'EN'
                    ? 'Hello! Shall we start over? What do you want to talk about?'
                    : (learningLanguage === 'ES' ? '¡Hola! ¿Empezamos de nuevo?' : 'Ready to start over!')
            }]);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden text-white bg-black">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-full h-96 bg-indigo-900/10 blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="px-4 py-4 md:px-6 flex justify-between items-center z-10 bg-gradient-to-b from-gray-900 via-gray-900/90 to-transparent">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            Chat IA
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">
                                {getConfig(learningLanguage).label}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
                            Online & Ready
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleClear}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition"
                    title="Nouvelle Conversation"
                >
                    <Trash2 size={20} />
                </button>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={twMerge(
                            "flex flex-col w-full animate-in slide-in-from-bottom-2 duration-300",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}
                    >
                        <div
                            className={twMerge(
                                "max-w-[85%] sm:max-w-[70%] p-4 sm:p-5 rounded-2xl shadow-lg relative border backdrop-blur-sm",
                                msg.role === 'user'
                                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border-indigo-500/30"
                                    : "bg-gray-900/80 text-gray-100 rounded-tl-none border-white/10"
                            )}
                        >
                            <div className="prose prose-invert max-w-none text-base leading-relaxed">
                                <ClickableSentence text={msg.content} userLocale={locale} contentLocale={learningLanguage} />
                            </div>

                            {msg.transliteration && (
                                <p className="text-xs text-indigo-200/50 italic mt-2 font-mono flex items-center gap-1">
                                    <Globe size={10} /> {msg.transliteration}
                                </p>
                            )}

                            {msg.role === 'model' && (
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        onClick={() => speak(msg.content, learningLanguage)}
                                        disabled={loading || isTTSLoading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-indigo-300 transition-colors"
                                    >
                                        {isTTSLoading ? <RefreshCw size={12} className="animate-spin" /> : <PlayCircle size={14} />}
                                        Listen
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Correction Display */}
                        {msg.role === 'model' && msg.correction && (
                            <div className="mt-3 ml-2 max-w-[80%] bg-red-900/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3 text-sm text-red-200 animate-in fade-in slide-in-from-left-2">
                                <span className="text-lg bg-red-500/20 rounded-full p-1">🪄</span>
                                <div>
                                    <span className="font-bold text-red-400 text-xs uppercase tracking-wide">Better way to say it:</span>
                                    <p className="italic text-gray-300 mt-0.5">"{msg.correction}"</p>
                                </div>
                            </div>
                        )}

                        {/* Suggestions Buttons */}
                        {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && (
                            <div className="flex flex-wrap gap-2 mt-4 ml-2 animate-in fade-in duration-500">
                                {msg.suggestions.map((suggestion, sIdx) => (
                                    <button
                                        key={sIdx}
                                        onClick={() => handleSend(suggestion)}
                                        className="group flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-sm transition-all"
                                    >
                                        <Sparkles size={12} className="opacity-50 group-hover:opacity-100" />
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex flex-col w-full items-start animate-pulse">
                        <div className="bg-gray-900/50 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Writing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </main>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-black/60 backdrop-blur-xl border-t border-white/5">
                <div className="max-w-4xl mx-auto flex gap-3 items-center relative">
                    <button
                        onClick={handleMicClick}
                        className={twMerge(
                            "p-3.5 rounded-full transition-all duration-300 shadow-lg",
                            isRecording
                                ? "bg-red-500 text-white animate-pulse shadow-red-500/30 scale-110"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <Mic size={20} />
                    </button>

                    <div className="flex-1 relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20 group-focus-within:opacity-100 transition duration-300 blur-sm"></div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isRecording ? "Listening..." : "Type your message..."}
                            className="relative w-full bg-gray-900 text-white placeholder:text-gray-500 rounded-full pl-6 pr-12 py-3.5 focus:outline-none focus:bg-gray-800 transition-colors border border-white/5"
                            disabled={loading}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-0 disabled:scale-75 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client'

import { useState, useRef, useEffect, use } from 'react';
import { sendMessage, getChatHistory, clearChatHistory, getUserLanguage } from './actions';
import { RefreshCw, PlayCircle, StopCircle, ArrowLeft, Send, Mic, Trash2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useTTS } from '@/hooks/useTTS';
import { ClickableSentence } from '@/components/ClickableWord';
import { Link } from '@/navigation';
import { getConfig } from '@/lib/languageConfig';

type Message = {
    role: 'user' | 'model';
    content: string;
    transliteration?: string | null;
    correction?: string | null;
    suggestions?: string[];
};

// Added ChatPageProps type definition
type ChatPageProps = {
    params: Promise<{
        locale: string;
    }>;
};

import { useTranslations } from 'next-intl';

export default function ChatPage({ params }: ChatPageProps) {
    const { locale } = use(params); // Added this line
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
        if (!textToSend.trim()) return; // Prevent sending empty manually, but allow clicking empty suggestion (which wont happen due to type)

        const userMsg: Message = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

        // Call server action expecting structured object
        const response = await sendMessage(history, textToSend);

        setMessages(prev => [...prev, {
            role: 'model',
            content: response.text, // Display natural text
            transliteration: response.transliteration, // Display transliteration
            correction: response.correction, // Display correction if any
            suggestions: response.suggestions // Show suggestions
        }]);
        setLoading(false);

        setLoading(false);

        speak(response.text, learningLanguage);
    };

    const handleClear = async () => {
        if (confirm("Voulez-vous vraiment effacer l'historique de la conversation ?")) {
            setLoading(true);
            await clearChatHistory();
            setMessages([]);
            setLoading(false);
            // Optional: Add initial greeting back
            setMessages([]);
            setLoading(false);
            // Optional: Add initial greeting back
            setMessages([{
                role: 'model',
                content: getConfig(learningLanguage)?.code === 'EN'
                    ? 'Hello! Shall we start over? What do you want to talk about?'
                    : (learningLanguage === 'ES' ? '¡Hola! ¿Empezamos de nuevo?' : 'Ready to start over!')
            }]);
        }
    };

    return (
        <div className="flex flex-col h-screen text-white">
            {/* Header */}
            <header className="p-4 glass-panel flex justify-between items-center sticky top-0 z-10 m-2 rounded-xl">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                            {getConfig(learningLanguage).code}
                        </div>
                        Chat IA ({getConfig(learningLanguage).label})
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-400 flex items-center gap-2 hidden md:flex">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        IA Connectée
                    </div>
                    <button
                        onClick={handleClear}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                        title="Nouvelle Conversation"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={twMerge(
                            "flex flex-col w-full mb-4",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}
                    >
                        <div
                            className={twMerge(
                                "max-w-[80%] p-4 rounded-2xl shadow-sm text-lg leading-relaxed relative border-none",
                                msg.role === 'user'
                                    ? "bg-yellow-500 text-black rounded-tr-none shadow-lg shadow-yellow-500/20"
                                    : "glass-card bg-gray-900/80 text-white rounded-tl-none border border-gray-700/50 shadow-md"
                            )}
                        >
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                                <ClickableSentence text={msg.content} userLocale={locale} contentLocale={learningLanguage} />
                            </div>
                            {msg.transliteration && (
                                <p className="text-sm text-yellow-500/80 italic mt-1 font-mono">{msg.transliteration}</p>
                            )}
                            {msg.role === 'model' && (
                                <button
                                    onClick={() => speak(msg.content, learningLanguage)}
                                    disabled={loading || isTTSLoading}
                                >
                                    {isTTSLoading ? <RefreshCw size={16} className="animate-spin" /> : <PlayCircle size={20} />}
                                    <span className="text-xs">{t('listen')}</span>
                                </button>
                            )}
                        </div>

                        {/* Correction Display */}
                        {msg.role === 'model' && msg.correction && (
                            <div className="mt-2 max-w-[80%] bg-red-900/20 border border-red-500/30 p-2 rounded-lg flex items-start gap-2 text-sm text-red-200 animate-in slide-in-from-top-2">
                                <span className="text-lg">💡</span>
                                <div>
                                    <span className="font-bold text-red-400 text-xs uppercase tracking-wide">Correction :</span>
                                    <p className="italic">"{msg.correction}"</p>
                                </div>
                            </div>
                        )}

                        {/* Suggestions Buttons */}
                        {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && (
                            <div className="flex flex-wrap gap-2 mt-4 max-w-[80%] animate-in fade-in duration-500">
                                {msg.suggestions.map((suggestion, sIdx) => (
                                    <button
                                        key={sIdx}
                                        onClick={() => handleSend(suggestion)}
                                        className="glass-button text-gray-300 hover:text-yellow-500 text-sm py-1.5 px-3 rounded-full transition text-left"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex flex-col w-full mb-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="glass-card bg-gray-900/80 p-4 rounded-2xl rounded-tl-none border border-gray-700/50 shadow-md flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-bold mr-2 uppercase tracking-wide">L'IA réfléchit</span>
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce delay-0"></div>
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce delay-150"></div>
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce delay-300"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="p-4 glass-panel m-2 rounded-xl">
                <div className="max-w-4xl mx-auto flex gap-2 items-center">
                    <button
                        onClick={handleMicClick}
                        className={twMerge(
                            "p-3 rounded-full transition duration-300",
                            isRecording
                                ? "bg-red-500 text-white animate-pulse"
                                : "glass-button text-yellow-500"
                        )}
                        title="Parler (Maintenir pour enregistrer)"
                    >
                        <Mic size={24} />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isRecording ? "Écoute en cours..." : `Écrivez en ${getConfig(learningLanguage).label}...`}
                            className="w-full bg-gray-800/50 text-white rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent"
                            disabled={loading}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLiveAPI } from '@/hooks/use-live-api';
import { createCustomScenario } from '@/app/[locale]/live/actions';
import { Loader2, Mic, MicOff, Volume2, XCircle, ArrowLeft, Sparkles, User, Coffee, Stethoscope, Globe, Zap } from 'lucide-react';
import { Link } from '@/navigation';
import { twMerge } from 'tailwind-merge';

const getRoles = (targetLang: string, sourceLang: string, ui: any, immersionMode: boolean, userLevel: string) => {
    // 1. Source Language (Base)
    let source = sourceLang;
    try {
        const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
        source = displayName.of(sourceLang) || sourceLang;
    } catch (e) {
        source = sourceLang === 'fr' ? 'French' : sourceLang === 'es' ? 'Spanish' : 'English';
    }

    // 2. Target Language (Learning)
    let target = targetLang;
    try {
        const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
        target = displayName.of(targetLang) || targetLang;
    } catch (e) {
        const fallbackMap: Record<string, string> = { 'ES': 'Spanish', 'EN': 'English', 'FR': 'French', 'DE': 'German', 'IT': 'Italian', 'PT': 'Portuguese', 'RU': 'Russian', 'JA': 'Japanese', 'ZH': 'Chinese', 'VI': 'Vietnamese', 'AR': 'Arabic', 'KO': 'Korean' };
        target = fallbackMap[targetLang] || targetLang;
    }

    if (immersionMode) {
        return [
            {
                id: 'tutor',
                label: `${ui.tutor}`,
                subLabel: "Strict & Immersive",
                icon: User,
                color: "from-blue-500 to-indigo-600",
                voice: 'Aoede',
                uiLabel: ui.choose,
                prompt: `SYSTEM INSTRUCTION: You are a strict Language Tutor.
Current Goal: Immerse the user completely in ${target}.
The user is level ${userLevel} (A1=Beginner, C2=Native).
Your Rules:
1. Speak ONLY in ${target}. NEVER switch to ${source}.
2. Speak clearly and slowly if user is A1/A2.
3. If the user struggles, explain using simpler words in ${target}.
4. Correct mistakes gently in ${target}.`
            },
            {
                id: 'barista',
                label: ui.barista,
                subLabel: "Fast & Casual",
                icon: Coffee,
                color: "from-orange-500 to-amber-600",
                voice: 'Puck',
                uiLabel: ui.choose,
                prompt: `SYSTEM INSTRUCTION: Roleplay. You are a Barista.
User Context: Customer ordering coffee.
User Level: ${userLevel} in ${target}.
Your Rules:
1. Speak ONLY in ${target}.
2. Be friendly and fast.
3. If confused, ask clarifying questions in ${target}.`
            },
            {
                id: 'doctor',
                label: ui.doctor,
                subLabel: "Professional & Calm",
                icon: Stethoscope,
                color: "from-emerald-500 to-teal-600",
                voice: 'Fenrir',
                uiLabel: ui.choose,
                prompt: `SYSTEM INSTRUCTION: Roleplay. You are a Doctor.
User Context: Patient consultation.
User Level: ${userLevel} in ${target}.
Your Rules:
1. Speak ONLY in ${target}.
2. be professional and empathetic.
3. Use simple medical terms in ${target}.`
            }
        ];
    }

    return [
        {
            id: 'tutor',
            label: `${ui.tutor}`,
            subLabel: "Guided Learning",
            icon: User,
            color: "from-indigo-500 to-purple-600",
            voice: 'Aoede',
            uiLabel: ui.choose,
            prompt: `SYSTEM INSTRUCTION: You are a professional Language Tutor.
Current Goal: Teach ${target} to a ${source} speaker.
The user is level ${userLevel} in ${target}.
Your Rules:
1. Speak clearly and patiently.
2. Explanations must be in ${source} (User's native language).
3. Practice exercises must be in ${target}.
4. ADJUST DIFFICULTY to ${userLevel}.`
        },
        {
            id: 'barista',
            label: ui.barista,
            subLabel: "Roleplay: Cafe",
            icon: Coffee,
            color: "from-orange-500 to-red-600",
            voice: 'Puck',
            uiLabel: ui.choose,
            prompt: `SYSTEM INSTRUCTION: Roleplay. You are a Charismatic Barista.
User Context: Customer ordering coffee.
User Level: ${userLevel} in ${target}.
Your Rules:
1. Speak primarily in ${target}.
2. Be energetic and friendly.`
        },
        {
            id: 'doctor',
            label: ui.doctor,
            subLabel: "Roleplay: Clinic",
            icon: Stethoscope,
            color: "from-cyan-500 to-blue-600",
            voice: 'Fenrir',
            uiLabel: ui.choose,
            prompt: `SYSTEM INSTRUCTION: Roleplay. You are a Doctor.
User Context: Patient consultation.
User Level: ${userLevel} in ${target}.
Your Rules:
1. Speak primarily in ${target}.
2. Be professional and empathetic.`
        },
        {
            id: 'custom',
            label: 'Custom',
            subLabel: "Create Scenario",
            icon: Sparkles,
            color: "from-pink-500 to-rose-600",
            voice: 'Puck',
            uiLabel: ui.choose,
            prompt: '' // Dynamic
        }
    ];
};

export type Transcript = {
    role: 'user' | 'model';
    text: string;
};

interface LiveCoachClientProps {
    apiKey: string;
    targetLang?: string;
    sourceLang?: string;
    uiLabels?: { choose: string; tutor: string; barista: string; doctor: string };
    customSystemInstruction?: string;
    hideRoleSelector?: boolean;
    onTranscriptUpdate?: (transcript: Transcript) => void;
    userLevel?: string;
}

export default function LiveCoachClient({
    apiKey,
    targetLang = 'ES',
    sourceLang = 'en',
    uiLabels,
    customSystemInstruction,
    hideRoleSelector = false,
    onTranscriptUpdate,
    userLevel = 'A1'
}: LiveCoachClientProps) {

    const defaultLabels = { choose: 'Choose your conversation partner:', tutor: 'Tutor', barista: 'Barista', doctor: 'Doctor' };
    const ui = uiLabels || defaultLabels;

    const handleMessage = (data: any) => {
        if (!onTranscriptUpdate) return;
        if (data.serverContent?.modelTurn?.parts) {
            const textPart = data.serverContent.modelTurn.parts.find((p: any) => p.text);
            if (textPart) {
                onTranscriptUpdate({ role: 'model', text: textPart.text });
            }
        }
    };

    const { connect, disconnect, status, isSpeaking, analyser } = useLiveAPI(apiKey, handleMessage);
    const [immersionMode, setImmersionMode] = useState(false);

    // Memoize roles to prevent re-renders
    const roles = useMemo(() => getRoles(targetLang, sourceLang, ui, immersionMode, userLevel), [targetLang, sourceLang, ui, immersionMode, userLevel]);

    const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0].id);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

    useEffect(() => {
        const currentRoleStillExists = roles.some(role => role.id === selectedRoleId);
        if (!currentRoleStillExists) {
            setSelectedRoleId(roles[0].id);
        }
    }, [roles, selectedRoleId]);

    // Enhanced Visualizer
    useEffect(() => {
        if (!analyser || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            // Dynamic radius based on volume
            const volume = dataArray.reduce((a, b) => a + b) / bufferLength;
            const radius = 60 + (volume / 255) * 40;

            // Draw Glow
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 2);
            gradient.addColorStop(0, `rgba(${status === 'connected' ? (isSpeaking ? '99, 102, 241' : '168, 85, 247') : '107, 114, 128'}, 0.8)`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw Core
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = status === 'connected' ? (isSpeaking ? '#818cf8' : '#a855f7') : '#4b5563';
            ctx.fill();
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [status, analyser, isSpeaking]);

    const [customTopic, setCustomTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    const handleGenerateScenario = async () => {
        if (!customTopic.trim()) return;
        setIsGenerating(true);
        try {
            const result = await createCustomScenario(customTopic, targetLang);
            if (result.success && result.instruction) {
                setGeneratedPrompt(result.instruction);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleConnection = () => {
        if (status === 'connected' || status === 'connecting') {
            disconnect();
        } else {
            const systemInstruction = selectedRoleId === 'custom'
                ? (generatedPrompt || customSystemInstruction || selectedRole.prompt)
                : (customSystemInstruction || selectedRole.prompt);
            const voice = customSystemInstruction ? 'Fenrir' : selectedRole.voice;

            if (selectedRoleId === 'custom' && !systemInstruction) {
                alert("Please generate a scenario first.");
                return;
            }

            console.log("Connecting to Live API with:", { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voice, systemInstruction });

            connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                voiceName: voice,
                systemInstruction: systemInstruction
            });
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] relative overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl">

            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-1000 opacity-20 pointer-events-none ${selectedRole.color}`}></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

            {/* Header - Only show if not in embedded/career mode (hideRoleSelector is false) */}
            {!hideRoleSelector && (
                <div className="relative z-10 flex justify-between items-center p-6">
                    <Link href="/dashboard" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition">
                        <ArrowLeft size={24} />
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-white/50">{targetLang}</span>
                        <button
                            onClick={() => status === 'disconnected' && setImmersionMode(!immersionMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${immersionMode
                                ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Zap size={14} className={immersionMode ? "fill-current" : ""} />
                            IMMERSION
                        </button>
                        <div className={`h-2.5 w-2.5 rounded-full ${status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                    </div>
                </div>
            )}

            {/* Main Visualizer Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] opacity-90 transition-opacity duration-500"
                />

                {/* Status Text Overlay */}
                <div className="absolute bottom-20 text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight animate-pulse-glow">
                        {status === 'connected'
                            ? (isSpeaking ? "Listening..." : "Live Coach Active")
                            : (status === 'connecting' ? "Connecting..." : "Ready to Start")}
                    </h2>
                    {status === 'connected' && (
                        <p className="text-white/50 text-sm">Speaking with {selectedRole.label}</p>
                    )}
                </div>
            </div>

            {/* Bottom Controls / Role Selector */}
            <div className="relative z-20 p-6 bg-black/40 backdrop-blur-xl border-t border-white/10">

                {status === 'disconnected' && !hideRoleSelector ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {roles.map(role => {
                            const Icon = role.icon;
                            const isSelected = selectedRole.id === role.id;
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRoleId(role.id)}
                                    className={`relative p-4 rounded-xl border text-left transition-all duration-300 group overflow-hidden ${isSelected
                                        ? 'bg-white/10 border-white/30 shadow-lg scale-[1.02]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>{role.label}</div>
                                    <div className="text-xs text-gray-500">{role.subLabel}</div>
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                {/* Custom Scenario Input */}
                {selectedRoleId === 'custom' && status === 'disconnected' && (
                    <div className="mb-6 flex gap-2">
                        <input
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="Describe a scenario (e.g. Asking for directions in Tokyo)..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
                        />
                        <button
                            onClick={handleGenerateScenario}
                            disabled={!customTopic.trim() || isGenerating}
                            className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold disabled:opacity-50 hover:bg-indigo-500 transition flex items-center gap-2"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        </button>
                    </div>
                )}

                {/* Main Action Button */}
                <div className="flex justify-center">
                    <button
                        onClick={toggleConnection}
                        className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3
                            ${status === 'connected'
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                                : 'bg-white text-black hover:bg-gray-100 shadow-white/10'
                            }
                        `}
                    >
                        {status === 'connected' ? (
                            <>
                                <XCircle className="w-6 h-6" />
                                End Session
                            </>
                        ) : (
                            <>
                                <Mic className="w-6 h-6" />
                                Start Conversation
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

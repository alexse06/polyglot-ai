'use client';

import { useState, useRef, useEffect } from 'react';
import { useLiveAPI } from '@/hooks/use-live-api';
import { Mic, MicOff, Volume2, XCircle } from 'lucide-react';

// ... (imports)

const getRoles = (targetLang: string, sourceLang: string, ui: any) => {
    // 1. Source Language (Base): Support ANY Interface Language (FR, ES, EN, RU, etc.)
    // Use Intl.DisplayNames to get the English name of the Source Language for the prompt
    let source = sourceLang;
    try {
        const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
        source = displayName.of(sourceLang) || sourceLang;
    } catch (e) {
        source = sourceLang === 'fr' ? 'French' : sourceLang === 'es' ? 'Spanish' : 'English';
    }

    // 2. Target Language (Learning): Support ANY language code (e.g., DE, IT, PT, RU, JA)
    // Use Intl.DisplayNames to get the full English name for the System Instruction
    let target = targetLang;
    try {
        const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
        target = displayName.of(targetLang) || targetLang;
    } catch (e) {
        // Fallback to simpler map or raw code if Intl fails (rare)
        const fallbackMap: Record<string, string> = { 'ES': 'Spanish', 'EN': 'English', 'FR': 'French', 'DE': 'German', 'IT': 'Italian', 'PT': 'Portuguese', 'RU': 'Russian', 'JA': 'Japanese', 'ZH': 'Chinese' };
        target = fallbackMap[targetLang] || targetLang;
    }

    return [
        {
            id: 'tutor',
            label: `${ui.tutor} (${target})`,
            voice: 'Aoede',
            uiLabel: ui.choose, // Hack to pass UI label
            prompt: `SYSTEM INSTRUCTION: You are a professional Language Tutor.
Current Goal: Teach ${target} to a ${source} speaker.
Your Rules:
1. Speak clearly and patiently.
2. Explanations must be in ${source} (User's native language).
3. Examples and practice exercises must be in ${target} (Language being learned).
4. Correct the user's mistakes gently in ${source}.
5. CRITICAL: Start the conversation by introducing yourself in ${target}, followed immediately by the translation in ${source}.`
        },
        {
            id: 'barista',
            label: ui.barista,
            voice: 'Puck',
            uiLabel: ui.choose,
            prompt: `SYSTEM INSTRUCTION: Roleplay. You are a Charismatic Barista at a famous specialized coffee shop in a ${target}-speaking city.
User Context: The user is a customer approaching the counter.
Your Rules:
1. Speak ONLY in ${target}. Do NOT speak ${source} unless the user is completely stuck.
2. Be energetic, friendly, and fast-paced (it's a busy morning).
3. Suggest specific house specialties (e.g., "Vanilla Latte", "Cold Brew", "Matcha") to provoke conversation.
4. If the user makes a grammar mistake, repeat their sentence correctly ("Ah, you mean [correction]?") as a natural confirmation, then move on.
5. Start by greeting them warmly and asking what they'd like to order today.`
        },
        {
            id: 'doctor',
            label: ui.doctor,
            voice: 'Fenrir',
            uiLabel: ui.choose,
            prompt: `SYSTEM INSTRUCTION: Roleplay. You are a Senior Medical Doctor in a clinic.
User Context: The user is a patient coming for a consultation.
Your Rules:
1. Speak primarily in ${target}.
2. Be professional, empathetic, and calm.
3. Use precise medical terminology in ${target}, but if the user seems confused, explain it simply in ${target} (or ${source} only as a last resort).
4. Ask clarifying questions about their symptoms (pain level, duration, history).
5. Start by politely asking the patient not to worry and to describe what brings them in today.`
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
}

export default function LiveCoachClient({
    apiKey,
    targetLang = 'ES',
    sourceLang = 'en',
    uiLabels,
    customSystemInstruction,
    hideRoleSelector = false,
    onTranscriptUpdate
}: LiveCoachClientProps) {

    // Default UI labels if not provided (fallback)
    const defaultLabels = { choose: 'Choose your conversation partner:', tutor: 'Tutor', barista: 'Barista', doctor: 'Doctor' };
    const ui = uiLabels || defaultLabels;

    // Handle incoming messages for transcript
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
    const roles = getRoles(targetLang, sourceLang, ui);

    // Initialize with first role, but update when props change
    const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0].id);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Derived selected role object to ensure it always reflects current props
    const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

    // Effect to update selected role when targetLang/sourceLang changes
    useEffect(() => {
        // When `roles` array changes (due to targetLang/sourceLang change),
        // check if the currently selected role ID is still valid.
        const currentRoleStillExists = roles.some(role => role.id === selectedRoleId);
        if (!currentRoleStillExists) {
            // If the previously selected role no longer exists in the new list,
            // default to the first role in the new list.
            setSelectedRoleId(roles[0].id);
        }
    }, [roles, selectedRoleId]); // Depend on roles and selectedRoleId

    // Visualizer Effect
    useEffect(() => {
        if (status !== 'connected' || !analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 80; // Radius of the inner circle (avatar)
            const bars = 60; // Number of bars to draw
            const step = Math.floor(bufferLength / bars);

            ctx.beginPath();
            for (let i = 0; i < bars; i++) {
                const value = dataArray[i * step];
                const height = (value / 255) * 50; // Max height 50px
                const angle = (Math.PI * 2 * i) / bars;

                // Start point on circle
                const x1 = centerX + Math.cos(angle) * (radius + 5);
                const y1 = centerY + Math.sin(angle) * (radius + 5);

                // End point outward
                const x2 = centerX + Math.cos(angle) * (radius + 5 + height);
                const y2 = centerY + Math.sin(angle) * (radius + 5 + height);

                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }

            ctx.lineCap = 'round';
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#818cf8'; // Indigo-400
            ctx.stroke();

            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#6366f1';
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [status, analyser]);

    const toggleConnection = () => {
        if (status === 'connected' || status === 'connecting') {
            disconnect();
        } else {
            const systemInstruction = customSystemInstruction || selectedRole.prompt;
            const voice = customSystemInstruction ? 'Fenrir' : selectedRole.voice;

            connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                voiceName: voice,
                systemInstruction: systemInstruction
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900/50 rounded-xl p-8 border border-white/10 backdrop-blur-sm">

            {/* Role Selection - Hidden in Career Mode */}
            {!hideRoleSelector && (
                <div className="mb-8 w-full max-w-md">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-gray-400 text-sm block">{(roles[0] as any).uiLabel}</label>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-gray-400 border border-white/5">
                            Target: {roles[0].label.replace(/.*\((.*)\)/, '$1')}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => status === 'disconnected' && setSelectedRoleId(role.id)}
                                disabled={status !== 'disconnected'}
                                className={`p-3 rounded-lg border text-sm transition-all
                                    ${selectedRole.id === role.id
                                        ? 'bg-indigo-600 border-indigo-500 text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }
                                    ${status !== 'disconnected' ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Visualizer / Status Area */}
            <div className="relative w-80 h-80 mb-8 flex items-center justify-center">

                {/* Canvas Visualizer Overlay */}
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="absolute inset-0 z-0 pointer-events-none"
                />

                {/* Inner Circle / Avatar */}
                <div className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500
                    ${status === 'connected' ? 'bg-indigo-900/80 shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-gray-800'}
                    ${isSpeaking ? 'scale-105' : ''}
                `}>
                    {status === 'connected' ? (
                        isSpeaking ?
                            <Volume2 className="w-16 h-16 text-indigo-400 animate-pulse" /> :
                            <Mic className="w-16 h-16 text-indigo-400" />
                    ) : (
                        <MicOff className="w-12 h-12 text-gray-600" />
                    )}
                </div>

                {/* Status Badge */}
                <div className={`absolute bottom-8 px-4 py-1 rounded-full text-xs font-mono uppercase tracking-wider z-20
                    ${status === 'connected' ? 'bg-green-900 text-green-300 border border-green-700' :
                        status === 'connecting' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' :
                            status === 'error' ? 'bg-red-900 text-red-300 border border-red-700' :
                                'bg-gray-800 text-gray-400 border border-gray-700'}
                `}>
                    {status}
                </div>
            </div>

            {/* Controls */}
            <button
                onClick={toggleConnection}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 relative z-20
                    ${status === 'connected'
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
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

            {status === 'error' && (
                <p className="mt-4 text-red-400 text-sm max-w-xs text-center">
                    Connection failed. Please check your internet or try again later.
                </p>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCharacter, ChronoCharacter } from '@/lib/chrono-characters';
import { getElevenLabsKey, chatWithChronoCharacter } from '../actions';
import { Phone, PhoneOff, Mic, Volume2, User, Loader2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceRecorder from '@/components/VoiceRecorder'; // Assuming this component exists and works
import Link from 'next/link';

// Client-side TTS Helper (Duplicated for stability/independence)


export default function ChronoCallPage() {
    const params = useParams();
    const router = useRouter();
    const characterId = params.characterId as string;

    // State
    const [character, setCharacter] = useState<ChronoCharacter | null>(null);
    const [callState, setCallState] = useState<'INCOMING' | 'CONNECTING' | 'ACTIVE' | 'ENDED' | 'VICTORY'>('INCOMING');
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ role: string, parts: string }[]>([]);

    // Audio Refs
    const bgAudioRef = useRef<HTMLAudioElement | null>(null);
    const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize
    useEffect(() => {
        const char = getCharacter(characterId);
        if (!char) {
            alert("Number not found");
            router.push('/chrono');
            return;
        }
        setCharacter(char);
    }, [characterId, router]);

    // Handle Call Action
    const acceptCall = () => {
        setCallState('CONNECTING');

        // Start Background Audio if available
        if (character?.backgroundSfx) {
            bgAudioRef.current = new Audio(character.backgroundSfx);
            bgAudioRef.current.loop = true;
            bgAudioRef.current.volume = 0.3; // Low volume background
            bgAudioRef.current.play().catch(e => console.log("Audio play blocked", e));
        }

        // Simulate Connection Delay then Speak First Message
        setTimeout(async () => {
            setCallState('ACTIVE');
            if (character && apiKey) {
                await speak(character.firstMessage);
            }
        }, 1500);
    };

    const endCall = () => {
        setCallState('ENDED');
        if (bgAudioRef.current) {
            bgAudioRef.current.pause();
            bgAudioRef.current = null;
        }
        if (voiceAudioRef.current) {
            voiceAudioRef.current.pause();
        }
    };

    const speak = async (text: string) => {
        if (!character) return;

        // Clean text for display (remove tags)
        const cleanText = text.replace(/\[PROBLEM SOLVED\]/g, "").trim();
        const isVictory = text.includes("[PROBLEM SOLVED]");

        console.log("Speaking:", cleanText, "Victory:", isVictory);

        // Add to history
        setMessages(prev => [...prev, { role: 'model', parts: cleanText }]); // Display cleaned text

        // Generate Audio via Server Action (Gemini TTS)
        if (cleanText) {
            // Dynamically import to ensure we use valid Server Action
            const { generateChronoAudio } = await import('../actions');

            // Assumes user language context is handled by action or defaults to ES. 
            // Ideally we pass the user's learning language or just "ES"/"EN".
            // Since the Character speaks the target language, we let the action/gemini handle it.
            // We just need the voiceId.
            const audioResult = await generateChronoAudio(cleanText, character.voiceId);

            if (audioResult && audioResult.data) {
                if (voiceAudioRef.current) voiceAudioRef.current.pause();

                // Decode base64 to blob url
                const byteCharacters = atob(audioResult.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: audioResult.mimeType });
                const audioUrl = URL.createObjectURL(blob);

                voiceAudioRef.current = new Audio(audioUrl);

                // If victory, wait for audio to finish then show victory
                voiceAudioRef.current.onended = () => {
                    if (isVictory) {
                        setCallState('VICTORY');
                    }
                };

                voiceAudioRef.current.play();
            } else if (isVictory) {
                // Fallback if audio fails but we won
                setTimeout(() => setCallState('VICTORY'), 2000);
            }
        }
    };

    const handleUserVoiceInput = async (file: File) => {
        const { transcribeAudio } = await import('../actions');

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Use Server Action to Transcribe
        const sttResult = await transcribeAudio(base64, "EN");
        const userText = sttResult.transcript;

        setMessages(prev => [...prev, { role: 'user', parts: userText }]);

        // Send to Chrono Chat
        const response = await chatWithChronoCharacter(characterId, userText, messages);

        if (response.success && response.text) {
            await speak(response.text);
        }
    };

    if (!character) return <div className="min-h-screen bg-black" />;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-mono">

            {/* Background Image / Blur */}
            <div className="absolute inset-0 z-0 opacity-20">
                {/* Placeholder for character image blur */}
                <div className="w-full h-full bg-gradient-to-b from-gray-900 via-purple-900 to-black" />
            </div>

            {/* HEADER */}
            <header className="relative z-10 p-6 flex justify-between items-center bg-transparent">
                <div className="text-xs text-green-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    ENCRYPTED LINE
                </div>
                <div className="text-xs text-gray-500">
                    {callState === 'ACTIVE' ? '00:42' : '--:--'}
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">


                {/* 1. SCANLINE OVERLAY */}
                <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                <div className="pointer-events-none absolute inset-0 z-20 opacity-10 animate-pulse bg-gradient-to-b from-transparent via-green-500/5 to-transparent" />


                {/* INCOMING CALL UI */}
                {callState === 'INCOMING' && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-8 relative z-30"
                    >
                        <div className="relative group cursor-pointer" onClick={acceptCall}>
                            <div className="w-40 h-40 rounded-full bg-black border-4 border-gray-700 flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(0,255,0,0.2)] group-hover:shadow-[0_0_80px_rgba(0,255,0,0.4)] transition-all duration-500">
                                {character.emoji}
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-green-500/50 animate-[ping_2s_ease-in-out_infinite]" />
                            <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-[ping_3s_ease-in-out_infinite_0.5s]" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter uppercase glitch-text" data-text={character.name}>
                                {character.name}
                            </h2>
                            <p className="text-green-500/80 uppercase tracking-[0.3em] text-xs font-bold animate-pulse text-center border-y border-green-500/20 py-2">
                                Incoming Encrypted Transmission
                            </p>
                        </div>

                        <div className="flex gap-12 mt-8">
                            <button onClick={() => router.push('/chrono')} className="flex flex-col items-center gap-2 group">
                                <div className="p-5 rounded-full bg-red-900/20 border border-red-500/50 group-hover:bg-red-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 backdrop-blur-sm text-red-500">
                                    <PhoneOff size={28} />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Decline</span>
                            </button>

                            <button onClick={acceptCall} className="flex flex-col items-center gap-2 group">
                                <div className="p-5 rounded-full bg-green-900/20 border border-green-500/50 group-hover:bg-green-500 group-hover:text-black group-hover:scale-110 transition-all duration-300 backdrop-blur-sm text-green-500 animate-[bounce_1s_infinite]">
                                    <Phone size={28} />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">Accept</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* CONNECTING UI */}
                {callState === 'CONNECTING' && (
                    <div className="flex flex-col items-center gap-4 z-30">
                        <Loader2 className="animate-spin text-green-500" size={48} />
                        <div className="text-center space-y-1">
                            <p className="text-green-500 font-mono uppercase tracking-widest text-xs">Estabilishing Quantum Link...</p>
                            <p className="text-green-500/50 font-mono text-[10px]">{Math.random().toString(16).substring(2, 10).toUpperCase()}-{Math.random().toString(16).substring(2, 6).toUpperCase()}</p>
                        </div>
                    </div>
                )}

                {/* ACTIVE CALL UI */}
                {callState === 'ACTIVE' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-between h-full w-full max-w-sm pb-10 z-30"
                    >

                        {/* Persona */}
                        <div className="flex flex-col items-center gap-6 mt-10">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-black border border-green-500/30 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(0,255,0,0.1)] grayscale hover:grayscale-0 transition-all duration-1000">
                                    {character.emoji}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-900 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/30 font-bold tracking-wider">
                                    LIVE
                                </div>
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold uppercase tracking-tight text-white">{character.name}</h2>
                                <p className="text-green-500/60 text-xs uppercase tracking-[0.2em] mt-1">{character.title}</p>
                            </div>
                        </div>

                        {/* Transcript Area */}
                        <div className="w-full h-32 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                            <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-60">
                                <div className="text-center px-4 space-y-2">
                                    {messages.slice(-1).map((m, i) => (
                                        <motion.p
                                            key={i}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className={`text-sm font-mono ${m.role === 'model' ? 'text-green-400' : 'text-blue-400'}`}
                                        >
                                            <span className="opacity-50 text-[10px] uppercase mr-2 block mb-1">{m.role === 'model' ? character.name : 'You'}</span>
                                            &quot;{m.parts}&quot;
                                        </motion.p>
                                    ))}
                                    {messages.length === 0 && <p className="text-gray-600 text-xs italic">Waiting for signal...</p>}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="w-full space-y-6">
                            {/* Audio Visualizer (Fake but cooler) */}
                            <div className="flex justify-center items-center gap-1.5 h-16 bg-green-950/20 rounded-xl border border-green-500/10 p-4">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ["20%", "60%", "20%"] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.6 + Math.random() * 0.4,
                                            delay: Math.random() * 0.5
                                        }}
                                        className="w-1.5 bg-green-500 rounded-full opacity-60 shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                                    />
                                ))}
                            </div>

                            <div className="bg-black/50 border border-gray-800 rounded-3xl p-1 backdrop-blur-md">
                                <VoiceRecorder onRecordingComplete={handleUserVoiceInput} />
                            </div>

                            <button onClick={endCall} className="w-full py-4 rounded-xl bg-red-950/30 text-red-500 font-bold border border-red-500/20 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all uppercase tracking-widest text-xs">
                                Terminate Uplink
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* VICTORY UI */}
                {callState === 'VICTORY' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center gap-6 z-40 bg-black/90 p-8 rounded-3xl border-2 border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.2)]"
                    >
                        <Trophy className="text-yellow-500 w-24 h-24 animate-bounce" />
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black text-yellow-500 uppercase tracking-tighter">Mission Accomplished</h2>
                            <p className="text-yellow-200/60 uppercase tracking-widest text-xs">History Preserved</p>
                        </div>

                        <div className="flex items-center gap-2 bg-yellow-900/20 px-6 py-3 rounded-full border border-yellow-500/30">
                            <span className="text-yellow-500 font-bold">+500 XP</span>
                        </div>

                        <Link href="/chrono" className="block px-10 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20 uppercase tracking-wider text-sm mt-4">
                            New Mission
                        </Link>
                    </motion.div>
                )}

                {/* FAIL/ENDED UI */}
                {callState === 'ENDED' && (
                    <div className="text-center space-y-6 z-30">
                        <h2 className="text-2xl font-bold text-gray-500 uppercase tracking-widest">Connection Lost</h2>
                        <Link href="/chrono" className="block px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition">
                            Return to Base
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
}

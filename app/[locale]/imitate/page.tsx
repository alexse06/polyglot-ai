'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';
import { getElevenLabsKey } from './actions';

// Dynamic Key Retrieval
const createVoiceClientSide = async (file: File, apiKey: string) => {
    const formData = new FormData();
    formData.append('name', `User Clone ${Date.now()}`);
    formData.append('files', file);
    formData.append('description', 'User cloned voice');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        const json = await response.json();
        return { success: true, voiceId: json.voice_id };
    } catch (e) {
        return { success: false, error: String(e) };
    }
};

const generateAudioClientSide = async (voiceId: string, text: string, apiKey: string) => {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.35,
                    similarity_boost: 0.85,
                    style: 0.5,
                    use_speaker_boost: true
                }
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        return { success: true, audio: url };
    } catch (e) {
        return { success: false, error: String(e) };
    }
};
import { motion, AnimatePresence } from 'framer-motion';

export default function ImitatePage() {
    const [step, setStep] = useState(1); // 1: Record, 2: Cloning, 3: Ready
    const [recordingFile, setRecordingFile] = useState<File | null>(null);
    const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [mode, setMode] = useState<'TEXT' | 'MIRROR'>('TEXT'); // New Mode Switch

    // Fetch Key Securely
    useEffect(() => {
        getElevenLabsKey().then((key: string | null) => {
            if (key) setApiKey(key);
            else alert("Error: Could not retrieve API Key.");
        });
    }, []);

    // Testing logic
    const [textToSay, setTextToSay] = useState("");
    const [transcript, setTranscript] = useState("");
    const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isProcessingMirror, setIsProcessingMirror] = useState(false);

    const handleRecordingComplete = (file: File) => {
        setRecordingFile(file);
    };

    const handleClone = async () => {
        if (!recordingFile || !apiKey) return;
        setStep(2);

        // Use Client Side logic with fetched key
        const result = await createVoiceClientSide(recordingFile, apiKey);

        if (result.success && result.voiceId) {
            setClonedVoiceId(result.voiceId);
            setStep(3);
        } else {
            alert("Failed to clone voice (Client): " + result.error);
            setStep(1);
        }
    };

    const handleSpeak = async () => {
        if (!clonedVoiceId || !textToSay || !apiKey) return;
        setIsGenerating(true);
        setGeneratedAudio(null);

        // Use Client Side logic with fetched key
        const result = await generateAudioClientSide(clonedVoiceId, textToSay, apiKey);

        if (result.success && result.audio) {
            setGeneratedAudio(result.audio);
        } else {
            alert("Failed to generate audio.");
        }
        setIsGenerating(false);
    };

    const [targetLanguageName, setTargetLanguageName] = useState("Target Language");

    // Fetch Language Name
    useEffect(() => {
        import('./actions').then(({ getUserLanguageName }) => {
            getUserLanguageName().then(name => setTargetLanguageName(name));
        });
    }, []);

    // Magic Mirror Flow
    const handleMirrorRecording = async (file: File) => {
        if (!clonedVoiceId || !apiKey) return;
        setIsProcessingMirror(true);
        setGeneratedAudio(null);
        setTranscript("");
        setTextToSay(""); // Clear previous correction

        try {
            // 1. Send to Gemini for Correction
            const formData = new FormData();
            formData.append('file', file);

            // Invoke Server Action
            const { correctAudioAction } = await import('./actions');
            const geminiResult = await correctAudioAction(formData);

            setTranscript(geminiResult.transcript);
            setTextToSay(geminiResult.correction);

            // 2. Send Correction to ElevenLabs (Client Side)
            const ttsResult = await generateAudioClientSide(clonedVoiceId, geminiResult.correction, apiKey);
            if (ttsResult.success && ttsResult.audio) {
                setGeneratedAudio(ttsResult.audio);
            }
        } catch (e) {
            console.error(e);
            alert("Error in Mirror Mode");
        } finally {
            setIsProcessingMirror(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col p-6">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft />
                </Link>
                <h1 className="font-bold text-2xl flex items-center gap-2">
                    <span className="text-purple-500">Doppelgänger</span> Protocol
                </h1>
            </header>

            <main className="flex-1 flex flex-col items-center max-w-lg mx-auto w-full gap-8">

                {/* Step 1: Record */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-6 text-center"
                    >
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-gray-300 mb-4">Step 1: Calibration</h2>
                            <p className="text-gray-400 mb-6">Read the following text aloud to calibrate the cloning engine:</p>

                            <blockquote className="bg-black/50 p-4 rounded-lg text-purple-200 italic font-serif text-lg mb-6">
                                "The quick brown fox jumps over the lazy dog. I solemnly swear that I am up to no good, and I grant this AI permission to mimic my voice for science."
                            </blockquote>

                            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                        </div>

                        {recordingFile && (
                            <button
                                onClick={handleClone}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles /> Initiate Cloning Sequence
                            </button>
                        )}
                    </motion.div>
                )}

                {/* Step 2: Loading */}
                {step === 2 && (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-purple-400 animate-pulse">Analyzing vocal biometrics...</p>
                    </div>
                )}

                {/* Step 3: Playground */}
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                                <Wand2 size={40} className="text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Identity Cloned</h2>
                        </div>

                        {/* Mode Switcher */}
                        <div className="bg-gray-900 p-1 rounded-lg flex gap-1">
                            <button
                                onClick={() => setMode('TEXT')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${mode === 'TEXT' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Text to Speech
                            </button>
                            <button
                                onClick={() => setMode('MIRROR')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${mode === 'MIRROR' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Magic Mirror ✨
                            </button>
                        </div>

                        {mode === 'TEXT' ? (
                            <div className="space-y-4 animate-fade-in">
                                <label className="text-sm font-bold text-gray-500 uppercase">Make it say anything</label>
                                <textarea
                                    value={textToSay}
                                    onChange={(e) => setTextToSay(e.target.value)}
                                    placeholder="Type something..."
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-purple-500 outline-none h-32 resize-none"
                                />

                                <button
                                    onClick={handleSpeak}
                                    disabled={!textToSay || isGenerating}
                                    className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? "Synthesizing..." : <><Play size={20} fill="black" /> Speak</>}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-6 rounded-2xl text-center">
                                    <h3 className="text-lg font-bold text-indigo-300 mb-2">Speak & Be Corrected</h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        Say something in <b>{targetLanguageName}</b> (even with mistakes). We'll fix it and say it back with <b>YOUR</b> voice.
                                    </p>

                                    {isProcessingMirror ? (
                                        <div className="flex flex-col items-center justify-center py-4 gap-3">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs text-indigo-300 animate-pulse">Gemini is correcting...</p>
                                        </div>
                                    ) : (
                                        <VoiceRecorder onRecordingComplete={handleMirrorRecording} />
                                    )}
                                </div>

                                {(transcript || textToSay) && (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-red-900/20 rounded-xl border border-red-500/20">
                                            <p className="text-xs text-red-400 uppercase font-bold mb-1">You said:</p>
                                            <p className="text-gray-300 italic">"{transcript}"</p>
                                        </div>
                                        <div className="p-4 bg-green-900/20 rounded-xl border border-green-500/20">
                                            <p className="text-xs text-green-400 uppercase font-bold mb-1">Correction:</p>
                                            <p className="text-white text-lg font-medium">"{textToSay}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {generatedAudio && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-900 p-4 rounded-xl flex flex-col items-center gap-2 border border-purple-500/30"
                            >
                                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                                    {mode === 'MIRROR' ? 'Your Perfect Self' : 'Generated Audio'}
                                </p>
                                <audio controls src={generatedAudio} autoPlay className="w-full" />
                            </motion.div>
                        )}

                        <button
                            onClick={() => setStep(1)}
                            className="w-full text-gray-500 hover:text-white text-sm mt-8"
                        >
                            Reset Identity
                        </button>
                    </motion.div>
                )}

            </main>
        </div>
    );
}

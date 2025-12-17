'use client'

import { useState, useEffect, useRef } from 'react';
import { getPronunciationChallenge, checkPronunciation } from './actions';
import { Mic, RefreshCw, Volume2, ArrowLeft, Loader2, Award, Zap, Activity } from 'lucide-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useTTS } from '@/hooks/useTTS';
import { ClickableSentence } from '@/components/ClickableWord';
import { useLocale } from 'next-intl';
import { useRouter } from '@/navigation';

export default function PronouncePage() {
    const locale = useLocale();
    const router = useRouter();
    const [challenge, setChallenge] = useState<{ sentence: string, translation: string, targetPhoneme?: string, transliteration?: string } | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ score: number, feedback: string, transcription: string, correct: boolean } | null>(null);

    // MediaRecorder refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const { speak, isLoading: isTTSLoading } = useTTS();
    const [userLevel, setUserLevel] = useState("A1");
    const [userLanguage, setUserLanguage] = useState("EN");

    const loadNewChallenge = async (levelOverride?: string) => {
        setChallenge(null);
        setAnalysisResult(null);
        const levelToUse = levelOverride || userLevel;
        const data = await getPronunciationChallenge(levelToUse);
        setChallenge(data);
    };

    useEffect(() => {
        import('@/app/[locale]/profile/actions').then(async (mod) => {
            try {
                const profile = await mod.getUserProfile();
                if (profile) {
                    if (profile.level) setUserLevel(profile.level);
                    if (profile.learningLanguage) setUserLanguage(profile.learningLanguage);
                    loadNewChallenge(profile.level);
                } else {
                    loadNewChallenge("A1");
                }
            } catch (e) {
                console.error("Failed to load profile", e);
                loadNewChallenge("A1");
            }
        });
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                // Convert to Base64
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    try {
                        const base64String = (reader.result as string).split(',')[1];
                        setIsAnalyzing(true);
                        if (challenge) {
                            const result = await checkPronunciation(base64String, challenge.sentence, challenge.targetPhoneme);
                            setAnalysisResult(result);
                            router.refresh();
                        }
                    } catch (err) {
                        console.error("Analysis failed:", err);
                        alert("Erreur lors de l'envoi de l'audio. Vérifiez votre connexion.");
                        setAnalysisResult(null);
                    } finally {
                        setIsAnalyzing(false);
                    }
                };
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Recording setup failed", err);
            alert("Accès micro refusé ou non supporté.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleRecording = () => {
        if (isRecording) stopRecording();
        else startRecording();
    };

    const playSentence = () => {
        if (challenge) {
            speak(challenge.sentence, userLanguage);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

            <Link href="/dashboard" className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 z-20">
                <ArrowLeft /> Back
            </Link>

            <div className="max-w-xl w-full text-center space-y-12 relative z-10">
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <Activity size={12} /> Vocal Coach AI
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Pronunciation</h1>

                    {challenge?.targetPhoneme && (
                        <div className="inline-block mt-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700">
                            <span className="text-gray-400 text-sm">Target Phoneme:</span> <span className="text-white font-mono font-bold ml-1 text-lg">{challenge.targetPhoneme}</span>
                        </div>
                    )}
                </div>

                {!challenge ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                        <p className="text-indigo-400 font-mono text-sm">CALIBRATING AI MODEL...</p>
                    </div>
                ) : (
                    <div className="bg-gray-900/40 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative group hover:border-white/20 transition duration-500">
                        {/* Card Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[2rem] pointer-events-none"></div>

                        <button
                            onClick={playSentence}
                            disabled={isTTSLoading}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-indigo-400 transition-transformation hover:scale-110 active:scale-95 disabled:opacity-50"
                        >
                            {isTTSLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Volume2 className="w-6 h-6" />}
                        </button>

                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                            <ClickableSentence text={challenge.sentence} userLocale={locale} contentLocale={userLanguage} />
                        </h2>

                        {challenge.transliteration && (
                            <p className="text-purple-300/80 font-mono text-lg mb-4 flex items-center justify-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                                {challenge.transliteration}
                                <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                            </p>
                        )}
                        <p className="text-gray-400 text-lg italic border-t border-white/5 pt-6 mt-6">"{challenge.translation}"</p>
                    </div>
                )}

                <div className="flex flex-col items-center gap-8 relative pb-20">
                    {/* Recording Button with Rings */}
                    <div className="relative">
                        {isRecording && (
                            <>
                                <div className="absolute inset-0 rounded-full border border-red-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
                                <div className="absolute -inset-4 rounded-full border border-red-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
                            </>
                        )}

                        <button
                            onClick={toggleRecording}
                            disabled={isAnalyzing}
                            className={twMerge(
                                "relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform",
                                isRecording
                                    ? "bg-gradient-to-br from-red-500 to-red-600 scale-110 shadow-red-500/40"
                                    : "bg-gradient-to-br from-indigo-600 to-purple-700 hover:scale-105 shadow-indigo-500/30 hover:shadow-indigo-500/50",
                                isAnalyzing && "bg-gray-800 cursor-not-allowed opacity-50 grayscale"
                            )}
                        >
                            {isAnalyzing ? <Loader2 size={32} className="animate-spin text-white" /> : <Mic size={32} className="text-white" />}
                        </button>
                    </div>

                    <div className="h-8">
                        {isRecording && <p className="text-red-400 animate-pulse font-bold tracking-widest text-sm uppercase">Recording...</p>}
                        {isAnalyzing && <p className="text-indigo-400 animate-pulse font-bold tracking-widest text-sm uppercase">Analyzing...</p>}
                        {!isRecording && !isAnalyzing && !analysisResult && <p className="text-gray-500 text-sm font-medium">Tap microphone to start</p>}
                    </div>
                </div>

                {analysisResult && (
                    <div className={twMerge(
                        "mt-8 p-8 rounded-3xl border backdrop-blur-md flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500 shadow-2xl w-full max-w-md mx-auto",
                        analysisResult.correct
                            ? "bg-green-950/40 border-green-500/30 shadow-green-500/10"
                            : "bg-red-950/40 border-red-500/30 shadow-red-500/10"
                    )}>
                        <div className={twMerge(
                            "w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4 ring-4 ring-opacity-20",
                            analysisResult.correct
                                ? "bg-green-900 text-green-400 border-green-500 ring-green-400"
                                : "bg-red-900 text-red-400 border-red-500 ring-red-400"
                        )}>
                            {analysisResult.score}<span className="text-xs mt-2 opacity-70">/10</span>
                        </div>

                        <div className="text-center">
                            <h3 className={twMerge("text-xl font-bold mb-1", analysisResult.correct ? "text-green-400" : "text-red-400")}>
                                {analysisResult.correct ? "Excellent!" : "Needs Improvement"}
                            </h3>
                            <p className="text-white/80 font-medium text-lg">"{analysisResult.transcription}"</p>
                        </div>

                        <div className="bg-black/30 w-full p-4 rounded-xl border border-white/5 text-gray-300 text-sm leading-relaxed text-center">
                            {analysisResult.feedback}
                        </div>

                        <button onClick={() => loadNewChallenge()} className="mt-4 px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition flex items-center gap-2 transform hover:scale-105 shadow-lg">
                            <RefreshCw size={18} /> Next Challenge
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client'

import { useState, useEffect, useRef } from 'react';
import { getPronunciationChallenge, checkPronunciation } from './actions';
import { Mic, RefreshCw, Volume2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useTTS } from '@/hooks/useTTS';
import { updateUserLevel } from '@/app/[locale]/profile/actions'; // Updated import
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

    const [userLanguage, setUserLanguage] = useState("EN"); // CHANGED DEFAULT TO EN FOR DEBUGGING

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
                console.log("Profile Loaded:", profile); // DEBUG
                if (profile) {
                    if (profile.level) setUserLevel(profile.level);
                    if (profile.learningLanguage) {
                        console.log("Setting Language to:", profile.learningLanguage); // DEBUG
                        setUserLanguage(profile.learningLanguage);
                    }
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
                            console.log("Calling server action...");
                            const result = await checkPronunciation(base64String, challenge.sentence, challenge.targetPhoneme);
                            console.log("Server action returned:", result);
                            setAnalysisResult(result);

                            // Refresh UI to update XP in header
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
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleRecording = () => {
        if (isRecording) stopRecording();
        else startRecording();
    };

    const playSentence = () => {
        if (challenge) {
            console.log("Playing Sentence with Language:", userLanguage); // DEBUG
            speak(challenge.sentence, userLanguage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative">
            <Link href="/dashboard" className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2">
                <ArrowLeft /> Retour
            </Link>

            <div className="max-w-xl w-full text-center space-y-12">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Coach Vocal Gemini</h1>
                    <p className="text-gray-400">Progression : {userLevel}</p>
                    {challenge?.targetPhoneme && (
                        <div className="inline-block px-4 py-1 rounded-full bg-blue-900/30 text-blue-400 text-sm border border-blue-800">
                            Objectif : {challenge.targetPhoneme}
                        </div>
                    )}
                </div>

                {!challenge ? (
                    <div className="animate-pulse flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-gray-600 border-t-pink-500 animate-spin"></div></div>
                ) : (
                    <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl relative">
                        <button
                            onClick={playSentence}
                            disabled={isTTSLoading}
                            className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 transition disabled:opacity-50"
                        >
                            {isTTSLoading ? <Loader2 className="animate-spin" /> : <Volume2 />}
                        </button>

                        <h2 className="text-3xl font-bold mb-4 leading-relaxed">
                            <ClickableSentence text={challenge.sentence} userLocale={locale} contentLocale={userLanguage} />
                        </h2>
                        {challenge.transliteration && (
                            <p className="text-yellow-500 font-mono text-lg mb-2">{challenge.transliteration}</p>
                        )}
                        <p className="text-gray-500 text-lg italic">{challenge.translation}</p>
                    </div>
                )}

                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={toggleRecording}
                        disabled={isAnalyzing}
                        className={twMerge(
                            "w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20 transition-all duration-300 border-4 border-transparent",
                            isRecording ? "bg-red-500 scale-110 animate-pulse border-red-400" : "bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-105",
                            isAnalyzing && "bg-gray-700 cursor-not-allowed opacity-50"
                        )}
                    >
                        {isAnalyzing ? <Loader2 size={32} className="animate-spin" /> : <Mic size={32} />}
                    </button>

                    {isRecording && <p className="text-red-400 animate-pulse font-medium">Enregistrement...</p>}
                    {isAnalyzing && <p className="text-pink-400 animate-pulse font-medium">Analyse par Gemini 2.5...</p>}
                </div>

                {analysisResult && (
                    <div className={twMerge(
                        "mt-8 p-6 rounded-xl border flex flex-col items-center gap-3 animate-fade-in",
                        analysisResult.correct ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"
                    )}>
                        <div className="text-4xl font-black mb-2">
                            {analysisResult.score}/10
                        </div>
                        <p className="text-lg font-medium">"{analysisResult.transcription}"</p>
                        <p className="text-gray-300 text-sm text-center max-w-md">{analysisResult.feedback}</p>

                        <button onClick={() => loadNewChallenge()} className="mt-4 px-6 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition flex items-center gap-2">
                            <RefreshCw size={16} /> Phrase suivante
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { generateDailyPodcast } from '@/app/actions/podcast';
import { Loader2, Play, Pause, Radio, Globe } from 'lucide-react';

export default function PodcastCard({ language }: { language: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset state when language changes
    useState(() => {
        setAudioSrc(null);
        setIsPlaying(false);
        setIsLoading(false);
    });

    // Or better, use useEffect
    useEffect(() => {
        // Stop previous audio
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setAudioSrc(null);
        setIsPlaying(false);
        setIsLoading(false);
    }, [language]);


    const handlePlay = async () => {
        if (audioSrc && audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            return;
        }

        setIsLoading(true);
        try {
            const result = await generateDailyPodcast(language);
            if (result.success && result.audioBase64) {
                const src = `data:audio/wav;base64,${result.audioBase64}`;
                setAudioSrc(src);
                // Wait for state update is not instant for ref but src is key
                // Use a temporary audio element or effect, but for simplicity:
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.src = src;
                        audioRef.current.play();
                        setIsPlaying(true);
                    }
                }, 100);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <Globe className="w-16 h-16 text-white/5" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-red-500/20 text-red-400 ${isPlaying ? 'animate-pulse' : ''}`}>
                        <Radio size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Polyglot Daily News</h3>
                        <p className="text-xs text-gray-400">Briefing Monde (2 min)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        {!isPlaying ? (
                            <button
                                onClick={handlePlay}
                                disabled={isLoading}
                                className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                                {isLoading ? 'Generating...' : 'Listen Briefing'}
                            </button>
                        ) : (
                            <button
                                onClick={handlePause}
                                className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-3 px-4 rounded-xl hover:bg-red-500/30 transition flex items-center justify-center gap-2"
                            >
                                <Pause fill="currentColor" />
                                Pause
                            </button>
                        )}
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
            </div>
        </div>
    );
}

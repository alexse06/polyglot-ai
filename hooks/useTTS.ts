import { useState, useCallback, useRef } from 'react';
import { getAudio } from '@/app/actions/audio';

export function useTTS() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null); // Persistence to prevent GC

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            utteranceRef.current = null;
        }
        setIsPlaying(false);
        setIsLoading(false);
    }, []);

    const playBrowserTTS = useCallback((text: string, language: string) => {
        setIsLoading(false);
        if ('speechSynthesis' in window) {
            console.warn(`TTS: Fallback to Browser Audio for ${language}`);
            window.speechSynthesis.cancel();

            // Create and PERSIST utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            // STRICTER Locale Selection
            const localeMap: Record<string, string> = {
                'EN': 'en-US',
                'ES': 'es-ES',
                'FR': 'fr-FR',
                'DE': 'de-DE',
                'IT': 'it-IT',
                'PT': 'pt-BR',
                'RU': 'ru-RU',
                'JA': 'ja-JP',
                'ZH': 'zh-CN',
                'VI': 'vi-VN',
                'AR': 'ar-XA',
                'KO': 'ko-KR'
            };
            const targetLocale = localeMap[language] || 'es-ES';
            utterance.lang = targetLocale;

            const voices = window.speechSynthesis.getVoices();
            let voice = null;

            // 1. Try to find a high-quality Voice
            if (language === "EN") {
                voice = voices.find(v => (v.name.includes("Google US English") || v.name.includes("Microsoft Zira") || v.lang === "en-US"));
            } else if (language === "AR") {
                voice = voices.find(v => (v.name.includes("Arabic") || v.lang.startsWith("ar")));
            } else if (language === "KO") {
                voice = voices.find(v => (v.name.includes("Korean") || v.lang.startsWith("ko")));
            } else {
                voice = voices.find(v => v.lang === targetLocale || v.lang.startsWith(targetLocale.split('-')[0]));
            }

            if (voice) {
                console.log("TTS: Browser Voice Selected:", voice.name, voice.lang);
                utterance.voice = voice;
            }

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => {
                setIsPlaying(false);
                utteranceRef.current = null; // Release
            };
            utterance.onerror = (e) => {
                console.error("Browser TTS error", e);
                setIsPlaying(false);
                utteranceRef.current = null;
                setError("TTS Failed");
            };

            window.speechSynthesis.speak(utterance);
        } else {
            setIsPlaying(false);
            setError("No TTS support");
        }
    }, []);

    const speak = useCallback(async (text: string, language: string) => {
        if (!text || !language) {
            console.error("TTS: Missing text or language", { text, language });
            return;
        }

        stop();
        setIsLoading(true);
        setError(null);

        try {
            console.log(`TTS: Fetching Server Audio (${language}) for: "${text.substring(0, 20)}..."`);

            // Race Server Action with 5s Timeout
            const serverAudioPromise = getAudio(text, language);
            const timeoutPromise = new Promise<{ data: string, mimeType: string } | null>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 5000)
            );

            const response = await Promise.race([serverAudioPromise, timeoutPromise]).catch(e => {
                console.warn("Server TTS timed out or failed:", e);
                return null;
            }) as any;

            if (response && response.data) {
                console.log("TTS: Playing Server Audio");
                setIsLoading(false);

                const { data, mimeType } = response;
                const audio = new Audio(`data:${mimeType || 'audio/mp3'};base64,${data}`);
                audioRef.current = audio;

                audio.onended = () => {
                    setIsPlaying(false);
                    audioRef.current = null;
                };

                audio.onerror = (e) => {
                    console.error("Audio playback error (Codec?)", e);
                    setIsPlaying(false);
                    playBrowserTTS(text, language);
                };

                setIsPlaying(true);
                await audio.play();
                return;
            } else {
                console.warn("TTS: Server returned empty audio or timed out. Using fallback.");
                playBrowserTTS(text, language);
            }
        } catch (e) {
            console.error("Server TTS Request Failed", e);
            playBrowserTTS(text, language);
        }
    }, [playBrowserTTS, stop]);

    return { speak, stop, isPlaying, isLoading, error };
}

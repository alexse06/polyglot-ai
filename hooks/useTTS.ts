import { useState, useCallback, useRef } from 'react';
import { getAudio } from '@/app/actions/audio';

export function useTTS() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setIsLoading(false);
    }, []);

    const playBrowserTTS = useCallback((text: string, language: string) => {
        setIsLoading(false);
        if ('speechSynthesis' in window) {
            console.warn(`TTS: Fallback to Browser Audio for ${language}`);
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            // STRICTER Locale Selection
            const targetLocale = language === "EN" ? "en-US" : "es-ES";
            utterance.lang = targetLocale;

            const voices = window.speechSynthesis.getVoices();

            // Debug available voices
            // console.log("Available Browser Voices:", voices.map(v => v.name + " " + v.lang));

            let voice = null;

            // 1. Try to find a high-quality Google/Microsoft voice matching the logic
            if (language === "EN") {
                voice = voices.find(v => (v.name.includes("Google US English") || v.name.includes("Microsoft Zira") || v.lang === "en-US"));
            } else {
                voice = voices.find(v => (v.name.includes("Google español") || v.lang === "es-ES" || v.lang === "es-MX"));
            }

            if (voice) {
                console.log("TTS: Browser Voice Selected:", voice.name, voice.lang);
                utterance.voice = voice;
            }

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = (e) => {
                console.error("Browser TTS error", e);
                setIsPlaying(false);
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

            // Server Action Call
            const response = await getAudio(text, language);

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
                console.warn("TTS: Server returned empty audio. Using fallback.");
                playBrowserTTS(text, language);
            }
        } catch (e) {
            console.error("Server TTS Request Failed", e);
            playBrowserTTS(text, language);
        }
    }, [playBrowserTTS, stop]);

    return { speak, stop, isPlaying, isLoading, error };
}

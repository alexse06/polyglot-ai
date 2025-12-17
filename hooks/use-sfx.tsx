'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type SFXContextType = {
    playHover: () => void;
    playClick: () => void;
    playSuccess: () => void;
    playError: () => void;
    playLevelUp: () => void;
    playPageTransition: () => void;
    isEnabled: boolean;
    toggleSFX: () => void;
};

const SFXContext = createContext<SFXContextType | null>(null);

export const useSFX = () => {
    const context = useContext(SFXContext);
    if (!context) {
        throw new Error('useSFX must be used within an SFXProvider');
    }
    return context;
};

export const SFXProvider = ({ children }: { children: React.ReactNode }) => {
    const [isEnabled, setIsEnabled] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);
    const pathname = usePathname();

    // Initialize Audio Context lazily (browsers block autoplay)
    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    useEffect(() => {
        const handleInteraction = () => initAudio();
        window.addEventListener('click', handleInteraction, { once: true });
        window.addEventListener('keydown', handleInteraction, { once: true });
        window.addEventListener('touchstart', handleInteraction, { once: true });
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    // Trigger page transition sound
    useEffect(() => {
        if (pathname) {
            playPageTransition();
        }
    }, [pathname]);

    const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
        if (!isEnabled || !audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Safety check for valid context state
        if (ctx.state === 'closed') return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const playHover = () => {
        // Subtle "tick"
        // High pitch, very short
        playTone(800, 'sine', 0.03, 0.02);
        // Add a tiny detuned second osc for texture? 
        // Keep it simple for now to be lightweight.
    };

    const playClick = () => {
        // "Thock" sound
        // Triangle wave, slightly lower
        playTone(300, 'triangle', 0.08, 0.05);
    };

    const playSuccess = () => {
        // Major chord arpeggio/strum (C Major: C5, E5, G5)
        if (!isEnabled || !audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        const vol = 0.05;

        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(vol, now + i * 0.05 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.5);
        });
    };

    const playLevelUp = () => {
        // Victory fanfare
        if (!isEnabled || !audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        const vol = 0.05;

        // C G C E G C (Ascending power)
        [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(vol, now + i * 0.08 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.7);
        });
    }

    const playError = () => {
        // Dissonant low buzz
        playTone(150, 'sawtooth', 0.2, 0.05);
        // Add a dissonant interval
        playTone(140, 'sawtooth', 0.2, 0.05);
    };

    const playPageTransition = () => {
        // Whoosh (White noise with filter sweep)
        if (!isEnabled || !audioContextRef.current) return;
        const ctx = audioContextRef.current;

        const bufferSize = ctx.sampleRate * 0.5; // 0.5 sec
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
    };

    const toggleSFX = () => setIsEnabled(!isEnabled);

    return (
        <SFXContext.Provider value={{ playHover, playClick, playSuccess, playError, playLevelUp, playPageTransition, isEnabled, toggleSFX }}>
            {children}
        </SFXContext.Provider>
    );
};

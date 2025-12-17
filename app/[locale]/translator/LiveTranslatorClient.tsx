'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Headphones, Globe, Activity, Volume2, XCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Using native WebSocket, no extra lib.
// URL: wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=API_KEY

export default function LiveTranslatorClient({ targetLang, nativeLang, userName }: { targetLang: string, nativeLang: string, userName: string }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState('Idle'); // Idle, Connecting, Listening, Speaking
    const [logs, setLogs] = useState<string[]>([]); // Debug logs for user visibility (cool terminal effect)

    // Device Selection
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // To hold audio data from model
    const startAudioQueueRef = useRef<number>(0);
    const nextPlayTimeRef = useRef<number>(0);
    const connectionSampleRateRef = useRef<number>(24000); // Default to 24k, update on connect

    const LOG = (msg: string) => {
        console.log(`[Translator] ${msg}`);
        setLogs(prev => [`> ${msg}`, ...prev].slice(0, 5));
    };

    // Load Devices
    useEffect(() => {
        const getDevices = async () => {
            try {
                // Must request permission first to see labels
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const devs = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devs.filter(d => d.kind === 'audioinput');
                setDevices(audioInputs);
                if (audioInputs.length > 0) {
                    setSelectedDeviceId(audioInputs[0].deviceId);
                }
            } catch (e) {
                console.error("Failed to enumerate devices", e);
                LOG("Could not access microphone devices");
            }
        };
        getDevices();
    }, []);

    const cleanup = useCallback(() => {
        LOG("Disconnecting...");
        if (websocketRef.current) {
            websocketRef.current.close();
            websocketRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsConnected(false);
        setIsListening(false);
        setStatus('Idle');
    }, []);

    const initAudioContext = async () => {
        if (!audioContextRef.current) {
            // sampleRate: 16000 is often preferred for these APIs but 24000/48000 works if resampled.
            // Using system default is safest for non-resampling.
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            await ctx.audioWorklet.addModule('/pcm-processor.js');
            audioContextRef.current = ctx;
            nextPlayTimeRef.current = ctx.currentTime;
        }
        return audioContextRef.current;
    };

    const handleConnect = async () => {
        if (isConnected) {
            cleanup();
            return;
        }

        setStatus('Connecting...');

        try {
            // 1. Get Microphone first to ensure permission
            const constraints: MediaStreamConstraints = {
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                    // Audio Processing Constraints
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            // 2. Setup Audio Context
            const ctx = await initAudioContext();

            // 3. Connect WebSocket
            // Get API Key from server action (secure way) or env (unsafe but standard for V1 demos).
            // For this live demo component, we rely on NEXT_PUBLIC env or pass from server.
            // Assuming we pass it via props or fetch it. Let's fetch it via a server action helper for security.
            // For now, simpler: we need a proxy route to avoiding exposing key or use a temporary token.
            // Actually, Multimodal Live requires a direct socket. We will assume a secure context or a specific key.
            // Using a server action to get a short-lived token isn't standard yet.
            // We'll trust the user wants this to work -> fetch '/api/keys/gemini' (we don't have this).
            // We'll use a hardcoded helper that calls a server action to get the key.

            const response = await fetch('/api/auth/token'); // Dummy endpoint or just use logic
            // For MVP: We will use the key directly if available, or ask user.
            // Let's assume we fetch a config object.

            // Temporary: fetch key from a server action we create on the fly? No.
            // We'll use the existing secure pattern: Server Actions are for REST/RPC.
            // For WebSocket, we need the Key on Client.

            // DANGER: Exposing Key on Client. Only acceptable for personal usage.
            // We will fetch it from a secure action "getGeminiKeyForClient" (we will create this).

            const { getClientSideKey } = await import('./actions');
            const apiKey = await getClientSideKey();

            if (!apiKey) {
                LOG("Error: No API Key available.");
                setStatus('Error');
                return;
            }

            const currentSampleRate = audioContextRef.current?.sampleRate || 24000;
            connectionSampleRateRef.current = currentSampleRate;
            LOG(`Audio Rate: ${currentSampleRate}Hz`);

            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
            const ws = new WebSocket(url);

            ws.onopen = () => {
                LOG("Connected to Gemini Live");
                setIsConnected(true);
                setStatus('Listening');

                // Send Initial Setup Message
                const setupMsg = {
                    setup: {
                        model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
                            },
                            thinkingConfig: {
                                thinkingBudget: 0
                            }
                        },
                        systemInstruction: {
                            parts: [{
                                text: `You are a universal translator. 
                            1. Listen to the user.
                            2. If they speak ${targetLang}, translate it to ${nativeLang}.
                            3. If they speak ${nativeLang}, translate it to ${targetLang}.
                            4. ONLY speak the translation. Do not add conversational filler.
                            5. Be extremely fast.` }]
                        }
                    }
                };
                ws.send(JSON.stringify(setupMsg));

                // Connect Audio Pipeline
                if (streamRef.current && audioContextRef.current) {
                    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
                    const worklet = new AudioWorkletNode(audioContextRef.current, 'pcm-processor');

                    worklet.port.onmessage = (event) => {
                        // Send audio chunks to Gemini
                        // Format: RealtimeInput
                        const int16Data = event.data; // Int16Array
                        // Convert to Base64

                        // We need a helper for ArrayBuffer -> Base64
                        const base64Audio = arrayBufferToBase64(int16Data.buffer);

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                realtimeInput: {
                                    mediaChunks: [{
                                        mimeType: `audio/pcm;rate=${currentSampleRate}`,
                                        data: base64Audio
                                    }]
                                }
                            }));
                        }
                    };

                    source.connect(worklet);
                    worklet.connect(audioContextRef.current.destination); // Keep it alive

                    sourceRef.current = source;
                    workletNodeRef.current = worklet;
                }
            };

            ws.onmessage = async (event) => {
                let data;
                if (event.data instanceof Blob) {
                    data = JSON.parse(await event.data.text());
                } else {
                    data = JSON.parse(event.data);
                }

                if (data.serverContent?.modelTurn?.parts) {
                    const parts = data.serverContent.modelTurn.parts;
                    for (const part of parts) {
                        if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
                            // Extract rate from mimeType (e.g., "audio/pcm;rate=24000")
                            let responseRate = 24000;
                            const match = part.inlineData.mimeType.match(/rate=(\d+)/);
                            if (match && match[1]) {
                                responseRate = parseInt(match[1], 10);
                            }

                            // Play audio
                            const pcmBase64 = part.inlineData.data;
                            const pcmData = base64ToArrayBuffer(pcmBase64);
                            playPCM(pcmData, responseRate);
                        }
                    }
                }
            };

            ws.onerror = (e) => {
                console.error(e);
                LOG("WebSocket Error");
                cleanup();
            };

            ws.onclose = () => {
                LOG("Disconnected");
                cleanup();
            };

            websocketRef.current = ws;

        } catch (e) {
            console.error(e);
            LOG("Connection Failed");
            cleanup();
        }
    };

    const playPCM = (pcmData: ArrayBuffer, sampleRate: number = 24000) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Convert PCM Int16 to Float32
        const int16Array = new Int16Array(pcmData);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        // Use the actual rate sent by Gemini (sampleRate)
        const buffer = ctx.createBuffer(1, float32Array.length, sampleRate);
        buffer.getChannelData(0).set(float32Array);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;
        // Schedule next play
        const playTime = Math.max(now, nextPlayTimeRef.current);
        source.start(playTime);
        nextPlayTimeRef.current = playTime + buffer.duration;
    };

    // Helpers
    function arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function base64ToArrayBuffer(base64: string) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isConnected ? 'opacity-30' : 'opacity-0'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 blur-[150px] animate-pulse"></div>
            </div>

            {/* Main Visualizer */}
            <div className="z-10 flex flex-col items-center gap-8 w-full max-w-md">

                {/* Visualizer Circle */}
                <div className={twMerge(
                    "relative w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500",
                    isConnected ? "border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.5)] scale-110" : "border-gray-800 bg-gray-900"
                )}>
                    {isConnected ? (
                        <Globe size={80} className="text-purple-400 animate-spin-slow" />
                    ) : (
                        <Headphones size={80} className="text-gray-600" />
                    )}

                    {isConnected && (
                        <>
                            <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-ping"></div>
                            <div className="absolute -inset-4 rounded-full border border-purple-500/30 animate-ping delay-75"></div>
                        </>
                    )}
                </div>

                {/* Status & Controls */}
                <div className="text-center space-y-4 w-full">
                    <div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {isConnected ? "Listening..." : "Ready to Translate"}
                        </h2>
                        <p className="text-gray-400 text-lg flex items-center justify-center gap-2 mt-2">
                            {targetLang} <span className="text-xs bg-gray-800 px-2 py-1 rounded">AUTO</span> {nativeLang}
                        </p>
                    </div>

                    {/* Device Selector (Only visible when not connected) */}
                    {!isConnected && (
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/10 text-left space-y-2">
                            <label className="text-xs uppercase text-gray-500 font-bold tracking-wider">Microphone Input</label>
                            <select
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                value={selectedDeviceId}
                                onChange={(e) => setSelectedDeviceId(e.target.value)}
                            >
                                {devices.map(d => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                        {d.label || `Microphone ${d.deviceId.slice(0, 5)}...`}
                                    </option>
                                ))}
                                {devices.length === 0 && <option value="">Default Microphone</option>}
                            </select>
                            <p className="text-xs text-gray-500">
                                * Use headphones for best results to prevent echo.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleConnect}
                        disabled={status === 'Connecting...'}
                        className={twMerge(
                            "w-full rounded-full py-6 text-xl font-bold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 shadow-xl",
                            isConnected
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                                : "bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50"
                        )}
                    >
                        {status === 'Connecting...' ? (
                            <Activity className="animate-spin" />
                        ) : isConnected ? (
                            <>
                                <XCircle size={24} /> Stop Session
                            </>
                        ) : (
                            <>
                                <Mic size={24} /> Start Listening
                            </>
                        )}
                    </button>

                    {/* Error Display */}
                    {status === 'Error' && (
                        <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-500/20">
                            Connection failed. Check permissions or try another browser.
                        </div>
                    )}
                </div>
            </div>

            {/* Logs overlay (for nerds/debug) */}
            <div className="absolute bottom-8 right-8 font-mono text-xs text-gray-600 max-w-sm text-right pointer-events-none">
                {logs.map((log, i) => (
                    <div key={i} className="opacity-75">{log}</div>
                ))}
            </div>
        </div>
    );
}

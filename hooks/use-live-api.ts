import { useEffect, useRef, useState, useCallback } from 'react';

export type LiveConfig = {
    model: string;
    systemInstruction?: string;
    voiceName?: string;
};

// Use the exact model requested
const GEMINI_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

export function useLiveAPI(apiKey: string, onMessage?: (data: any) => void) {
    const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
    const [isSpeaking, setIsSpeaking] = useState(false); // AI is speaking (Audio playing)
    const socketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Queue for incoming audio chunks from Gemini
    const audioQueueRef = useRef<ArrayBuffer[]>([]);
    const nextStartTimeRef = useRef(0);

    const connect = useCallback(async (config: LiveConfig) => {
        if (!apiKey) {
            console.error("No API Key provided");
            setStatus("error");
            return;
        }

        setStatus("connecting");

        try {
            // 1. Setup Audio Input (Microphone)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            // 2. Setup Audio Output (Speaker) - Higher quality for playback
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const analyser = outputCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser; // Store analyser
            audioContextRef.current = outputCtx;

            // 3. Setup Audio Input (Microphone) - Strictly 16kHz for Gemini
            // We use a separate context for input to force resampling.
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            await inputCtx.audioWorklet.addModule('/pcm-processor.js');

            // 4. Connect WebSocket
            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
            const ws = new WebSocket(url);
            socketRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket Connected");
                setStatus("connected");

                // A. Send Setup Message
                const setupMessage = {
                    setup: {
                        model: `models/${config.model || GEMINI_MODEL}`,
                        generationConfig: {
                            responseModalities: ["AUDIO"], // Reverted to AUDIO only for stability with Native Audio model
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: config.voiceName || "Aoede"
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            parts: [{ text: config.systemInstruction || "You are a helpful assistant." }]
                        }
                    }
                };
                ws.send(JSON.stringify(setupMessage));

                // B. Send Initial Greeting to force conversation start
                const initialGreeting = {
                    clientContent: {
                        turns: [{
                            role: "user",
                            parts: [{ text: "Bonjour" }]
                        }],
                        turnComplete: true
                    }
                };
                ws.send(JSON.stringify(initialGreeting));

                // C. Start Audio Input Processing
                startAudioInput(inputCtx, stream, ws);
            };

            ws.onmessage = async (event) => {
                let data;
                if (event.data instanceof Blob) {
                    data = JSON.parse(await event.data.text());
                } else {
                    data = JSON.parse(event.data);
                }

                // Pass all data to callback (for transcripts etc)
                if (onMessage) {
                    onMessage(data);
                }

                // Handle server events
                if (data.serverContent) {
                    // Audio from Model
                    if (data.serverContent.modelTurn?.parts?.[0]?.inlineData) {
                        const audioBase64 = data.serverContent.modelTurn.parts[0].inlineData.data;
                        queueAudio(audioBase64);
                    }

                    // Turn Complete
                    if (data.serverContent.turnComplete) {
                        // console.log("Turn Complete");
                    }
                }

                // Handle Tool use, etc. (Not implemented for simplified coach)
            };

            ws.onerror = (err) => {
                console.error("WebSocket Error", err);
                setStatus("error");
            };

            ws.onclose = (event) => {
                console.log("WebSocket Closed", event.code, event.reason, "Clean:", event.wasClean);
                setStatus("disconnected");
                cleanup();
            };

        } catch (e) {
            console.error("Connection Failed", e);
            setStatus("error");
            cleanup();
        }
    }, [apiKey]);

    const startAudioInput = (ctx: AudioContext, stream: MediaStream, ws: WebSocket) => {
        const source = ctx.createMediaStreamSource(stream);
        const worklet = new AudioWorkletNode(ctx, 'pcm-processor');

        let inputBuffer: Float32Array[] = [];
        let bufferSize = 0;
        const BUFFER_THRESHOLD = 4096; // Send ~250ms chunks

        worklet.port.onmessage = (event) => {
            const float32Data = event.data; // usually 128 samples
            if (!float32Data) return;

            inputBuffer.push(float32Data);
            bufferSize += float32Data.length;

            if (bufferSize >= BUFFER_THRESHOLD) {
                // Merge and Send
                const merged = new Float32Array(bufferSize);
                let offset = 0;
                for (const chunk of inputBuffer) {
                    merged.set(chunk, offset);
                    offset += chunk.length;
                }

                const pcm16 = floatTo16BitPCM(merged);
                const base64Audio = arrayBufferToBase64(pcm16);

                if (ws.readyState === WebSocket.OPEN) {
                    const msg = {
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: "audio/pcm",
                                data: base64Audio
                            }]
                        }
                    };
                    ws.send(JSON.stringify(msg));
                }

                // Reset
                inputBuffer = [];
                bufferSize = 0;
            }
        };

        source.connect(worklet);
        workletNodeRef.current = worklet;
    };

    // ... (rest of file)

    const queueAudio = (base64Data: string) => {
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert to AudioBuffer or schedule playback
        // For simplicity in this shell phase, assume PCM 24kHz (Gemini Default)
        playPCM(bytes.buffer);
    };

    const playPCM = (arrayBuffer: ArrayBuffer) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // PCM16 -> Float32
        const int16 = new Int16Array(arrayBuffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32768;
        }

        const buffer = ctx.createBuffer(1, float32.length, 24000); // 24kHz is standard Gemini output
        buffer.getChannelData(0).set(float32);

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Connect to Analyser first, then destination
        if (analyserRef.current) {
            source.connect(analyserRef.current);
            analyserRef.current.connect(ctx.destination);
        } else {
            source.connect(ctx.destination);
        }

        const now = ctx.currentTime;
        const start = nextStartTimeRef.current < now ? now : nextStartTimeRef.current;
        source.start(start);
        nextStartTimeRef.current = start + buffer.duration;

        setIsSpeaking(true);
        source.onended = () => {
            // Check if clean queue? 
            // setIsSpeaking(false) logic needs to be robust (counters etc)
        };
    };

    const floatTo16BitPCM = (float32Arr: Float32Array) => {
        const pcm16 = new Int16Array(float32Arr.length);
        for (let i = 0; i < float32Arr.length; i++) {
            let s = Math.max(-1, Math.min(1, float32Arr[i]));
            s = s < 0 ? s * 0x8000 : s * 0x7FFF;
            pcm16[i] = s;
        }
        return pcm16.buffer;
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        cleanup();
        setStatus("disconnected");
    }, []);

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
        if (audioContextRef.current) {
            // Check state before closing to avoid warnings
            if (audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(e => console.warn("Error closing context", e));
            }
            audioContextRef.current = null;
        }
        nextStartTimeRef.current = 0;
        setIsSpeaking(false);
        audioQueueRef.current = [];
    };

    useEffect(() => {
        return () => disconnect();
    }, [disconnect]);

    return { connect, disconnect, status, isSpeaking, analyser: analyserRef.current };
}

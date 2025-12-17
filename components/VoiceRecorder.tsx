'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceRecorderProps {
    onRecordingComplete: (file: File) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                }
            });

            // Prefer high quality codec
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000
            });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                const file = new File([blob], "recording.webm", { type: mimeType });
                onRecordingComplete(file);

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const resetRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {!audioUrl ? (
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-6 rounded-full transition-all duration-300 shadow-xl ${isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                >
                    {isRecording ? <Square size={32} fill="white" /> : <Mic size={32} />}
                </button>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                    <audio controls src={audioUrl} className="w-full" />
                    <button
                        onClick={resetRecording}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                        <Trash2 size={16} /> Record Again
                    </button>
                    <div className="text-green-400 text-sm font-bold animate-fade-in">
                        ✓ Audio Ready for Cloning
                    </div>
                </div>
            )}

            <p className="text-gray-400 text-sm">
                {isRecording ? "Recording... Read the text above!" : !audioUrl && "Tap mic to start recording."}
            </p>
        </div>
    );
}

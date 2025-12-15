"use client";

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    isConnected: boolean;
    isSpeaking: boolean; // To vary color or intensity
    audioVolume?: number; // Optional volume level (0-1)
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isConnected, isSpeaking }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        if (!analyser || !isConnected) {
            ctx.clearRect(0, 0, width, height);
            // Draw idle line
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.strokeStyle = "rgba(75, 85, 99, 0.5)"; // Gray-600 active
            ctx.lineWidth = 2;
            ctx.stroke();
            return;
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Bars configuration
        const barCount = 32; // Number of bars to draw (symmetric)
        // We only care about the lower frequencies mostly for voice (0-8kHz approx)
        // fftSize is 256, so buffer is 128. 128 bins over 16kHz = 125Hz per bin.
        // We mostly hear voice in 300Hz - 3400Hz.
        // So we focus on index 2 to ~30.

        const render = () => {
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);

            // Styling based on state
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            if (isSpeaking) {
                gradient.addColorStop(0, '#818cf8'); // Indigo-400
                gradient.addColorStop(1, '#c084fc'); // Purple-400
            } else {
                gradient.addColorStop(0, '#34d399'); // Green-400 (User speaking... theoretically logic is inverted in parent but let's assume isSpeaking means AI or generic activity)
                // actually conventionally usually Blue/Purple for AI, Green for User.
                // We will rely on parent passing correct colors or just generic lively colors.
                gradient.addColorStop(0, '#60a5fa'); // Blue-400
                gradient.addColorStop(1, '#a78bfa'); // Purple-400
            }

            ctx.fillStyle = gradient;

            const barWidth = (width / barCount) * 0.6; // 60% width, 40% spacing
            const step = Math.floor(dataArray.length / barCount); // Step through FFT bins

            // Draw Symmetric Bars from Center
            const centerX = width / 2;

            for (let i = 0; i < barCount; i++) {
                // Get average volume for this frequency band
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += dataArray[(i * step) + j];
                }
                const avg = sum / step;

                // Normalize 0-255 to 0-1
                const val = avg / 255;

                // Non-linear boost for low volume visibility
                const barHeight = Math.max(4, Math.pow(val, 1.5) * (height * 0.8));

                const xOffset = (i * (width / 2)) / barCount;

                // Right side
                const xRight = centerX + xOffset;
                const xLeft = centerX - xOffset - barWidth; // Mirror

                const y = (height - barHeight) / 2;

                // Apply smooth rounded rects
                ctx.beginPath();
                ctx.roundRect(xRight, y, barWidth, barHeight, 5);
                ctx.roundRect(xLeft, y, barWidth, barHeight, 5);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [analyser, isConnected, isSpeaking]);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default AudioVisualizer;

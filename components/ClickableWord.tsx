'use client';

import { useState, useRef, useEffect } from 'react';
import { translateWord } from '@/app/[locale]/chat/translate/action';
import { Loader2, X } from 'lucide-react';

interface Props {
    word: string;
    sentence: string;
    userLocale: string;
}

interface TranslationResult {
    translation: string;
    type: string;
    gender?: string;
    explanation: string;
}

import { createPortal } from 'react-dom';

export function WordTranslator({ word, sentence, userLocale }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TranslationResult | null>(null);
    const triggerRef = useRef<HTMLSpanElement>(null); // Ref for the word
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    // Clean word for logic
    const cleanWord = word.trim().replace(/[.,!?;:()]/g, '');

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Position above the word centered
            // Fixed positioning is relative to viewport, so we just use rect.top
            setCoords({
                top: rect.top - 10, // 10px spacing above
                left: rect.left + (rect.width / 2) // Center horizontally
            });
        }
    };

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!cleanWord || cleanWord.length < 1) return;

        // Toggle if clicking same word
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        updatePosition();
        setIsOpen(true);

        if (!result) {
            setLoading(true);
            const data = await translateWord(cleanWord, sentence, userLocale);
            setResult(data);
            setLoading(false);
        }
    };

    // Close on scroll/resize to avoid detached popup
    useEffect(() => {
        if (isOpen) {
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Close click outside
    useEffect(() => {
        const handleGlobalClick = () => setIsOpen(false);
        if (isOpen) setTimeout(() => document.addEventListener('click', handleGlobalClick), 0);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, [isOpen]);

    return (
        <>
            <span
                ref={triggerRef}
                onClick={handleClick}
                className="cursor-pointer hover:bg-yellow-500/30 hover:underline decoration-yellow-500/50 rounded px-0.5 transition-colors select-text"
            >
                {word}
            </span>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-[9999] w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 text-left animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: 'translate(-50%, -100%)' // Center horizontally, move above
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent close on self click
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Analysis</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                            <X size={12} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-2">
                            <Loader2 className="animate-spin text-indigo-400" size={20} />
                        </div>
                    ) : result ? (
                        <div className="space-y-1">
                            <p className="font-bold text-white text-lg">{result.translation}</p>
                            <div className="flex gap-2 text-xs">
                                <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">{result.type}</span>
                                {result.gender && (
                                    <span className="bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded">{result.gender}</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 italic mt-1 leading-tight">{result.explanation}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-red-400">Failed to load on "{cleanWord}".</p>
                    )}

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-gray-900 pointer-events-none"></div>
                </div>,
                document.body
            )}
        </>
    );
}

// Wrapper to split sentence into words
export function ClickableSentence({ text, userLocale, contentLocale }: { text: string, userLocale: string, contentLocale: string }) {
    // Detect if text is CJK
    const isCJK = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);

    let words: string[] = [];

    // Use explicit locale if provided and supports segmentation, related to CJK
    const canSegment = typeof Intl !== 'undefined' && (Intl as any).Segmenter;
    // Map internal codes to BCP 47
    const segmentLang = contentLocale === 'JP' ? 'ja' : contentLocale === 'CN' ? 'zh' : contentLocale === 'TW' ? 'zh-TW' : 'en';

    if (isCJK && canSegment) {
        const segmenter = new (Intl as any).Segmenter(segmentLang, { granularity: 'word' });
        const segments = segmenter.segment(text);
        words = Array.from(segments).map((s: any) => s.segment);
    } else if (isCJK) {
        // Fallback: split by character
        words = text.split('');
    } else {
        // Western languages: split by space
        words = text.split(' ');
    }

    return (
        <span className="leading-[2.5]"> {/* Add line-height for easier clicking */}
            {words.map((word, i) => (
                <span key={i}>
                    <WordTranslator
                        word={word}
                        sentence={text}
                        userLocale={userLocale}
                    />
                    {/* Add space if NOT CJK, or if the segmenter didn't include it (it usually does include punctuation/spaces as segments, so we might duplicate spaces here if careful. But simplistic approach: only add space if splitting by space. ) */}
                    {!isCJK && i < words.length - 1 && ' '}
                </span>
            ))}
        </span>
    );
}

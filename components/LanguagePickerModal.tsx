'use client';

import { LANGUAGE_CONFIG } from '@/lib/languageConfig';
import { updateUserLanguage } from '@/app/[locale]/profile/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { createPortal } from 'react-dom';
import { useEffect, useState as useReactState } from 'react';

export function LanguagePickerModal({ currentLanguage, onClose }: { currentLanguage: string, onClose: () => void }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleSelect = async (code: string) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await updateUserLanguage(code.toUpperCase());
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Failed to change language", error);
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1a1b26] border border-gray-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Choisir une langue</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.values(LANGUAGE_CONFIG).map((lang) => {
                        const isSelected = lang.code === currentLanguage.toUpperCase();
                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                disabled={isLoading}
                                className={twMerge(
                                    "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                                    isSelected
                                        ? "bg-purple-500/20 border-purple-500"
                                        : "bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800"
                                )}
                            >
                                <span className="text-4xl shadow-sm">{lang.flag}</span>
                                <div className="flex-1">
                                    <div className={twMerge("font-bold", isSelected ? "text-purple-400" : "text-gray-200")}>
                                        {lang.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {lang.locale}
                                    </div>
                                </div>
                                {isSelected && <Check size={20} className="text-purple-500" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
}

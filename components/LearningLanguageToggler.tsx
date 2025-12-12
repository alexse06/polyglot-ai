'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { LANGUAGE_CONFIG, getConfig } from '@/lib/languageConfig';
import { LanguagePickerModal } from './LanguagePickerModal';
import { ChevronDown } from 'lucide-react';

export default function LearningLanguageToggler({ currentLanguage }: { currentLanguage: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const config = getConfig(currentLanguage);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 hover:border-gray-600 transition"
                title="Changer de langue"
            >
                <span className="text-2xl">{config?.flag || '🎓'}</span>
                <span className="font-bold hidden md:block text-sm">{config?.label || currentLanguage}</span>
                <ChevronDown size={14} className="text-gray-500" />
            </button>

            {isOpen && (
                <LanguagePickerModal
                    currentLanguage={currentLanguage}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

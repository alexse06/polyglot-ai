'use server';

import { generateCharacterData } from '@/lib/gemini';

export async function getLanguageCharacters(lang: string) {
    // 1. Try to generate fresh data from AI
    try {
        const aiData = await generateCharacterData(lang);
        if (aiData) {
            return aiData;
        }
    } catch (error) {
        console.error("AI Generation failed for characters, falling back to static data", error);
    }

    // 2. Fallback to hardcoded data if AI fails
    switch (lang) {
        case 'PT':
            return {
                type: 'LATIN',
                scriptName: 'Alfabeto Português',
                description: 'O alfabeto português tem 26 letras.',
                groups: [
                    {
                        title: 'Acentos & Cedilha',
                        characters: [
                            { symbol: 'Ç', pronunciation: 'ss' },
                            { symbol: 'Ã', pronunciation: 'an' },
                            { symbol: 'Õ', pronunciation: 'on' },
                            { symbol: 'Á', pronunciation: 'ah (aberto)' },
                            { symbol: 'Â', pronunciation: 'ah (fechado)' },
                            { symbol: 'É', pronunciation: 'eh (aberto)' },
                            { symbol: 'Ê', pronunciation: 'eh (fechado)' },
                        ]
                    }
                ]
            };
        case 'IT':
            return {
                type: 'LATIN',
                scriptName: 'Alfabeto Italiano',
                description: 'L\'alfabeto italiano ha 21 lettere standard.',
                groups: [
                    {
                        title: 'Lettere',
                        characters: [
                            { symbol: 'A', pronunciation: 'a' },
                            { symbol: 'E', pronunciation: 'e' },
                            { symbol: 'I', pronunciation: 'i' },
                            { symbol: 'O', pronunciation: 'o' },
                            { symbol: 'U', pronunciation: 'u' },
                        ]
                    }
                ]
            };
        case 'DE':
            return {
                type: 'LATIN',
                scriptName: 'Deutsches Alphabet',
                description: 'Das deutsche Alphabet.',
                groups: [
                    {
                        title: 'Umlaute & Eszett',
                        characters: [
                            { symbol: 'Ä', pronunciation: 'eh' },
                            { symbol: 'Ö', pronunciation: 'eu' },
                            { symbol: 'Ü', pronunciation: 'uw' },
                            { symbol: 'ß', pronunciation: 'ss' },
                        ]
                    }
                ]
            };
        case 'RU':
            return {
                type: 'SCRIPT',
                scriptName: 'Cyrillic',
                description: 'The Russian alphabet uses the Cyrillic script.',
                groups: [
                    {
                        title: 'Vowels',
                        characters: [
                            { symbol: 'А', romanization: 'A', pronunciation: 'a' },
                            { symbol: 'Е', romanization: 'Ye', pronunciation: 'ye' },
                            { symbol: 'И', romanization: 'I', pronunciation: 'i' },
                            { symbol: 'О', romanization: 'O', pronunciation: 'o' },
                            { symbol: 'У', romanization: 'U', pronunciation: 'u' },
                        ]
                    },
                    {
                        title: 'Consonants',
                        characters: [
                            { symbol: 'Б', romanization: 'B', pronunciation: 'b' },
                            { symbol: 'В', romanization: 'V', pronunciation: 'v' },
                            { symbol: 'Г', romanization: 'G', pronunciation: 'g' },
                            { symbol: 'Д', romanization: 'D', pronunciation: 'd' },
                        ]
                    }
                ]
            };
        case 'JP':
            return {
                type: 'SCRIPT',
                scriptName: 'Hiragana',
                description: 'Hiragana is used for native Japanese words.',
                groups: [
                    {
                        title: 'Basic',
                        characters: [
                            { symbol: 'あ', romanization: 'A', pronunciation: 'ah' },
                            { symbol: 'い', romanization: 'I', pronunciation: 'ee' },
                            { symbol: 'う', romanization: 'U', pronunciation: 'oo' },
                            { symbol: 'え', romanization: 'E', pronunciation: 'eh' },
                            { symbol: 'お', romanization: 'O', pronunciation: 'oh' },
                        ]
                    }
                ]
            };
        case 'CN':
            return {
                type: 'SCRIPT',
                scriptName: 'Pinyin',
                description: 'Mandarin Chinese tones.',
                groups: [
                    {
                        title: 'Tones',
                        characters: [
                            { symbol: 'ā', romanization: '1st', pronunciation: 'high' },
                            { symbol: 'á', romanization: '2nd', pronunciation: 'rising' },
                            { symbol: 'ǎ', romanization: '3rd', pronunciation: 'dip' },
                            { symbol: 'à', romanization: '4th', pronunciation: 'falling' },
                        ]
                    }
                ]
            };
        case 'FR':
            return {
                type: 'LATIN',
                scriptName: 'Alphabet Français',
                description: 'L\'alphabet français comprend 26 lettres et plusieurs caractères accentués importants pour la prononciation.',
                groups: [
                    {
                        title: 'Voyelles Accentuées',
                        characters: [
                            { symbol: 'é', name: 'e accent aigu', pronunciation: 'ay' },
                            { symbol: 'è', name: 'e accent grave', pronunciation: 'eh' },
                            { symbol: 'à', name: 'a accent grave', pronunciation: 'ah' },
                            { symbol: 'ù', name: 'u accent grave', pronunciation: 'ew' },
                            { symbol: 'â', name: 'a circonflexe', pronunciation: 'ah' },
                            { symbol: 'ê', name: 'e circonflexe', pronunciation: 'eh' },
                            { symbol: 'î', name: 'i circonflexe', pronunciation: 'ee' },
                            { symbol: 'ô', name: 'o circonflexe', pronunciation: 'oh' },
                            { symbol: 'û', name: 'u circonflexe', pronunciation: 'ew' },
                            { symbol: 'ë', name: 'e tréma', pronunciation: 'eh' },
                            { symbol: 'ï', name: 'i tréma', pronunciation: 'ee' },
                            { symbol: 'ü', name: 'u tréma', pronunciation: 'ew' },
                            { symbol: 'ÿ', name: 'y tréma', pronunciation: 'ee' },
                        ]
                    },
                    {
                        title: 'Consonnes Spéciales',
                        characters: [
                            { symbol: 'ç', name: 'c cédille', pronunciation: 'ss' },
                            { symbol: 'œ', name: 'e dans l\'o', pronunciation: 'eu' },
                            { symbol: 'æ', name: 'e dans l\'a', pronunciation: 'ay' },
                        ]
                    }
                ]
            };
        case 'EN':
            return {
                type: 'LATIN',
                scriptName: 'English Alphabet',
                description: 'The standard English alphabet with 26 letters.',
                groups: [
                    {
                        title: 'Vowels',
                        characters: [
                            { symbol: 'A', pronunciation: 'ei' },
                            { symbol: 'E', pronunciation: 'i:' },
                            { symbol: 'I', pronunciation: 'ai' },
                            { symbol: 'O', pronunciation: 'ou' },
                            { symbol: 'U', pronunciation: 'ju:' },
                        ]
                    },
                    {
                        title: 'Consonants (Tricky)',
                        characters: [
                            { symbol: 'C', pronunciation: 'si: / k' },
                            { symbol: 'G', pronunciation: 'dʒi: / g' },
                            { symbol: 'H', pronunciation: 'eɪtʃ' },
                            { symbol: 'J', pronunciation: 'dʒeɪ' },
                            { symbol: 'Q', pronunciation: 'kju:' },
                            { symbol: 'R', pronunciation: 'ɑːr' },
                            { symbol: 'W', pronunciation: 'ˈdʌbəljuː' },
                            { symbol: 'X', pronunciation: 'eks' },
                            { symbol: 'Y', pronunciation: 'waɪ' },
                            { symbol: 'Z', pronunciation: 'zi: / zed' },
                        ]
                    }
                ]
            };
        case 'ES':
            return {
                type: 'LATIN',
                scriptName: 'Alfabeto Español',
                description: 'El alfabeto español tiene 27 letras.',
                groups: [
                    {
                        title: 'Letras Especiales',
                        characters: [
                            { symbol: 'Ñ', romanization: 'Eñe', pronunciation: 'ny' },
                            { symbol: 'LL', romanization: 'Elle', pronunciation: 'y / j' },
                            { symbol: 'CH', romanization: 'Che', pronunciation: 'ch' },
                        ]
                    },
                    {
                        title: 'Vocales Acentuadas',
                        characters: [
                            { symbol: 'Á', name: 'A acentuada' },
                            { symbol: 'É', name: 'E acentuada' },
                            { symbol: 'Í', name: 'I acentuada' },
                            { symbol: 'Ó', name: 'O acentuada' },
                            { symbol: 'Ú', name: 'U acentuada' },
                            { symbol: 'Ü', name: 'U diéresis' },
                        ]
                    }
                ]
            };
        default:
            // Fallback to English if unknown, or generic message
            return {
                type: 'LATIN',
                scriptName: lang + ' Characters',
                description: 'Standard Latin Alphabet',
                groups: []
            };
    }
}

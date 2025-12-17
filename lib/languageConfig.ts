export const LANGUAGE_CONFIG = {
    EN: {
        code: 'EN',
        label: 'English',
        flag: '🇬🇧',
        locale: 'en-US',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Kore', languageCode: 'en-US' },
        stt: { lang: 'en-US' },
        aiPrompt: { targetLanguage: 'American English', tutorPersona: 'You are a friendly American English tutor.', negativeConstraint: 'Do NOT speak Spanish or other languages.' }
    },
    ES: {
        code: 'ES',
        label: 'Espagnol',
        flag: '🇪🇸',
        locale: 'es-ES',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Puck', languageCode: 'es-US' },
        stt: { lang: 'es-ES' },
        aiPrompt: { targetLanguage: 'Spanish', tutorPersona: 'You are a friendly Spanish tutor.', negativeConstraint: 'Do NOT speak English.' }
    },
    FR: {
        code: 'FR',
        label: 'Français',
        flag: '🇫🇷',
        locale: 'fr-FR',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Fenrir', languageCode: 'fr-FR' },
        stt: { lang: 'fr-FR' },
        aiPrompt: { targetLanguage: 'French', tutorPersona: 'You are a friendly French tutor.', negativeConstraint: 'Do NOT speak English.' }
    },
    DE: {
        code: 'DE',
        label: 'Allemand',
        flag: '🇩🇪',
        locale: 'de-DE',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Puck', languageCode: 'de-DE' },
        stt: { lang: 'de-DE' },
        aiPrompt: { targetLanguage: 'German', tutorPersona: 'You are a helpful German tutor.', negativeConstraint: 'Do NOT speak French. Speak German.' }
    },
    IT: {
        code: 'IT',
        label: 'Italien',
        flag: '🇮🇹',
        locale: 'it-IT',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Kore', languageCode: 'it-IT' },
        stt: { lang: 'it-IT' },
        aiPrompt: { targetLanguage: 'Italian', tutorPersona: 'You are a helpful Italian tutor.', negativeConstraint: 'Speak Italian.' }
    },
    PT: {
        code: 'PT',
        label: 'Portugais',
        flag: '🇵🇹',
        locale: 'pt-PT',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Puck', languageCode: 'pt-BR' },
        stt: { lang: 'pt-PT' },
        aiPrompt: { targetLanguage: 'Portuguese', tutorPersona: 'You are a helpful Portuguese tutor.', negativeConstraint: 'Speak Portuguese.' }
    },
    JP: {
        code: 'JP',
        label: 'Japonais',
        flag: '🇯🇵',
        locale: 'ja-JP',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Kore', languageCode: 'ja-JP' },
        stt: { lang: 'ja-JP' },
        aiPrompt: { targetLanguage: 'Japanese', tutorPersona: 'You are a helpful Japanese tutor. Use polite forms (Desu/Masu).', negativeConstraint: 'Speak Japanese.' }
    },
    CN: {
        code: 'CN',
        label: 'Chinois',
        flag: '🇨🇳',
        locale: 'zh-CN',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Puck', languageCode: 'cmn-CN' },
        stt: { lang: 'zh-CN' },
        aiPrompt: { targetLanguage: 'Mandarin Chinese', tutorPersona: 'You are a helpful Chinese tutor.', negativeConstraint: 'Speak Mandarin.' }
    },
    RU: {
        code: 'RU',
        label: 'Russe',
        flag: '🇷🇺',
        locale: 'ru-RU',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Charon', languageCode: 'ru-RU' },
        stt: { lang: 'ru-RU' },
        aiPrompt: { targetLanguage: 'Russian', tutorPersona: 'You are a helpful Russian tutor.', negativeConstraint: 'Speak Russian.' }
    },
    VI: {
        code: 'VI',
        label: 'Vietnamien',
        flag: '🇻🇳',
        locale: 'vi-VN',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Aoede', languageCode: 'vi-VN' },
        stt: { lang: 'vi-VN' },
        aiPrompt: { targetLanguage: 'Vietnamese', tutorPersona: 'You are a helpful Vietnamese tutor.', negativeConstraint: 'Speak Vietnamese.' }
    },
    AR: {
        code: 'AR',
        label: 'Arabe',
        flag: '🇸🇦',
        locale: 'ar-XA',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Zephyr', languageCode: 'ar-XA' },
        stt: { lang: 'ar-XA' },
        aiPrompt: { targetLanguage: 'Arabic', tutorPersona: 'You are a helpful Arabic tutor.', negativeConstraint: 'Speak Arabic.' }
    },
    KO: {
        code: 'KO',
        label: 'Coréen',
        flag: '🇰🇷',
        locale: 'ko-KR',
        tts: { model: 'gemini-2.5-flash-native-audio-preview-12-2025', voiceName: 'Kore', languageCode: 'ko-KR' },
        stt: { lang: 'ko-KR' },
        aiPrompt: { targetLanguage: 'Korean', tutorPersona: 'You are a helpful Korean tutor. Use polite forms (Desu/Masu equivalent).', negativeConstraint: 'Speak Korean.' }
    }
} as const;

export type LearningLanguage = keyof typeof LANGUAGE_CONFIG;

export const DEFAULT_LANGUAGE: LearningLanguage = 'EN';

export function getConfig(lang: string) {
    const safeLang = lang?.toUpperCase() || DEFAULT_LANGUAGE;
    return LANGUAGE_CONFIG[safeLang as keyof typeof LANGUAGE_CONFIG] || LANGUAGE_CONFIG[DEFAULT_LANGUAGE];
}

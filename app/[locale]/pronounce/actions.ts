'use server'

import { prisma } from '@/lib/db';
import { generatePronunciationSentence, evaluatePronunciationWithAudio } from '@/lib/gemini';
import { getUserProfile } from '../profile/actions';
import logger from '@/lib/logger';

const CURRICULUM_ES = {
    "A1": ["Vowels (a,e,i,o,u)", "L", "D", "T"],
    "A2": ["R (soft)", "J (Jota)", "G (Gue/Gui)", "Ñ"],
    "B1": ["RR (rolling)", "LL vs Y", "H (silent)", "B vs V"],
    "B2": ["Intonation", "Speed", "Complex Diphthongs"]
};

const CURRICULUM_EN = {
    "A1": ["TH (soft)", "TH (hard)", "Short I vs Long E", "W vs V"],
    "A2": ["R (English)", "Schwa sound", "Past Tense -ed", "Silent letters"],
    "B1": ["Word Stress", "Connected Speech", "T (Glottal Stop)", "Dark L"],
    "B2": ["Intonation patterns", "Rhythm", "American vs British T"]
};

export async function getPronunciationChallenge(levelOverride?: string) {
    logger.info("getPronunciationChallenge", { levelOverride });
    try {
        const user = await getUserProfile();

        // Fetch explicit language level
        let level = levelOverride;
        let lang = "ES";
        if (user?.id) {
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: { languageProgress: true }
            });
            lang = dbUser?.learningLanguage || "EN";

            if (!level) {
                const progress = dbUser?.languageProgress.find(p => p.language === lang);
                level = progress?.level || "A1";
            }
        }

        // Ensure strictly string
        const safeLevel = level || "A1";

        const CURRICULUM = lang === 'EN' ? CURRICULUM_EN : CURRICULUM_ES;

        console.log("User level identified:", safeLevel, "Language:", lang);

        // 1. Analyze weak points from history
        let targetPhoneme = null;
        if (user && user.id) {
            try {
                // Get last 20 attempts
                const history = await prisma.pronunciationAttempt.findMany({
                    where: { userId: user.id, language: lang }, // Filter by language
                    orderBy: { createdAt: 'desc' },
                    take: 20
                });

                // Simple algorithm: Find the phoneme with lowest average score from current curriculum
                const levelPhonemes = CURRICULUM[safeLevel as keyof typeof CURRICULUM] || CURRICULUM["A1"];
                let lowestScore = 10;

                for (const phoneme of levelPhonemes) {
                    const attempts = history.filter((h: any) => h.targetPhoneme === phoneme);
                    if (attempts.length === 0) {
                        // Never tried? Prioritize it!
                        targetPhoneme = phoneme;
                        break;
                    }
                    const avg = attempts.reduce((acc: number, curr: any) => acc + curr.score, 0) / attempts.length;
                    if (avg < 7 && avg < lowestScore) {
                        lowestScore = avg;
                        targetPhoneme = phoneme;
                    }
                }

                // If all mastered (or empty), pick random from level
                if (!targetPhoneme) {
                    targetPhoneme = levelPhonemes[Math.floor(Math.random() * levelPhonemes.length)];
                }
            } catch (dbError) {
                console.error("DB History Error (Non-fatal):", dbError);
                targetPhoneme = "General";
            }
        } else {
            targetPhoneme = "General Pronunciation";
        }

        console.log("Selected Target Phoneme:", targetPhoneme);

        const challenge = await generatePronunciationSentence(safeLevel, targetPhoneme, lang);
        console.log("Challenge generated:", challenge);
        return { ...challenge, targetPhoneme };

    } catch (e) {
        logger.error("Critical Error in getPronunciationChallenge", { error: e });
        // Emergency fallback
        return {
            sentence: "Hola, ¿cómo estás?",
            translation: "Hello, how are you?",
            targetPhoneme: "Basics"
        };
    }
}

export async function checkPronunciation(audioBase64: string, expectedText: string, targetPhoneme: string = "General") {
    logger.info("checkPronunciation", { expectedText, targetPhoneme });
    try {
        const user = await getUserProfile();
        // Determine language
        let lang = "ES";
        if (user?.id) {
            const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
            lang = dbUser?.learningLanguage || "EN";
        }

        console.log("User retrieved, sending to Gemini...");
        const result = await evaluatePronunciationWithAudio(audioBase64, expectedText, lang);
        console.log("Gemini result received:", result);

        // Save to DB
        // Save to DB
        if (user && user.id) {
            try {
                // Get user language
                const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
                const userLang = dbUser?.learningLanguage || "ES";

                await prisma.pronunciationAttempt.create({
                    data: {
                        userId: user.id,
                        sentence: expectedText,
                        targetPhoneme: targetPhoneme,
                        score: result.score,
                        feedback: result.feedback,
                        transcription: result.transcription,
                        language: userLang
                    }
                });

                // Award XP for good pronunciation
                if (result.score >= 80) {
                    const { addXP } = await import('@/lib/progress');
                    await addXP(user.id, lang, 10);
                }

            } catch (dbErr) {
                console.error("Failed to save pronunciation attempt:", dbErr);
            }
        }
        return result;
    } catch (e) {
        logger.error("checkPronunciation Critical Error", { error: e });
        throw e;
    }
}

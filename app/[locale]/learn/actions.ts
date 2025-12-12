'use server'

import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/auth';
import { generateLessonContent } from '@/lib/gemini';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getLessons() {
    const userId = await getUserId();
    const user = await prisma.user.findUnique({ where: { id: userId || 'unknown' } });
    const learningLanguage = user?.learningLanguage || "EN";

    const lessons = await prisma.lesson.findMany({
        where: { language: learningLanguage },
        orderBy: { order: 'asc' },
        include: {
            progress: {
                where: {
                    userId: userId || ''
                }
            }
        }
    });

    // Check standard curriculum size and seed if missing
    const totalSpecificTopics = 15;
    if (lessons.length < totalSpecificTopics) {
        await seedLessons(lessons.map(l => l.title), learningLanguage);
        // Re-fetch
        return await prisma.lesson.findMany({
            where: { language: learningLanguage },
            orderBy: { order: 'asc' },
            include: { progress: { where: { userId: userId || '' } } }
        });
    }

    return lessons;
}

export async function getLessonById(id: string) {
    return await prisma.lesson.findUnique({
        where: { id }
    });
}

async function seedLessons(existingTitles: string[] = [], language: string = "ES") {

    // Spanish Curriculum
    const curriculumES = [
        // A1 - Basics
        { title: "Introduction", topic: "Salutations and Basics", level: "A1" },
        { title: "Au restaurant", topic: "Ordering food and drinks", level: "A1" },
        { title: "Voyage", topic: "Travel essentials and directions", level: "A1" },
        { title: "La Famille", topic: "Family members and descriptions", level: "A1" },
        { title: "Les Nombres", topic: "Numbers 1-100 and prices", level: "A1" },
        { title: "Ma Routine", topic: "Daily routine verbs (reflexive)", level: "A1" },
        { title: "Au marché", topic: "Fruits, verbs, buying food", level: "A1" },
        { title: "Les Hobbies", topic: "Sports and leisure activities", level: "A1" },
        // A2
        { title: "Le Passé (Preterite)", topic: "Talking about yesterday", level: "A2" },
        { title: "Futur Proche", topic: "Plans for tomorrow (ir + a + infinitive)", level: "A2" },
        { title: "La Maison", topic: "Rooms and furniture", level: "A2" },
        { title: "Chez le Médecin", topic: "Body parts and health", level: "A2" },
        { title: "La Météo", topic: "Weather and seasons", level: "A2" },
        { title: "Vêtements", topic: "Clothing and colors", level: "A2" },
        { title: "Sentiments", topic: "Emotions and Estar vs Ser", level: "A2" }
    ];

    // English Curriculum (as template for others if needed)
    const curriculumEN = [
        // A1
        { title: "Introduction", topic: "Greetings and Introduction (to be)", level: "A1" },
        { title: "At the Restaurant", topic: "Ordering food, polite requests (would like)", level: "A1" },
        { title: "Travel", topic: "Travel directions and transport", level: "A1" },
        { title: "Family", topic: "Family members and possessives", level: "A1" },
        { title: "Numbers", topic: "Numbers, time, and prices", level: "A1" },
        { title: "My Routine", topic: "Present Simple and daily habits", level: "A1" },
        { title: "Market", topic: "Food items and Countable/Uncountable", level: "A1" },
        { title: "Hobbies", topic: "Likes and Dislikes (gerunds)", level: "A1" },
        // A2
        { title: "The Past", topic: "Talking about finished actions", level: "A2" },
        { title: "Future", topic: "Future plans and predictions", level: "A2" },
        { title: "Home", topic: "Home description and prepositions", level: "A2" },
        { title: "At the Doctor", topic: "Health problems and advice (should)", level: "A2" },
        { title: "The Weather", topic: "Weather vocabulary", level: "A2" },
        { title: "Clothes", topic: "Shopping for clothes", level: "A2" },
        { title: "Feelings", topic: "Feelings and Adjectives", level: "A2" }
    ];

    // French Curriculum (Explicit to ensure good titles)
    const curriculumFR = [
        // A1
        { title: "Introduction", topic: "Salutations et Présentations", level: "A1" },
        { title: "Au restaurant", topic: "Commander à manger et boire", level: "A1" },
        { title: "Voyage", topic: "Voyage et directions", level: "A1" },
        { title: "La Famille", topic: "Membres de la famille", level: "A1" },
        { title: "Les Nombres", topic: "Chiffres et prix", level: "A1" },
        { title: "Ma Routine", topic: "Verbes du quotidien", level: "A1" },
        { title: "Au marché", topic: "Nourriture et achats", level: "A1" },
        { title: "Les Hobbies", topic: "Sports et loisirs", level: "A1" },
        // A2
        { title: "Le Passé", topic: "Parler d'hier (Passé Composé/Imparfait)", level: "A2" },
        { title: "Futur", topic: "Projets d'avenir", level: "A2" },
        { title: "La Maison", topic: "Pièces et meubles", level: "A2" },
        { title: "Chez le Médecin", topic: "Santé et corps", level: "A2" },
        { title: "La Météo", topic: "Temps et climat", level: "A2" },
        { title: "Vêtements", topic: "Vêtements et couleurs", level: "A2" },
        { title: "Sentiments", topic: "Émotions", level: "A2" }
    ];

    let curriculum = curriculumES;
    if (language === 'EN') curriculum = curriculumEN;
    else if (language === 'FR') curriculum = curriculumFR;
    else {
        // Fallback for DE, IT, etc -> Use English topics but generate in Target Lang
        // We should ideally translate titles or keep them generic.
        // For now, let's use EN structure but Gemini makes content in Target Lang.
        curriculum = curriculumEN;
    }

    // Determine the next order index
    const count = await prisma.lesson.count({ where: { language } });
    let nextOrder = count;

    for (const t of curriculum) {
        if (existingTitles.includes(t.title)) continue;

        try {
            const content = await generateLessonContent(t.topic, t.level, language);
            await prisma.lesson.create({
                data: {
                    title: t.title,
                    description: content.description || `Learn about ${t.topic}`,
                    level: t.level,
                    category: "VOCABULARY",
                    language: language,
                    content: JSON.stringify(content),
                    order: nextOrder++
                }
            });
        } catch (e) {
            console.error("Failed to seed lesson", t.title, e);
        }
    }
}

export async function completeLesson(lessonId: string, score: number) {
    const userId = await getUserId();
    if (!userId) return;

    // Save progress
    await prisma.userLessonProgress.upsert({
        where: {
            userId_lessonId: { userId, lessonId }
        },
        update: {
            completed: true,
            score: score,
            completedAt: new Date()
        },
        create: {
            userId,
            lessonId,
            completed: true,
            score: score
        }
    });

    // Calculate Streak & XP
    // Calculate Streak & XP
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { languageProgress: true } // Fetch progress to find streak
    });

    if (user) {
        const lang = user.learningLanguage || "ES";
        // Find specific progress
        let progress = user.languageProgress.find(p => p.language === lang);

        // If no progress record, create one (should exist though)
        if (!progress) {
            progress = await prisma.userLanguageProgress.create({
                data: { userId, language: lang, level: 'A1', xp: 0, streak: 0, lastStudyDate: new Date() }
            });
        }

        const lastStudyDate = progress.lastStudyDate ? new Date(progress.lastStudyDate) : new Date(0);
        const now = new Date();
        const isSameDay = lastStudyDate.toDateString() === now.toDateString();

        // Check for yesterday (for streak increment)
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isConsecutive = lastStudyDate.toDateString() === yesterday.toDateString();

        let newStreak = progress.streak;
        if (!isSameDay) {
            newStreak = isConsecutive ? progress.streak + 1 : 1;
        }

        // Update Progress
        await prisma.userLanguageProgress.update({
            where: { id: progress.id },
            data: {
                xp: { increment: 50 },
                streak: newStreak,
                lastStudyDate: now
            }
        });

        // Update User global lastActive
        await prisma.user.update({
            where: { id: userId },
            data: { lastActive: now }
        });
    }

    // Generate Flashcards from Lesson Content
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (lesson && lesson.content) {
        try {
            const content = JSON.parse(lesson.content);
            if (content.exercises) {
                const vocabExercises = content.exercises.filter((ex: any) =>
                    ex.type === 'TRANSLATE_TO_TARGET' && ex.correctAdjusted
                );

                for (const ex of vocabExercises) {
                    // Extract "Hello" from "Translate: Hello"
                    const back = ex.question.replace(/^Translate:\s*/i, '').replace(/^Traduire:\s*/i, '');
                    const front = ex.correctAdjusted; // Spanish

                    if (front && back) {
                        // Check duplicate handled in createFlashcard, but we can do it here to save DB calls if needed
                        // actually let's use the helper
                        await prisma.userFlashcard.upsert({
                            where: {
                                // We don't have a unique constraint on userId+front yet other than implied logic
                                // but we can check existence first or use createMany with skipDuplicates if supported (sqlite supports it partially)
                                // Let's just use findFirst logic inside a loop for now or catch errors
                                // safer to simple create if not exists
                                id: 'bjir' // invalid
                            },
                            create: { userId, front, back },
                            update: {}
                        }).catch(() => null); // upsert requires unique, which we don't have easily on (userId, front) without modification

                        // Revert to simple check-and-create pattern
                        const existing = await prisma.userFlashcard.findFirst({
                            where: { userId, front }
                        });
                        if (!existing) {
                            // check user language again or reuse if lifted
                            const user = await prisma.user.findUnique({ where: { id: userId } });
                            const lang = user?.learningLanguage || "ES";

                            await prisma.userFlashcard.create({
                                data: { userId, front, back, language: lang, nextReview: new Date() }
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Error generating flashcards", e);
        }

        // Auto-Generate Next Lesson if this was the last one
        // 1. Check if it's the last lesson
        const totalLessons = await prisma.lesson.count();
        if (lesson.order === totalLessons - 1) {
            try {
                // It was the last one! Let's make a new one.
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { languageProgress: true }
                });
                const lang = user?.learningLanguage || "ES";
                const progress = user?.languageProgress.find(p => p.language === lang);
                const currentLevel = progress?.level || "A1";

                // Import dynamically to avoid circular dep issues
                const { suggestNextLessonTopic, generateLessonContent } = await import('@/lib/gemini');

                const nextTopicData = await suggestNextLessonTopic(currentLevel, lesson.title, lang);

                const content = await generateLessonContent(nextTopicData.topic, nextTopicData.level, lang);

                const nextOrder = await prisma.lesson.count({ where: { language: lang } });

                await prisma.lesson.create({
                    data: {
                        title: nextTopicData.title,
                        description: content.description || `Apprenez : ${nextTopicData.topic}`,
                        level: nextTopicData.level,
                        category: "GENERATED",
                        language: lang,
                        content: JSON.stringify(content),
                        order: nextOrder
                    }
                });

            } catch (e) {
                console.error("Failed to auto-generate next lesson", e);
            }
        }
    }

    revalidatePath('/dashboard');
    revalidatePath('/learn');

    // Level Evolution Check (Simple: If score > 90% on 3 last lessons, suggest level up)
    // For now we just return a flag if they might be ready, handled by UI?
    // Actually, let's keep it simple: Infinite Loop handles content at current level.
}

export async function generateNextLessonAction() {
    try {
        const userId = await getUserId();
        if (!userId) {
            console.error("GenerateLesson: No user ID");
            throw new Error("Unauthorized");
        }

        const userWithProgress = await prisma.user.findUnique({
            where: { id: userId },
            include: { languageProgress: true }
        });
        if (!userWithProgress) {
            console.error("GenerateLesson: User not found in DB", userId);
            throw new Error("User not found");
        }
        console.log("GenerateLesson: Starting for user", userId);
        const lang = userWithProgress.learningLanguage || "ES";
        const progress = userWithProgress.languageProgress.find(p => p.language === lang);

        // Get last lesson title
        const lastLesson = await prisma.lesson.findFirst({
            orderBy: { order: 'desc' }
        });

        const currentLevel = progress?.level || "A1";
        const lastTopic = lastLesson?.title || "Introduction";

        // Dynamic Import
        const { suggestNextLessonTopic, generateLessonContent } = await import('@/lib/gemini');

        const nextTopicData = await suggestNextLessonTopic(currentLevel, lastTopic, lang);
        const content = await generateLessonContent(nextTopicData.topic, nextTopicData.level, lang);

        const count = await prisma.lesson.count({ where: { language: lang } });

        await prisma.lesson.create({
            data: {
                title: nextTopicData.title,
                description: content.description || `Leçon générée : ${nextTopicData.topic}`,
                level: nextTopicData.level,
                category: "GENERATED",
                language: lang,
                content: JSON.stringify(content),
                order: count // append
            }
        });

        revalidatePath('/learn');
    } catch (e: any) {
        console.error("GenerateLesson: Error generating lesson", e);
        throw e;
    }
}

export async function explainError(question: string, wrongAnswer: string, correctAnswer: string) {
    const userId = await getUserId();
    const user = await prisma.user.findUnique({ where: { id: userId || 'unknown' } });
    const lang = user?.learningLanguage || "ES";

    // Import dynamically or use the one from lib directly if imported
    const { explainGrammarError } = await import('@/lib/gemini');
    return await explainGrammarError(question, wrongAnswer, correctAnswer, lang);
}

'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getLearningPath(userId: string, languageCode: string = 'ES') {
    // 1. Fetch all content for the language
    const lessons = await prisma.lesson.findMany({
        where: { language: languageCode },
        orderBy: { order: 'asc' }
    });

    const scenarios = await prisma.scenario.findMany({
        where: { language: languageCode },
        orderBy: { order: 'asc' }
    });

    // 2. Fetch User Progress
    const lessonProgress = await prisma.userLessonProgress.findMany({
        where: { userId, language: languageCode }
    });

    const scenarioProgress = await prisma.userScenarioProgress.findMany({
        where: { userId, language: languageCode }
    });

    // 3. Create a Map of ID -> Completed status
    const completedIds = new Set<string>();
    lessonProgress.forEach(p => { if (p.completed) completedIds.add(p.lessonId); });
    scenarioProgress.forEach(p => { if (p.completed) completedIds.add(p.scenarioId); });

    // 4. Unify and Sort
    const allItems = [
        ...lessons.map(l => ({ ...l, type: 'LESSON' as const })),
        ...scenarios.map(s => ({ ...s, type: 'SCENARIO' as const }))
    ].sort((a, b) => a.order - b.order);

    // 5. Calculate Status & Group by Unit
    const units: { title: string; items: any[] }[] = [];
    let currentUnitTitle = '';
    let currentUnitItems: any[] = [];
    let previousCompleted = true; // First item is unlocked by default

    for (const item of allItems) {
        const isCompleted = completedIds.has(item.id);
        let status = 'LOCKED';

        if (isCompleted) {
            status = 'COMPLETED';
        } else if (previousCompleted) {
            status = 'ACTIVE';
        }

        // Add type-specific calculated fields
        const processedItem = {
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            status,
            order: item.order,
            // For routing
            href: item.type === 'LESSON' ? `/learn/${item.id}` : `/scenarios/${item.id}`
        };

        // Grouping logic
        // Use 'category' as Unit Title. Default to 'General' if missing.
        const category = (item as any).category || 'General';

        if (category !== currentUnitTitle) {
            if (currentUnitTitle) {
                units.push({ title: currentUnitTitle, items: currentUnitItems });
            }
            currentUnitTitle = category;
            currentUnitItems = [];
        }

        currentUnitItems.push(processedItem);

        // Update previousCompleted for the NEXT item
        previousCompleted = isCompleted;
    }

    // Push the last unit
    if (currentUnitItems.length > 0) {
        units.push({ title: currentUnitTitle, items: currentUnitItems });
    }

    return units;
}

// Re-implementing the generation action
import { getGeminiModel } from '@/lib/gemini';
import { getOrCreateUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function generateNextLessonAction() {
    const user = await getOrCreateUser();
    if (!user) return;

    const model = await getGeminiModel();
    const language = user.learningLanguage || 'ES';

    // Simple prompt for now, can be enhanced
    const prompt = `
    Generate a new beginner lesson (A1/A2) for learning ${language}.
    Format: JSON.
    {
        "title": "Lesson Title",
        "description": "Short description",
        "content": "Lesson content..."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);

            // Create the lesson
            const lesson = await prisma.lesson.create({
                data: {
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    language: language,
                    level: 'A1',
                    category: 'Generated',
                    order: 999 // Put it at the end
                }
            });

            revalidatePath('/learn');
            return lesson;
        }
    } catch (e) {
        console.error("Failed to generate lesson", e);
    }
}

// Restore completeLesson
export async function completeLesson(lessonId: string, score: number) {
    const user = await getOrCreateUser();
    if (!user) return;

    const userLanguage = user.learningLanguage || 'ES';

    await prisma.userLessonProgress.upsert({
        where: {
            userId_lessonId: {
                userId: user.id,
                lessonId: lessonId
            }
        },
        update: {
            completed: true,
            score: score,
            language: userLanguage, // Update language
            completedAt: new Date()
        },
        create: {
            userId: user.id,
            lessonId: lessonId,
            language: userLanguage,
            completed: true,
            score: score
        }
    });

    // Add XP
    const { addXP } = await import('@/lib/progress');
    await addXP(user.id, 50, userLanguage); // 50 XP per lesson

    revalidatePath('/learn');
    revalidatePath('/dashboard');
}

// Restore explainError
import { explainGrammarError } from '@/lib/gemini';

export async function explainError(question: string, wrongAnswer: string, correctAnswer: string) {
    const user = await getOrCreateUser();
    const lang = user?.learningLanguage || 'ES';
    return explainGrammarError(question, wrongAnswer, correctAnswer, lang);
}

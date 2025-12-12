'use server'

import { generatePlacementQuestions, evaluateUserLevel } from '@/lib/gemini';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function startPlacementTest(language: string = "ES") {
    const questions = await generatePlacementQuestions(language);
    return questions;
}

export async function submitPlacementTest(responses: any[], language: string = "ES") {
    const textRepresentation = responses.map(r => `Question: ${r.question}, Answer: ${r.answer}`).join("\n");
    const evaluation = await evaluateUserLevel(textRepresentation, language);

    // Create User and Save Progress
    const cookieStore = await cookies();
    let userId = cookieStore.get('spanish_app_user_id')?.value;

    if (!userId) {
        userId = require('uuid').v4();
        cookieStore.set('spanish_app_user_id', userId!, { secure: true, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 365 });
    }

    // Upsert user
    const user = await prisma.user.upsert({
        where: { id: userId },
        update: {
            // level: evaluation.level, // DEPRECATED
            // xp: { increment: 50 }, // DEPRECATED
            learningLanguage: language
        },
        create: {
            id: userId,
            // level: evaluation.level,
            // xp: 50,
            name: "Estudiante",
            learningLanguage: language
        }
    });

    // Update Language Specific Progress
    await prisma.userLanguageProgress.upsert({
        where: {
            userId_language: {
                userId: user.id,
                language: language
            }
        },
        update: {
            level: evaluation.level,
            xp: { increment: 50 }
        },
        create: {
            userId: user.id,
            language: language,
            level: evaluation.level,
            xp: 50
        }
    });

    return evaluation;
}

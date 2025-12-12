'use server'

import { prisma } from '@/lib/db';
import { getUserId } from '@/lib/auth';
import { generateScenarioProfile } from '@/lib/gemini';
import { revalidatePath } from 'next/cache';
import { getGeminiModel } from '@/lib/gemini';
import { getConfig } from '@/lib/languageConfig';

interface ScenarioSeed {
    title: string;
    description: string;
    objective: string;
    initialPrompt: string;
    level: string;
}

export async function generateNewScenario() {
    const userId = await getUserId();
    if (!userId) return;

    // Get current user level (default A1)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { languageProgress: true }
    });
    const lang = user?.learningLanguage || "EN";
    const progress = user?.languageProgress.find(p => p.language === lang);
    const level = progress?.level || "A1";

    // Generate content
    const content = await generateScenarioProfile(level, lang);

    // Get message count for order
    const count = await prisma.scenario.count();

    // Save to DB
    await prisma.scenario.create({
        data: {
            title: content.title,
            description: content.description,
            objective: content.objective,
            initialPrompt: content.initialPrompt,
            level: level,
            language: lang,
            order: count
        }
    });

    revalidatePath('/scenarios');
}

export async function getScenarioHint(
    history: { role: 'user' | 'model'; content: string }[],
    objective: string,
    targetLanguage: string, // The language being learned (e.g. ES)
    userLanguage: string = 'FR' // The user's interface language (e.g. FR) for the hint itself
) {
    const model = await getGeminiModel();

    // Construct a brief context
    const transcript = history.map(h => `${h.role}: ${h.content}`).join('\n');

    const prompt = `You are a helpful tutor assisting a student in a roleplay scenario.
    
    Scenario Objective: "${objective}"
    Target Language: ${targetLanguage}
    Student's Native Language: ${userLanguage}
    
    Conversation so far:
    ${transcript}
    
    The student is stuck. Provide a short, helpful hint in their native language (${userLanguage}) about what they should say or do next to advance the scenario. 
    Also suggest a starter phrase in ${targetLanguage}.
    
    Return ONLY JSON:
    {
        "hint": "Explanation in ${userLanguage}...",
        "suggestedPhrase": "Phrase in ${targetLanguage}..."
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return { hint: "Essayez de saluer !", suggestedPhrase: "Hola !" };
    } catch (e) {
        console.error("Hint generation failed", e);
        return null;
    }
}

export async function getScenarios() {
    const userId = await getUserId();
    const user = await prisma.user.findUnique({ where: { id: userId || 'unknown' } });
    // DEBUG: Force EN
    const lang = user?.learningLanguage || "EN";


    const scenarios = await prisma.scenario.findMany({
        where: { language: lang },
        orderBy: { order: 'asc' },
        include: {
            progress: {
                where: { userId: userId || '' }
            }
        }
    });
    const fs = require('fs');
    try {
        fs.appendFileSync('debug.log', `[${new Date().toISOString()}] getScenarios called. userId: ${userId}, foundUser: ${!!user}, lang: ${lang}, scenariosFound: ${scenarios.length}\n`);
        scenarios.forEach(s => fs.appendFileSync('debug.log', ` - Scenario: ${s.id} ${s.title} (${s.language})\n`));
    } catch (e) { }



    if (scenarios.length === 0) {

        await seedScenarios(lang);
        return await prisma.scenario.findMany({
            where: { language: lang },
            orderBy: { order: 'asc' },
            include: { progress: { where: { userId: userId || '' } } }
        });
    }

    return scenarios;
}

export async function getScenarioById(id: string) {
    return await prisma.scenario.findUnique({
        where: { id }
    });
}

async function seedScenarios(language: string = "ES") {
    const scenariosES = [
        {
            title: "Commander un Café",
            description: "Apprenez à commander votre boisson préférée à Madrid.",
            objective: "Commander un café con leche et demander l'addition.",
            initialPrompt: "You are a friendly waiter at a cafe in Madrid. The user is a customer. Wait for them to order. If they make mistakes, gently correct them in Spanish.",
            level: "A1"
        },
        {
            title: "Réserver un Hôtel",
            description: "Assurez votre hébergement pour les vacances.",
            objective: "Réserver une chambre double pour deux nuits.",
            initialPrompt: "You are a receptionist at a hotel in Barcelona. The user wants to book a room. Ask for dates and ID. Speak Spanish.",
            level: "A1"
        },
        {
            title: "Demander son Chemin",
            description: "Ne vous perdez plus jamais en ville.",
            objective: "Demander où se trouve la gare la plus proche.",
            initialPrompt: "You are a local in Seville. The user is lost and asking for directions. Use simple directions in Spanish.",
            level: "A1"
        },
        {
            title: "Au Marché",
            description: "Achetez des produits frais comme un local.",
            objective: "Acheter 1kg de pommes et demander le prix.",
            initialPrompt: "You are a fruit vendor at a market in Valencia. Negotiate prices slightly in Spanish.",
            level: "A2"
        }
    ];

    const scenariosEN = [
        {
            title: "Commander un Café (London)",
            description: "Apprenez à commander votre boisson préférée à Londres.",
            objective: "Commander un latte et un muffin.",
            initialPrompt: "You are a barista at a coffee shop in London. The user is a customer. Wait for them to order. Speak only English.",
            level: "A1"
        },
        {
            title: "Check-in à l'Hôtel",
            description: "Arrivée à l'hôtel à New York.",
            objective: "Faire le check-in et demander le wifi.",
            initialPrompt: "You are a hotel receptionist in New York. Welcome the user, ask for reservation name and credit card. Speak only English.",
            level: "A1"
        },
        {
            title: "Demander son Chemin (NYC)",
            description: "Retrouver son chemin à Manhattan.",
            objective: "Demander comment aller à Central Park.",
            initialPrompt: "You are a New Yorker. The user asks for directions to Central Park. Give clear directions in English. Speak only English.",
            level: "A1"
        },
        {
            title: "Rencontre Amicale",
            description: "Faire connaissance avec un nouveau collègue.",
            objective: "Se présenter et poser des questions basiques.",
            initialPrompt: "You are a new colleague from Australia. You are friendly and chatty. Ask the user about their job and hobbies. Speak only English.",
            level: "A2"
        }
    ];

    let scenariosToSeed: ScenarioSeed[] = [];

    if (language === 'EN') {
        scenariosToSeed = scenariosEN;
    } else if (language === 'ES') {
        scenariosToSeed = scenariosES;
    } else {
        // Dynamic Bootstrap for other languages

        try {
            const firstScenario = await generateScenarioProfile('A1', language);
            scenariosToSeed = [{
                ...firstScenario,
                level: 'A1',
                order: 0
            }];
        } catch (e) {
            console.error(`Failed to bootstrap ${language}`, e);
        }
    }

    for (let i = 0; i < scenariosToSeed.length; i++) {
        const s = scenariosToSeed[i];
        await prisma.scenario.create({
            data: {
                title: s.title,
                description: s.description,
                objective: s.objective,
                initialPrompt: s.initialPrompt,
                level: s.level || 'A1',
                language: language,
                order: i
            }
        });
    }
}

export async function evaluateScenario(scenarioId: string, conversationHistory: { role: string; content: string }[]) {
    const userId = await getUserId();
    if (!userId) return;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const language = user?.learningLanguage || "ES";

    // Use AI evaluation
    const { evaluateConversation } = await import('@/lib/gemini');
    let aiResult;
    try {
        aiResult = await evaluateConversation(conversationHistory, language);
    } catch (e) {
        console.error("AI Eval failed", e);
        aiResult = { score: 5, feedback: "Evaluation indisponible.", vocabulary: [], tips: [] };
    }

    const score = Math.min(100, (aiResult.score || 5) * 10);
    const passed = score >= 60;

    await prisma.userScenarioProgress.upsert({
        where: {
            userId_scenarioId: { userId, scenarioId }
        },
        update: {
            completed: passed,
            score: score,
            completedAt: new Date()
        },
        create: {
            userId,
            scenarioId,
            completed: passed,
            score: score,
            language: language // Explicitly save language if not default
        }
    });

    // Award XP if passed
    if (passed) {
        // user and language are already defined above
        try {
            const { addXP } = await import('@/lib/progress');
            await addXP(userId, language, 20); // 20 XP for scenario
        } catch (e) { console.error("XP Error", e); }
    }

    return { passed, score, feedback: aiResult };
}

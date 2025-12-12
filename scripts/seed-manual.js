const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Learning Path data...');

    // 1. Clear existing data (optional, but good for testing)
    await prisma.lesson.deleteMany({});
    await prisma.scenario.deleteMany({});

    // --- UNIT 1: BASICS (Salutations & First Steps) ---

    // Lesson 1: Hola!
    await prisma.lesson.create({
        data: {
            title: "Hola!",
            description: "Learn basic greetings.",
            level: "A1",
            category: "Basics",
            language: "ES",
            order: 10,
            content: "Hola, Buenos días, Buenas tardes, Buenas noches."
        }
    });

    // Lesson 2: Introductions
    await prisma.lesson.create({
        data: {
            title: "Introductions",
            description: "How to say your name.",
            level: "A1",
            category: "Basics",
            language: "ES",
            order: 20,
            content: "Me llamo Juan. Soy de España."
        }
    });

    // Scenario 1: First Meeting
    await prisma.scenario.create({
        data: {
            title: "Meeting a New Friend",
            description: "Practice saying hello in a park.",
            objective: "Introduce yourself and ask for their name.",
            initialPrompt: "You are in a park in Madrid. Someone sits on the bench next to you.",
            language: "ES",
            level: "A1",
            order: 30
        }
    });

    // --- UNIT 2: TRAVEL (Ordering & Directions) ---

    // Lesson 3: Numbers & Money
    await prisma.lesson.create({
        data: {
            title: "Numbers & Money",
            description: "Counting from 1 to 100.",
            level: "A1",
            category: "Travel",
            language: "ES",
            order: 40,
            content: "Uno, dos, tres, cuatro, cinco..."
        }
    });

    // Scenario 2: Ordering Coffee
    await prisma.scenario.create({
        data: {
            title: "Ordering Coffee",
            description: "Order a drink at a café.",
            objective: "Order a café con leche and pay.",
            initialPrompt: "You are at a café in Barcelona. The waiter approaches you.",
            language: "ES",
            level: "A1",
            order: 50
        }
    });

    // Scenario 3: Asking Directions
    await prisma.scenario.create({
        data: {
            title: "Lost in the City",
            description: "Ask for directions to the museum.",
            objective: "Find out where the Prado Museum is.",
            initialPrompt: "You are lost in Madrid. You ask a police officer for help.",
            language: "ES",
            level: "A1",
            order: 60
        }
    });

    console.log('✅ Seeding complete: 2 Units, 3 Lessons, 3 Scenarios.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

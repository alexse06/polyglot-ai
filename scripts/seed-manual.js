const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Scenarios Manually ---');

    await seedScenarios("ES");
    await seedScenarios("EN");

    console.log("--- Seeding Complete ---");
}

async function seedScenarios(language = "ES") {
    console.log(`Seeding Scenarios for ${language}...`);

    // Check if exists
    const count = await prisma.scenario.count({ where: { language } });
    if (count > 0) {
        console.log(`Scenarios for ${language} already exist. Skipping.`);
        return;
    }

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

    const scenarios = language === "EN" ? scenariosEN : scenariosES;

    for (let i = 0; i < scenarios.length; i++) {
        const s = scenarios[i];
        await prisma.scenario.create({
            data: {
                ...s,
                language: language,
                order: i
            }
        });
        console.log(`Created: ${s.title}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = "sempere.alexis@gmail.com";

async function main() {
    console.log(`Searching for user with email: ${EMAIL}...`);
    const user = await prisma.user.findUnique({
        where: { email: EMAIL },
        include: { languageProgress: true }
    });

    if (!user) {
        console.log("User not found.");
        return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);
    console.log("Current Progress:", user.languageProgress);

    // Reset XP for all languages to 0
    // We update the UserLanguageProgress table
    const result = await prisma.userLanguageProgress.updateMany({
        where: { userId: user.id },
        data: {
            xp: 0,
            level: 'A1', // Optional: reset level too if needed
            streak: 0 // Optional: reset streak
        }
    });

    console.log(`Reset XP for ${result.count} language records.`);

    const updated = await prisma.user.findUnique({
        where: { email: EMAIL },
        include: { languageProgress: true }
    });
    console.log("New Progress:", updated.languageProgress);

    // Also reset daily quests if present ??
    // Not requested but might be useful.
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

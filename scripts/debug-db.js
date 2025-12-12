const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DB Debug ---');

    const users = await prisma.user.findMany({
        select: { id: true, email: true, learningLanguage: true, name: true }
    });
    console.log("Users:", JSON.stringify(users, null, 2));

    const scenarios = await prisma.scenario.findMany({
        select: { id: true, title: true, language: true, level: true }
    });
    console.log("Scenarios:", JSON.stringify(scenarios, null, 2));

    const counts = await prisma.scenario.groupBy({
        by: ['language'],
        _count: { id: true }
    });
    console.log("Scenario Counts by Language:", counts);

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

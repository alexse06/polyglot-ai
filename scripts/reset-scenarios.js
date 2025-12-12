const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all scenarios...');
    // Delete UserScenarioProgress first due to FK
    await prisma.userScenarioProgress.deleteMany({});
    await prisma.scenario.deleteMany({});
    console.log('All scenarios deleted. They will be re-seeded on next visit.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

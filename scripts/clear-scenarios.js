
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Deleting all scenarios to force re-seed...");
    await prisma.userScenarioProgress.deleteMany({});
    await prisma.scenario.deleteMany({});
    console.log("Done.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

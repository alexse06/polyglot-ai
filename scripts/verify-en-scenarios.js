const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying EN Scenarios ---');
    const scenarios = await prisma.scenario.findMany({
        where: { language: 'EN' }
    });
    console.log(JSON.stringify(scenarios, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

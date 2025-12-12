
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.scenario.count();
    console.log(`Scenario count: ${count}`);
    const scenarios = await prisma.scenario.findMany();
    console.log(JSON.stringify(scenarios, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

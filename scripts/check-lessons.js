const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Lessons ---');
    const countES = await prisma.lesson.count({ where: { language: 'ES' } });
    const countEN = await prisma.lesson.count({ where: { language: 'EN' } });
    console.log(`ES Lessons: ${countES}`);
    console.log(`EN Lessons: ${countEN}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

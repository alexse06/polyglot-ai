const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Inspecting Lesson Content JSON ---');

    // Fetch a few English lessons
    const lessons = await prisma.lesson.findMany({
        where: { language: 'EN' },
        take: 3,
        orderBy: { order: 'asc' }
    });

    for (const l of lessons) {
        console.log(`\n=== Lesson: ${l.title} (Level ${l.level}) ===`);
        try {
            const content = JSON.parse(l.content);
            console.log(JSON.stringify(content, null, 2));
        } catch (e) {
            console.error("INVALID JSON:", l.content);
        }
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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Lessons ---');

    // Fetch a sample from ES and EN
    const lessonsES = await prisma.lesson.findMany({ where: { language: 'ES' }, take: 2 });
    const lessonsEN = await prisma.lesson.findMany({ where: { language: 'EN' }, take: 2 });

    console.log("ES Sample:", JSON.stringify(lessonsES, null, 2));
    console.log("EN Sample:", JSON.stringify(lessonsEN, null, 2));

    // Check for null content
    const badLessons = await prisma.lesson.findMany({
        where: {
            OR: [
                { content: { equals: "" } },
                { title: { equals: "" } }
            ]
        }
    });

    if (badLessons.length > 0) {
        console.error("Found lessons with empty content/title:", badLessons.length);
        console.log(badLessons.map(l => l.id));
    } else {
        console.log("No obviously bad lessons found.");
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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- RESETTING LESSONS ---');

    // 1. Delete Progress
    const deletedProgress = await prisma.userLessonProgress.deleteMany({});
    console.log(`Deleted ${deletedProgress.count} progress records.`);

    // 2. Delete Lessons
    const deletedLessons = await prisma.lesson.deleteMany({});
    console.log(`Deleted ${deletedLessons.count} lessons.`);

    console.log("--- Lessons Wiped. They will be re-seeded on next visit. ---");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

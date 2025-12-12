const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting lesson reset process...");

    // Check count before
    const countBefore = await prisma.lesson.count();
    console.log(`Current lesson count: ${countBefore}`);

    if (countBefore === 0) {
        console.log("No lessons to delete.");
    } else {
        console.log("Deleting all lessons...");
        // Deleting lessons will cascade delete UserLessonProgress due to schema configuration
        const { count } = await prisma.lesson.deleteMany({});
        console.log(`Successfully deleted ${count} lessons.`);
    }

    console.log("Lesson table is now empty.");
    console.log("Next visit to /learn will automatically seed fresh lessons with corrected content logic.");
}

main()
    .catch(e => {
        console.error("Error during reset:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

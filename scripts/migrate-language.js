
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Migrating users with NULL learningLanguage to 'EN'...");

    const result = await prisma.user.updateMany({
        where: {
            learningLanguage: 'ES'
        },
        data: {
            learningLanguage: 'EN'
        }
    });

    console.log(`Updated ${result.count} users to 'EN'.`);

    // Also verify no other users are stuck on null by printing count
    const remaining = await prisma.user.count({
        where: { learningLanguage: null }
    });
    console.log(`Remaining null users: ${remaining}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

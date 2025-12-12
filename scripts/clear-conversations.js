const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Cleaning All Conversations ---');
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    console.log("Deleted all conversations and messages.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

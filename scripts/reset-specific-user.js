const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = "sempere.alexis@gmail.com";

async function main() {
    console.log(`Searching for user with email: ${EMAIL}...`);
    const user = await prisma.user.findUnique({
        where: { email: EMAIL }
    });

    if (!user) {
        console.log("User not found.");
        return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);

    // 1. Delete Conversations manually (no Cascade in schema)
    console.log("Deleting conversations...");
    const { count: convoCount } = await prisma.conversation.deleteMany({
        where: { userId: user.id }
    });
    console.log(`Deleted ${convoCount} conversations.`);

    // 2. Delete User (Cascades to Progress, Lessons, Scenarios, Flashcards, Pronunciation)
    console.log("Deleting user profile...");
    await prisma.user.delete({
        where: { id: user.id }
    });

    console.log("User successfully deleted. You can now re-register or login (which will create a fresh account).");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

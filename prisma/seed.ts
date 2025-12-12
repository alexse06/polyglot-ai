import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists. Skipping creation.');
        return;
    }

    // Generate secure credentials
    const password = crypto.randomBytes(12).toString('hex'); // 24 chars random password
    const email = 'admin@mycanadarp.fr';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: 'System Administrator',
            role: 'ADMIN',
        }
    });

    // Create Admin Progress
    await prisma.userLanguageProgress.create({
        data: {
            userId: admin.id,
            language: 'ES',
            level: 'C2',
            xp: 999999
        }
    });

    await prisma.userLanguageProgress.create({
        data: {
            userId: admin.id,
            language: 'EN',
            level: 'C2',
            xp: 999999
        }
    });

    console.log({ admin });
    console.log('------------------------------------------------');
    console.log('🚀 Admin User Created Successfully');
    console.log('------------------------------------------------');
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('------------------------------------------------');
    console.log('⚠️  SAVE THIS PASSWORD NOW. IT WILL NOT BE SHOWN AGAIN.');
    console.log('------------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

'use server'

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/app/[locale]/profile/actions';

// Middleware check helper
async function ensureAdmin() {
    const currentUser = await getUserProfile();
    if (!currentUser || currentUser.role !== 'ADMIN') {
        throw new Error("Unauthorized: Access restricted to Administrators.");
    }
    return currentUser;
}

export async function getUsers(page: number = 1, pageSize: number = 20, search: string = "") {
    await ensureAdmin();

    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search } }, // Case insensitive usually handled by DB, Prisma SQLite is mixed but we try
            { email: { contains: search } }
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                languageProgress: {
                    select: {
                        language: true,
                        level: true,
                        xp: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        total,
        totalPages: Math.ceil(total / pageSize)
    };
}

export async function updateUser(userId: string, data: { role?: string; level?: string; name?: string }) {
    await ensureAdmin();

    try {
        const { level, ...userData } = data;

        // Update User fields
        await prisma.user.update({
            where: { id: userId },
            data: userData
        });

        // Update Level if provided (defaults to updating ES for now, or fetch user's preference)
        if (level) {
            // We'll update ALL progress records or just the main one. 
            // Let's assume we update the user's CURRENT learning language progress.
            const user = await prisma.user.findUnique({ where: { id: userId } });
            const lang = user?.learningLanguage || "ES";

            await prisma.userLanguageProgress.upsert({
                where: { userId_language: { userId, language: lang } },
                update: { level },
                create: { userId, language: lang, level }
            });
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (e) {
        console.error("Failed to update user:", e);
        return { success: false, error: "Database error" };
    }
}

export async function deleteUser(userId: string) {
    const admin = await ensureAdmin();

    if (admin.id === userId) {
        return { success: false, error: "You cannot delete your own admin account." };
    }

    try {
        // Cascade delete is handled by Prisma Schema if configured, 
        // but explicit check is good.
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (e) {
        console.error("Failed to delete user:", e);
        return { success: false, error: "Database error" };
    }
}

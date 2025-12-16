import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function getUserId() {
    const session = await auth();
    return session?.user?.id;
}

export async function getOrCreateUser() {
    const session = await auth();
    if (!session?.user?.email) return null;

    // Fetch fresh user data from DB to get relations like languageProgress
    // Session user might be stale or minimal
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { languageProgress: true }
    });

    return user;
}

export async function logout() {
    // Handled by client side signOut usually, or server side signOut
    // but for server actions we can't easily redirect with signOut inside action sometimes
    // Better to use import { signOut } from '@/auth'
}

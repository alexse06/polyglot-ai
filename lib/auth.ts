import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';

const COOKIE_NAME = 'spanish_app_user_id';

export async function getUserId() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;
    return userId;
}

export async function getOrCreateUser() {
    try {
        const cookieStore = await cookies();
        let userId = cookieStore.get(COOKIE_NAME)?.value;

        if (!userId) return null;

        let user = await prisma.user.findUnique({
            where: { id: userId },
            include: { languageProgress: true }
        });
        return user;
    } catch (e) {
        // During build or static generation where cookies() might fail
        return null;
    }
}

export async function createUserSession() {
    const userId = uuidv4();
    return userId;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

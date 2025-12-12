'use server'

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function register(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (!email || !password || !name) {
        return { error: 'Tous les champs sont requis.' };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { error: 'Cet email est déjà utilisé.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if there is a temporary user session (from placement test)
    const cookieStore = await cookies();
    const tempUserId = cookieStore.get('spanish_app_user_id')?.value;

    let user;

    if (tempUserId) {
        // Build query to see if this temp user exists and is claimable (no email yet)
        const tempUser = await prisma.user.findUnique({
            where: { id: tempUserId }
        });

        if (tempUser && !tempUser.email) {
            // Upgrade the temp user
            user = await prisma.user.update({
                where: { id: tempUserId },
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    // Keep existing level/xp from placement
                }
            });
        }
    }

    if (!user) {
        // No claimable temp user, create new one
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            }
        });

        // Initialize progress for default language (Spanish)
        await prisma.userLanguageProgress.create({
            data: {
                userId: user.id,
                language: 'ES',
                level: 'A1',
                xp: 0
            }
        });

        // Initialize progress for English too (optional, but good for polyglot)
        await prisma.userLanguageProgress.create({
            data: {
                userId: user.id,
                language: 'EN',
                level: 'A1',
                xp: 0
            }
        });
    }

    // Using the same cookie name as before for compatibility, but now backed by a real user
    cookieStore.set('spanish_app_user_id', user.id, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    redirect('/dashboard');
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email et mot de passe requis.' };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
        return { error: 'Identifiants invalides.' };
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return { error: 'Identifiants invalides.' };
    }

    const cookieStore = await cookies();
    cookieStore.set('spanish_app_user_id', user.id, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    if (user.role === 'ADMIN') {
        redirect('/admin');
    }

    redirect('/dashboard');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('spanish_app_user_id');
    redirect('/');
}

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en'
});

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // 1. NextAuth Protection Logic
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;

    // Allow public assets
    const isPublicAsset = nextUrl.pathname.startsWith('/_next') ||
        nextUrl.pathname.startsWith('/images') ||
        nextUrl.pathname.startsWith('/public') ||
        nextUrl.pathname.includes('favicon.ico');

    if (isPublicAsset) return;

    // Admin Protection
    if (nextUrl.pathname.includes('/admin')) {
        if (!isLoggedIn || (req.auth?.user as any)?.role !== 'ADMIN') {
            return Response.redirect(new URL('/login', nextUrl));
        }
    }

    // 2. Internationalization (next-intl)
    const response = intlMiddleware(req);

    // Security Hardening: Force Secure attribute on cookies set by next-intl
    const setCookie = response.headers.get('set-cookie');
    if (setCookie && !setCookie.includes('Secure') && process.env.NODE_ENV === 'production') {
        response.headers.set('set-cookie', setCookie.replace(/; path=\//gi, '; path=/; Secure'));
    }

    return response;
});

export const config = {
    // Matcher ignoring internal paths, static files, and PWA assets
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|service-worker.js|workbox-.*.js).*)']
};

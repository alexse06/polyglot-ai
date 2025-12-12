import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'es', 'fr'],

    // Used when no locale matches
    defaultLocale: 'en'
});

export function middleware(request: NextRequest) {
    // Check for maintenance mode
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

    // Allow bypassing maintenance for the maintenance page itself and static assets
    if (
        isMaintenanceMode &&
        !request.nextUrl.pathname.startsWith('/maintenance') &&
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.startsWith('/images') &&
        !request.nextUrl.pathname.startsWith('/icons') &&
        !request.nextUrl.pathname.startsWith('/public') &&
        !request.nextUrl.pathname.includes('favicon.ico')
    ) {
        return NextResponse.rewrite(new URL('/maintenance', request.url));
    }

    // Admin Route Protection (Check path without locale or with locale)
    // Simple check: if path contains /admin
    if (request.nextUrl.pathname.includes('/admin')) {
        const userId = request.cookies.get('spanish_app_user_id')?.value;
        if (!userId) {
            // Determine locale to redirect to login? For now just generic login
            // Ideally we need to preserve locale.
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

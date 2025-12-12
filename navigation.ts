import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'es', 'fr'] as const;

export const routing = defineRouting({
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
    localePrefix: 'always'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

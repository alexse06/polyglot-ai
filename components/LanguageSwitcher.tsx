'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (newLocale: string) => {
        // Explicitly set cookie to ensure persistence across sessions/refreshes
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // usePathname from @/navigation returns the path WITHOUT the locale prefix
        // router.replace handles adding it back automatically
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <select
                value={locale}
                onChange={(e) => handleLocaleChange(e.target.value)}
                className="bg-transparent text-gray-300 text-sm font-semibold focus:outline-none cursor-pointer"
            >
                <option value="fr" className="bg-gray-900 text-white">Français</option>
                <option value="en" className="bg-gray-900 text-white">English</option>
                <option value="es" className="bg-gray-900 text-white">Español</option>
            </select>
        </div>
    );
}

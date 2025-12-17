import { getOrCreateUser } from '@/lib/auth';
import { getTranslations, getLocale } from 'next-intl/server';
import LiveTranslatorClient from './LiveTranslatorClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function TranslatorPage() {
    const user = await getOrCreateUser();
    const t = await getTranslations('Live');

    // Default to EN if not set
    const userLang = user?.learningLanguage || 'EN';

    // Use interface locale as "Native"
    const interfaceLang = await getLocale();
    const nativeLang = interfaceLang.toUpperCase();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Minimal Header */}
            <header className="p-6 flex items-center gap-4 z-10">
                <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft />
                </Link>
                <h1 className="font-bold text-lg">Universal Translator</h1>
            </header>

            {/* Client Component for Audio/WebSocket */}
            <main className="flex-1 flex flex-col">
                <LiveTranslatorClient
                    targetLang={userLang}
                    nativeLang={nativeLang}
                    userName={user?.name || 'User'}
                />
            </main>
        </div>
    );
}

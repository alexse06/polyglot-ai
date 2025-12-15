import { getTranslations } from 'next-intl/server';
import LiveCoachClient from '@/components/LiveCoachClient';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Dashboard');
    const tLive = await getTranslations('Live');
    const apiKey = process.env.GEMINI_API_KEY || "";
    const cookieStore = await cookies();
    const learningLanguageCookie = cookieStore.get('learningLanguage');
    const learningLanguage = learningLanguageCookie?.value || 'ES';

    console.log(`[LivePage] Locale: ${locale}, Cookie: ${learningLanguageCookie?.value}, Resolved: ${learningLanguage}`);

    const sourceLanguage = locale || 'en';

    if (!apiKey) {
        console.warn("API Key is missing on server!");
    }

    const uiLabels = {
        choose: tLive('choose'),
        tutor: tLive('tutor'),
        barista: tLive('barista'),
        doctor: tLive('doctor')
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                    {t('cards.live.title')}
                </h1>
                <p className="text-gray-400">
                    {t('cards.live.desc')}
                </p>
            </div>

            <LiveCoachClient
                apiKey={apiKey}
                targetLang={learningLanguage}
                sourceLang={sourceLanguage}
                uiLabels={uiLabels}
            />
        </div>
    );
}

import { getOrCreateUser } from '@/lib/auth';
import { redirect } from '@/navigation';
import LiveCoachClient from '@/components/LiveCoachClient';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';
import { getConfig } from '@/lib/languageConfig';

export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const user = await getOrCreateUser();

    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const learningLanguage = user.learningLanguage || 'ES';
    const config = getConfig(learningLanguage);

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8 pb-20 flex flex-col">
            <header className="max-w-4xl mx-auto w-full mb-8 flex items-center gap-4 z-10">
                <Link href="/dashboard" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">
                    Live Coach
                </h1>
                <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400 border border-gray-700 ml-auto">
                    {config.label}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto z-10">
                <LiveCoachClient
                    language={learningLanguage}
                    targetLanguageName={config.aiPrompt.targetLanguage}
                    userNativeLanguageName={locale === 'fr' ? 'French' : locale === 'es' ? 'Spanish' : 'English'}
                    initialMessage={
                        learningLanguage === 'ES' ? "¡Hola! Soy tu tutor de español. ¡Practiquemos!" :
                            learningLanguage === 'FR' ? "Bonjour ! Je suis votre tuteur de français. On pratique ?" :
                                learningLanguage === 'DE' ? "Hallo! Ich bin dein Deutschlehrer. Lass uns üben!" :
                                    learningLanguage === 'IT' ? "Ciao! Sono il tuo tutor di italiano. Esercitiamoci!" :
                                        "Hello! I am your language tutor. Let's practice!"
                    }
                    apiKey={process.env.GEMINI_API_KEY || ''}
                />
            </main>

            {/* Background Effect */}
            <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black pointer-events-none -z-0"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-0"></div>
        </div>
    );
}

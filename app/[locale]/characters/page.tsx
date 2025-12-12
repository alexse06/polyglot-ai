import { getOrCreateUser } from '@/lib/auth';
import { redirect } from '@/navigation';
import { getLanguageCharacters } from './actions';
import CharacterLearningClient from './CharacterLearningClient';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';

export default async function CharactersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const user = await getOrCreateUser();

    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const learningLanguage = user.learningLanguage || 'ES';
    const characterData = await getLanguageCharacters(learningLanguage);

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8 pb-20">
            <header className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                    Symboles & Écriture
                </h1>
                <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400 border border-gray-700 ml-auto">
                    {learningLanguage}
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {characterData ? (
                    <CharacterLearningClient data={characterData} lang={learningLanguage} />
                ) : (
                    <div className="p-12 text-center text-gray-500 bg-gray-900 rounded-3xl border border-gray-800 border-dashed">
                        <p>Impossible de charger les caractères pour cette langue.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

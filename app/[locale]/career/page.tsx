import { getOrCreateUser } from '@/lib/auth';
import { redirect } from '@/navigation';
import CareerPageClient from './CareerPageClient';

export default async function CareerPagePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const user = await getOrCreateUser();

    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const userNativeLanguageName = locale === 'fr' ? 'French' : locale === 'es' ? 'Spanish' : 'English';

    const userTargetLanguage = user.learningLanguage || 'EN';

    return (
        <CareerPageClient
            apiKey={process.env.GEMINI_API_KEY || ''}
            userNativeLanguageName={userNativeLanguageName}
            userTargetLanguage={userTargetLanguage}
        />
    );
}

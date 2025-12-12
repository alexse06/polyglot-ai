import { getOrCreateUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/navigation';
import { BookOpen, Mic, Sparkles, Trophy, LogOut, BarChart3, User, Flame, MessageCircle, ArrowRight, Brain } from 'lucide-react';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { getTranslations, getLocale } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import LearningLanguageToggler from '@/components/LearningLanguageToggler';
import { RecommendedAction } from '@/components/RecommendedAction';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Prevent static generation as it relies on cookies

export default async function DashboardPage() {
    const user = await getOrCreateUser();
    const t = await getTranslations('Dashboard');
    const locale = await getLocale();

    if (!user) {
        // Rediriger vers le placement (standard next redirect)
        redirect(`/${locale}/placement`);
    }

    if (user?.role === 'ADMIN') {
        redirect(`/${locale}/admin`);
    }

    // Get progressfor the current learning language, or default to 0
    const progress = user.languageProgress.find((p: any) => p.language === user.learningLanguage) || { xp: 0, streak: 0, level: 'A1' };

    // Fetch basic stats for recommendation
    const completedLessonsCount = await prisma.userLessonProgress.count({
        where: { userId: user.id, completed: true }
    });

    // Find last completed lesson title if any
    const lastProgress = await prisma.userLessonProgress.findFirst({
        where: { userId: user.id, completed: true },
        orderBy: { completedAt: 'desc' },
        include: { lesson: true }
    });

    const lastLessonTitle = lastProgress?.lesson.title || "Introduction";

    return (
        <div className="min-h-screen text-white pb-20">
            {/* Top Bar */}
            <header className="p-4 flex justify-between items-center sticky top-0 glass-panel z-10 mx-4 mt-4 rounded-2xl mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">AI</div>
                    <span className="font-bold text-lg hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Polyglot.ai</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:block">
                        <LanguageSwitcher />
                    </div>
                    <LearningLanguageToggler currentLanguage={user.learningLanguage || 'EN'} />

                    <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
                        <Flame className="text-orange-500" size={18} fill="currentColor" />
                        <span className="font-bold text-orange-500 text-sm sm:text-base">{progress.streak}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
                        <Trophy className="text-yellow-500" size={18} />
                        <span className="font-bold text-yellow-500">{progress.xp} XP</span>
                    </div>
                    <Link href="/characters" className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition flex" title="Alphabet">
                        <BookOpen size={20} />
                    </Link>
                    <Link href="/profile">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold border-2 border-gray-800 hover:border-yellow-500 transition cursor-pointer">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">

                {/* Recommended Action & Welcome */}
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">
                                {user.learningLanguage === 'ES' ? t('welcome.hola') : t('welcome.hello')} {user.name}! 👋
                            </h1>
                            <p className="text-gray-400">{t('welcome.ready')}</p>
                        </div>
                    </div>

                    <RecommendedAction
                        userName={user.name || 'User'}
                        languageLabel={user.learningLanguage || 'EN'}
                        streak={progress.streak || 0}
                        lastLessonTitle={lastLessonTitle}
                        lessonCount={completedLessonsCount}
                    />
                </section>

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DashboardCard
                        href="/chat"
                        title={t('cards.chat.title')}
                        description={t('cards.chat.desc')}
                        icon={MessageCircle}
                        iconColorClass="text-yellow-500"
                        iconBgClass="bg-yellow-500/10"
                        borderColorClass="group-hover:border-yellow-500/50"
                        badgeText={t('cards.chat.badge')}
                        badgeColorClass="bg-yellow-500 text-black"
                        footerText={t('start')}
                        footerIcon={ArrowRight}
                    />


                    <DashboardCard
                        href="/scenarios"
                        title={t('cards.scenarios.title')}
                        description={t('cards.scenarios.desc')}
                        icon={Sparkles}
                        iconColorClass="text-purple-500"
                        iconBgClass="bg-purple-500/10"
                        borderColorClass="hover:border-purple-500/50"
                    />

                    <DashboardCard
                        href="/flashcards"
                        title={t('cards.flashcards.title')}
                        description={t('cards.flashcards.desc')}
                        icon={Brain}
                        iconColorClass="text-green-500"
                        iconBgClass="bg-green-500/10"
                        borderColorClass="hover:border-green-500/50"
                    />



                    <DashboardCard
                        href="/characters"
                        title={t('cards.characters.title')}
                        description={t('cards.characters.desc')}
                        icon={BookOpen}
                        iconColorClass="text-indigo-500"
                        iconBgClass="bg-indigo-500/10"
                        borderColorClass="hover:border-indigo-500/50"
                    />

                    <DashboardCard
                        href="/learn"
                        title={t('cards.lessons.title')}
                        description={t('cards.lessons.desc')}
                        icon={BookOpen}
                        iconColorClass="text-blue-400"
                        iconBgClass="bg-blue-500/10"
                        borderColorClass="hover:border-blue-500"
                    />

                    <DashboardCard
                        href="/pronounce"
                        title={t('cards.pronounce.title')}
                        description={t('cards.pronounce.desc')}
                        icon={Mic}
                        iconColorClass="text-pink-400"
                        iconBgClass="bg-pink-500/10"
                        borderColorClass="hover:border-pink-500"
                    />

                    <DashboardCard
                        href="/profile"
                        title={t('cards.progress.title')}
                        description={t('cards.progress.desc')}
                        icon={BarChart3}
                        iconColorClass="text-green-500"
                        iconBgClass="bg-green-500/10"
                        borderColorClass="hover:border-green-500/50"
                    />
                </div>

            </main>
        </div>
    );
}

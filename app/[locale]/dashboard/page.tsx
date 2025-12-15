import { getOrCreateUser } from '@/lib/auth';
import { redirect } from '@/navigation';
import { Link } from '@/navigation';
import { Play, MessageCircle, Trophy, Target, Calendar, Flame, Lock, BookOpen, Mic, ArrowRight, Sparkles, Brain, BarChart3, User, Briefcase } from 'lucide-react';
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
        redirect({ href: '/placement', locale });
        return null;
    }

    if (user?.role === 'ADMIN') {
        redirect({ href: '/admin', locale });
        return null;
    }

    if (!user || !user.languageProgress) {
        return null;
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
        <div className="min-h-screen text-white pb-20 pt-6 px-4 sm:pt-8 sm:px-6">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 sm:mb-12">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20 rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-yellow-400 to-orange-600 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transform rotate-3 border border-yellow-300/30 shadow-xl">
                            <span className="text-xl sm:text-2xl font-black text-white">AI</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                            <span className="hidden sm:inline">Español </span>AI
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-400 font-medium hidden sm:block">Master Spanish</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <LanguageSwitcher />

                    {/* Compact Mobile Language Toggler */}
                    <LearningLanguageToggler currentLanguage={user.learningLanguage || 'EN'} />

                    {/* Streak Badge - Compact on mobile */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-900/80 backdrop-blur-md px-2.5 py-1.5 sm:px-3 rounded-full border border-gray-800/50">
                        <Flame className="text-orange-500 w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" />
                        <span className="font-bold text-orange-500 text-sm">{progress.streak}</span>
                    </div>

                    {/* XP Badge - Hide on mobile to save space */}
                    <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-800/50">
                        <Trophy className="text-yellow-500 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        <span className="font-bold text-yellow-500 text-sm">{progress.xp} XP</span>
                    </div>

                    <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>

                    <Link href="/profile">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center hover:border-yellow-500/50 transition shadow-lg relative group">
                            <div className="absolute inset-0 bg-yellow-500/10 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <User className="text-gray-300 w-5 h-5 sm:w-6 sm:h-6" />
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
                        href="/live"
                        title={t('cards.live.title')}
                        description={t('cards.live.desc')}
                        icon={Sparkles}
                        iconColorClass="text-red-500"
                        iconBgClass="bg-red-500/10"
                        borderColorClass="group-hover:border-red-500/50"
                        footerText={t('start')}
                        footerIcon={ArrowRight}
                        badgeText={t('cards.live.badge')}
                        badgeColorClass="bg-red-500 text-white"
                    />

                    <DashboardCard
                        href="/career"
                        title={t('cards.career.title')}
                        description={t('cards.career.desc')}
                        icon={Briefcase}
                        iconColorClass="text-blue-500"
                        iconBgClass="bg-blue-500/10"
                        borderColorClass="group-hover:border-blue-500/50"
                        footerText={t('start')}
                        footerIcon={ArrowRight}
                        badgeText="Beta"
                        badgeColorClass="bg-blue-500 text-white"
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

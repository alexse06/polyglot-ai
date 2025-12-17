import { getOrCreateUser } from '@/lib/auth';
import { redirect } from '@/navigation';
import { Link } from '@/navigation';
import { Play, MessageCircle, Trophy, Target, Calendar, Flame, Lock, BookOpen, Mic, ArrowRight, Sparkles, Brain, BarChart3, User, Briefcase, Zap, GraduationCap, Globe, Phone } from 'lucide-react';
import { BentoCard } from '@/components/ui/BentoCard';
import { getTranslations, getLocale } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import LearningLanguageToggler from '@/components/LearningLanguageToggler';
import { RecommendedAction } from '@/components/RecommendedAction';
import { prisma } from '@/lib/db';
import { AnimatedGrid } from '@/components/ui/AnimatedGrid';
import { AnimatedItem } from '@/components/ui/AnimatedItem';
import PodcastCard from './PodcastCard';


export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const user = await getOrCreateUser();
    const t = await getTranslations('Dashboard');
    const locale = await getLocale();

    if (!user) {
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

    const progress = user.languageProgress.find((p: any) => p.language === user.learningLanguage) || { xp: 0, streak: 0, level: 'A1' };

    const completedLessonsCount = await prisma.userLessonProgress.count({
        where: {
            userId: user.id,
            completed: true,
            lesson: {
                language: user.learningLanguage // Filter by current target language
            }
        }
    });

    const lastProgress = await prisma.userLessonProgress.findFirst({
        where: {
            userId: user.id,
            completed: true,
            lesson: {
                language: user.learningLanguage // Filter by current target language
            }
        },
        orderBy: { completedAt: 'desc' },
        include: { lesson: true }
    });

    const lastLessonTitle = lastProgress?.lesson.title || t('intro');

    return (
        <div className="min-h-screen text-white pb-20 pt-8 px-4 md:pt-12 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-2xl">
                            <span className="text-2xl sm:text-3xl">🌍</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Polyglot AI
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-xs font-mono">BETA</span>
                            <span>{user.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-auto p-1.5 sm:p-2 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <LanguageSwitcher />
                    <div>
                        <LearningLanguageToggler currentLanguage={user.learningLanguage || 'EN'} />
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>

                    <div className="flex items-center gap-3 px-2">
                        <div className="flex items-center gap-1.5">
                            <Flame className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                            <span className="font-bold text-orange-500 text-sm sm:text-base">{progress.streak}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5">
                            <Zap className="text-yellow-400 w-5 h-5" fill="currentColor" />
                            <span className="font-bold text-yellow-400">{progress.xp}</span>
                        </div>
                    </div>

                    <Link href="/profile" className="ml-1 sm:ml-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center hover:scale-105 transition shadow-lg shadow-indigo-500/20 text-white">
                            <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Welcome & Recommended Action */}
            <section className="mb-10">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-500 tracking-tight">
                            {user.learningLanguage === 'ES' ? t('welcome.hola') : t('welcome.hello')} {user.name?.split(' ')[0]}
                        </h2>
                        <p className="text-gray-400 mt-3 font-medium text-lg md:text-xl">
                            {t('welcome.ready')}
                        </p>
                    </div>
                </div>

                <RecommendedAction
                    userName={user.name || 'User'}
                    languageLabel={user.learningLanguage || 'EN'}
                    streak={progress.streak || 0}
                    lastLessonTitle={lastLessonTitle}
                    lessonCount={completedLessonsCount}
                    translations={{
                        label: t('reco.label'),
                        start: {
                            title: t('reco.start.title'),
                            desc: t('reco.start.desc'),
                            action: t('reco.start.action')
                        },
                        continue: {
                            title: t('reco.continue.title'),
                            desc: t('reco.continue.desc'),
                            action: t('reco.continue.action')
                        },
                        resume: {
                            title: t('reco.resume.title'),
                            desc: t('reco.resume.desc'),
                            action: t('reco.resume.action')
                        }
                    }}
                />
            </section>

            {/* Main Bento Grid */}
            <AnimatedGrid className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

                {/* --- HEADER SECTION (Hero) --- */}

                {/* 1. Live Coach (2x2) - The Main Event */}
                <BentoCard
                    href="/live"
                    title={t('cards.live.title')}
                    description={t('cards.live.desc')}
                    icon={<Mic className="text-red-400 w-6 h-6" />}
                    className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-red-600/20 to-orange-600/20 border-red-500/20"
                    iconBgClass="bg-red-500/20"
                    gradientClass="hover:border-red-500/50"
                    badgeText={t('cards.live.badge')}
                    footerText={t('startSession')}
                    headerImage="/images/dashboard/live.png"
                />

                {/* 2. Chrono Call (2x1) - New Feature */}
                <BentoCard
                    href="/chrono"
                    title={t('cards.chrono.title')}
                    description={t('cards.chrono.desc')}
                    icon={<Phone className="text-green-400 w-6 h-6" />}
                    className="md:col-span-2 md:row-span-1 bg-green-900/10 border-green-500/30"
                    iconBgClass="bg-green-500/20"
                    gradientClass="hover:border-green-500/50"
                    badgeText="NEW"
                    headerImage="/images/dashboard/live.png" // Using live placeholder until chrono custom img
                />

                {/* 3. Daily Podcast (2x1) - Daily Habit */}
                <AnimatedItem className="md:col-span-2 md:row-span-1">
                    <PodcastCard
                        language={user.learningLanguage || 'EN'}
                        translations={{
                            title: t('cards.podcast.title'),
                            briefing: t('cards.podcast.briefing'),
                            generating: t('cards.podcast.generating'),
                            listen: t('cards.podcast.listen'),
                            pause: t('cards.podcast.pause')
                        }}
                    />
                </AnimatedItem>


                {/* --- LEARNING ROW (4x1) --- */}

                {/* 4. Lessons */}
                <BentoCard
                    href="/learn"
                    title={t('cards.lessons.title')}
                    description={t('cards.lessons.desc')}
                    icon={<GraduationCap className="text-emerald-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1 bg-emerald-500/5"
                    iconBgClass="bg-emerald-500/20"
                    headerImage="/images/dashboard/lessons.png"
                />

                {/* 5. Flashcards */}
                <BentoCard
                    href="/flashcards"
                    title={t('cards.flashcards.title')}
                    description={t('cards.flashcards.desc')}
                    icon={<Brain className="text-pink-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1"
                    iconBgClass="bg-pink-500/20"
                    headerImage="/images/dashboard/flashcards.png"
                />

                {/* 6. Pronunciation */}
                <BentoCard
                    href="/pronounce"
                    title={t('cards.pronounce.title')}
                    description={t('cards.pronounce.desc')}
                    icon={<Zap className="text-cyan-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1"
                    iconBgClass="bg-cyan-500/20"
                    headerImage="/images/dashboard/pronounce.png"
                />

                {/* 7. AI Chat */}
                <BentoCard
                    href="/chat"
                    title={t('cards.chat.title')}
                    description={t('cards.chat.desc')}
                    icon={<MessageCircle className="text-yellow-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1 bg-yellow-500/5"
                    iconBgClass="bg-yellow-500/20"
                    headerImage="/images/dashboard/chat.png"
                />


                {/* --- ADVANCED / TOOLS ROW (4x1) --- */}

                {/* 8. Scenarios */}
                <BentoCard
                    href="/scenarios"
                    title={t('cards.scenarios.title')}
                    description={t('cards.scenarios.desc')}
                    icon={<Sparkles className="text-purple-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1 bg-purple-500/5"
                    iconBgClass="bg-purple-500/20"
                    headerImage="/images/dashboard/scenarios.png"
                />

                {/* 9. Career Coach */}
                <BentoCard
                    href="/career"
                    title={t('cards.career.title')}
                    description={t('cards.career.desc')}
                    icon={<Briefcase className="text-blue-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1 bg-blue-500/5"
                    iconBgClass="bg-blue-500/20"
                    badgeText="BETA"
                    headerImage="/images/dashboard/career.png"
                />

                {/* 10. Translator */}
                <BentoCard
                    href="/translator"
                    title={t('cards.translator.title')}
                    description={t('cards.translator.desc')}
                    icon={<Globe className="text-indigo-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1 bg-indigo-500/5"
                    iconBgClass="bg-indigo-500/20"
                    headerImage="/images/dashboard/translator.png"
                    badgeText="NEW"
                />

                {/* 11. Voice Cloning */}
                <BentoCard
                    href="/imitate"
                    title={t('cards.imitate.title')}
                    description={t('cards.imitate.desc')}
                    icon={<User className="text-purple-400 w-6 h-6" />}
                    className="md:col-span-1 md:row-span-1 bg-purple-500/10 border-purple-500/30"
                    iconBgClass="bg-purple-500/20"
                    gradientClass="hover:border-purple-500/50"
                    badgeText="FUN"
                    headerImage="/images/dashboard/career.png" // Placeholder
                />
            </AnimatedGrid>

            {/* Grid Decoration */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>
            <div className="fixed inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent pointer-events-none -z-10"></div>
        </div>
    );
}

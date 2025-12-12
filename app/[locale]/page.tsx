import Link from "next/link";
import { BookOpen, MessageSquare, Award, ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('Landing');

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-yellow-500 selection:text-black">
      {/* Navbar */}
      <nav className="border-b border-gray-800 backdrop-blur-md fixed w-full z-10 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                Polyglot.ai
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <LanguageSwitcher />
              <Link href="/login">
                <button className="text-gray-300 hover:text-white px-4 py-2 text-sm font-semibold transition">
                  {t('nav.login')}
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition">
                  {t('nav.register')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium">
            {t('hero.poweredBy')}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8" dangerouslySetInnerHTML={{ __html: t.raw('hero.title') }} />

          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            {t('hero.subtitle')}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/placement">
              <button className="group bg-yellow-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition flex items-center gap-2">
                {t('hero.cta')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px]"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-yellow-500" />}
              title={t('features.conversation.title')}
              description={t('features.conversation.description')}
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-orange-500" />}
              title={t('features.lessons.title')}
              description={t('features.lessons.description')}
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 text-purple-500" />}
              title={t('features.gamification.title')}
              description={t('features.gamification.description')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl hover:border-yellow-500/50 transition duration-300">
      <div className="mb-4 bg-gray-900 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

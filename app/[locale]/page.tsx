import Link from "next/link";
import { BookOpen, MessageSquare, Award, ArrowRight, Star, Globe, Zap, Cpu, Play, Sparkles } from "lucide-react";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { motion } from 'framer-motion';

export default function Home() {
  const t = useTranslations('Landing');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white overflow-x-hidden font-sans">

      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-900/40 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition duration-300">
              <Cpu size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition">
              MyCanadaRP
            </span>
          </div>

          <div className="flex gap-6 items-center">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition">
              {t('nav.login')}
            </Link>
            <Link href="/register">
              <button className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5">
                {t('nav.register')}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">{t('hero.poweredBy')}</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] text-balance" dangerouslySetInnerHTML={{ __html: t.raw('hero.title') }} />
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed text-balance">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/placement">
              <button className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(79,70,229,0.4)] flex items-center gap-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition duration-300"></div>
                {t('hero.cta')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#features" className="px-8 py-4 rounded-2xl text-gray-400 font-bold hover:text-white hover:bg-white/5 transition flex items-center gap-2">
              <Play size={18} fill="currentColor" className="opacity-50" /> Demo Video
            </a>
          </div>

          {/* Floating Avatar Strip */}
          <div className="pt-12 flex items-center justify-center gap-[-12px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-12 h-12 rounded-full border-4 border-black bg-gray-800 relative z-${10 - i} -ml-4 first:ml-0 flex items-center justify-center text-xs font-bold text-gray-500`}>
                User
              </div>
            ))}
            <div className="pl-4 text-sm font-medium text-gray-500">
              Trusted by 10,000+ polyglots
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div id="features" className="py-32 relative z-10 px-6">
        <div className="max-w-7xl mx-auto space-y-24">

          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Mastery Suite</h2>
            <p className="text-gray-400 text-lg">Everything you need to reach fluency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {/* Feature 1: Live Coach (Large) */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="md:col-span-2 md:row-span-2 group relative bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="p-10 h-full flex flex-col relative z-20">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 premium-border">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-indigo-300 transition-colors">{t('features.conversation.title')}</h3>
                <p className="text-gray-300 text-lg leading-relaxed max-w-sm">{t('features.conversation.description')}</p>

                {/* Mock UI */}
                <div className="mt-auto pt-10 pl-10 relative">
                  <div className="bg-black/50 border border-white/10 rounded-tl-3xl p-6 shadow-2xl backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-2 w-32 bg-gray-700 rounded-full"></div>
                        <div className="h-2 w-20 bg-gray-800 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full mb-2"></div>
                    <div className="h-2 w-3/4 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Gamification (Tall) */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="md:col-span-1 md:row-span-2 group relative bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-yellow-500/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="p-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-6 premium-border">
                  <Award size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-yellow-200 transition-colors">{t('features.gamification.title')}</h3>
                <p className="text-gray-300 leading-relaxed mb-6">{t('features.gamification.description')}</p>

                <div className="mt-auto flex flex-col gap-3">
                  <div className="bg-gray-800/30 p-4 rounded-2xl flex items-center gap-3 border border-white/5 backdrop-blur-sm group-hover:bg-gray-800/50 transition-colors">
                    <Star className="text-yellow-500" size={20} fill="currentColor" />
                    <span className="font-bold text-gray-200">Daily Streak</span>
                    <span className="ml-auto font-mono text-yellow-400">12🔥</span>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-2xl flex items-center gap-3 border border-white/5 backdrop-blur-sm group-hover:bg-gray-800/50 transition-colors">
                    <Award className="text-purple-500" size={20} />
                    <span className="font-bold text-gray-200">XP Gained</span>
                    <span className="ml-auto font-mono text-purple-400">+450</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Lessons Path (Wide) */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="md:col-span-3 h-auto md:h-64 group relative bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-green-500/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="p-10 flex flex-col md:flex-row items-center gap-10 h-full relative z-20">
                <div className="flex-1 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center premium-border">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-green-300 transition-colors uppercase tracking-tight">{t('features.lessons.title')}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{t('features.lessons.description')}</p>
                </div>

                {/* Timeline Graphic */}
                <div className="flex-1 w-full flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-all duration-700 transform group-hover:translate-x-2">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.5)]">1</div>
                  <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500"
                      initial={{ width: "30%" }}
                      whileHover={{ width: "66%" }}
                      transition={{ duration: 1.5 }}
                    ></motion.div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-green-500 flex items-center justify-center text-green-500 font-bold">2</div>
                  <div className="h-1 flex-1 bg-gray-800 rounded-full"></div>
                  <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-600 font-bold">3</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl mt-20 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
              <Globe size={16} />
            </div>
            <span className="font-bold text-gray-400">MyCanadaRP</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-500 font-medium">
            <Link href="/legal" className="hover:text-white transition">Privacy</Link>
            <Link href="/legal" className="hover:text-white transition">Terms</Link>
            <Link href="/legal" className="hover:text-white transition">Contact</Link>
          </div>

          <div className="text-xs text-gray-600">
            © 2024 MyCanadaRP Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}

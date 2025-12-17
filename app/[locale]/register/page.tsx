'use client'

import { register } from '@/app/auth/actions';
import Link from 'next/link';
import { SubmitButton } from '@/app/auth/submit-button';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Cpu } from 'lucide-react';

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        const res = await register(formData);
        if (res?.error) {
            setError(res.error);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
            <div className="fixed top-0 -right-20 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-0 -left-20 w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition font-medium group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" /> {t('login.back')}
                </Link>

                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                            <Cpu size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {t('register.title')}
                        </h1>
                        <p className="text-gray-400 mt-2">Start your journey to fluency.</p>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-gray-400 text-sm font-medium ml-1">{t('form.name')}</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full bg-white/5 text-white rounded-xl p-3.5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-gray-400 text-sm font-medium ml-1">{t('form.email')}</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-white/5 text-white rounded-xl p-3.5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-gray-400 text-sm font-medium ml-1">{t('form.password')}</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-white/5 text-white rounded-xl p-3.5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <SubmitButton label={t('form.submit')} loadingLabel={t('form.processing')} />
                    </form>

                    <p className="mt-8 text-center text-gray-500 text-sm">
                        {t('register.hasAccount')} <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition hover:underline">{t('register.signIn')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

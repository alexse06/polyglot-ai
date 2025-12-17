'use client'

import { login, googleLogin } from '@/app/auth/actions';
import { SubmitButton } from '@/app/auth/submit-button';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Cpu } from 'lucide-react';

export default function LoginPage() {
    const t = useTranslations('Auth');
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        const res = await login(formData);
        if (res?.error) {
            setError(res.error);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
            <div className="fixed top-0 -left-20 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-0 -right-20 w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition font-medium group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" /> {t('login.back')}
                </Link>

                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                            <Cpu size={24} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">MyCanadaRP</h1>
                        <p className="text-gray-400 mt-2">Welcome back, polyglot.</p>
                    </div>

                    {/* Google Login */}
                    <form action={googleLogin} className="mb-6">
                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-3.5 px-4 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-900/60 backdrop-blur-xl text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
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
                        {t('login.noAccount')} <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition hover:underline">{t('login.signUp')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

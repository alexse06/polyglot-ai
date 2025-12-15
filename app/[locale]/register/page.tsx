'use client'

import { register } from '@/app/auth/actions';
import Link from 'next/link';
import { SubmitButton } from '@/app/auth/submit-button';
import { useState } from 'react';
import { useTranslations } from 'next-intl';



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
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">{t('register.title')}</h1>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">{t('form.name')}</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">{t('form.email')}</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">{t('form.password')}</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <SubmitButton label={t('form.submit')} loadingLabel={t('form.processing')} />
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    {t('register.hasAccount')} <Link href="/login" className="text-yellow-500 hover:underline">{t('register.signIn')}</Link>
                </p>
            </div>
        </div>
    );
}

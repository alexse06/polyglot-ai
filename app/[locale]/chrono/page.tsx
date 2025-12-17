'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Phone, PhoneCall } from 'lucide-react';
import { CHRONO_CHARACTERS } from '@/lib/chrono-characters';

export default function ChronoPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft />
                </Link>
                <h1 className="font-bold text-2xl flex items-center gap-2">
                    <span className="text-green-500">Chrono</span> Call
                </h1>
            </header>

            <div className="max-w-md mx-auto">
                <p className="text-gray-400 mb-6 text-center">
                    Urgent calls from the past. Identify the problem and help them.
                </p>

                <div className="grid gap-4">
                    {CHRONO_CHARACTERS.map((char) => (
                        <Link key={char.id} href={`/chrono/${char.id}`}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center gap-4 hover:border-green-500/50 transition-colors cursor-pointer group"
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-3xl border-2 border-transparent group-hover:border-green-500 transition-colors">
                                    {char.emoji}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-white group-hover:text-green-400 transition-colors flex items-center gap-2">
                                        {char.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{char.title}</p>
                                    <p className="text-sm text-gray-400 line-clamp-1 mt-1">{char.description}</p>
                                </div>
                                <div className="bg-green-500/10 p-3 rounded-full text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
                                    <PhoneCall size={20} />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

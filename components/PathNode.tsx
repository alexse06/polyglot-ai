'use client';

import Link from 'next/link';
import { Book, MessageCircle, Star, Lock, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PathNodeProps {
    id: string;
    title: string;
    description: string;
    type: 'LESSON' | 'SCENARIO';
    status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
    href: string;
    isLast?: boolean;
}

export default function PathNode({ title, type, status, href, isLast }: PathNodeProps) {
    const isLocked = status === 'LOCKED';
    const isCompleted = status === 'COMPLETED';
    const isActive = status === 'ACTIVE';

    const Icon = type === 'LESSON' ? Book : MessageCircle;

    return (
        <div className="relative flex flex-col items-center z-10">
            {/* Connector Line */}
            {!isLast && (
                <div className={twMerge(
                    "absolute top-16 w-1 h-24 -z-10",
                    isCompleted ? "bg-yellow-500" : "bg-gray-800"
                )}></div>
            )}

            <Link
                href={isLocked ? '#' : href}
                className={twMerge(
                    "w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300 transform",
                    isLocked
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : isCompleted
                            ? "bg-yellow-500 border-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                            : "bg-gradient-to-br from-yellow-400 to-orange-500 border-white text-black animate-pulse-glow scale-110",
                    isActive && "hover:scale-115 active:scale-95"
                )}
            >
                {isCompleted ? (
                    <Check size={32} strokeWidth={4} />
                ) : isLocked ? (
                    <Lock size={24} />
                ) : (
                    <Icon size={32} />
                )}

                {isActive && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
                        START
                    </div>
                )}
            </Link>

            <div className="mt-2 text-center max-w-[150px]">
                <h3 className={twMerge(
                    "font-bold text-sm",
                    isLocked ? "text-gray-500" : "text-gray-200"
                )}>
                    {title}
                </h3>
            </div>
        </div>
    );
}

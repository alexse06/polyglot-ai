'use client';

import { Link } from '@/navigation';
import { twMerge } from 'tailwind-merge';
import { useSFX } from '@/hooks/use-sfx';
import { motion } from 'framer-motion';

interface BentoCardProps {
    href: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    className?: string; // For grid spans (col-span-2, etc.)
    iconBgClass?: string;
    gradientClass?: string; // Optional background gradient
    badgeText?: string;
    footerText?: string;
    headerImage?: string; // Optional background image
    onClick?: () => void;
}

export function BentoCard({
    href,
    title,
    description,
    icon,
    className,
    iconBgClass = "bg-white/10",
    gradientClass,
    badgeText,
    footerText,
    headerImage
}: BentoCardProps) {
    const { playHover, playClick } = useSFX();

    const item = {
        hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
        show: { opacity: 1, y: 0, filter: 'blur(0px)' }
    };

    return (
        <motion.div
            variants={item}
            className={twMerge("rounded-3xl h-full", className)} // Ensure wrapper has border-radius and full height because it carries background/border classes
            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } }}
            whileTap={{ scale: 0.98 }}
        >
            <Link
                href={href}
                onMouseEnter={playHover}
                onClick={playClick}
                className={twMerge(
                    "group relative block h-full w-full overflow-hidden rounded-3xl p-5 md:p-6 transition-colors duration-300 shadow-lg hover:shadow-2xl border border-white/5",
                    "bg-gray-900/40 backdrop-blur-xl", // Fixed Dark Glass
                    gradientClass ? "" : "hover:border-white/10",
                    gradientClass
                )}
            >
                {/* Background Image / Gradient Overlay */}
                {headerImage && (
                    <>
                        <motion.div
                            className="absolute inset-0 bg-cover bg-center opacity-40"
                            style={{ backgroundImage: `url(${headerImage})` }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.7 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
                    </>
                )}

                {/* Glowing orb effect on hover - Animated opacity */}
                <motion.div
                    className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1, scale: 1.2, backgroundColor: "rgba(255,255,255,0.15)" }}
                />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header: Icon + Badge */}
                    <div className="flex justify-between items-start mb-4">
                        <motion.div
                            className={twMerge("w-12 h-12 rounded-2xl flex items-center justify-center", iconBgClass)}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            {icon}
                        </motion.div>
                        {badgeText && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white/90 border border-white/10 backdrop-blur-md shadow-sm">
                                {badgeText}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="mt-auto">
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all">
                            {title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                            {description}
                        </p>
                    </div>

                    {/* Footer / CTA (Optional) */}
                    {footerText && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            {footerText} <motion.span className="ml-1 inline-block" whileHover={{ x: 5 }}>→</motion.span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

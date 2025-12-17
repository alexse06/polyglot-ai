'use client';

import { motion } from 'framer-motion';

interface AnimatedGridProps {
    children: React.ReactNode;
    className?: string;
}

export function AnimatedGrid({ children, className }: AnimatedGridProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    );
}

'use client';

import { motion } from 'framer-motion';

interface AnimatedItemProps {
    children: React.ReactNode;
    className?: string;
}

export function AnimatedItem({ children, className }: AnimatedItemProps) {
    const item = {
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        show: { opacity: 1, y: 0, filter: 'blur(0px)' }
    };

    return (
        <motion.div
            variants={item}
            className={className}
        >
            {children}
        </motion.div>
    );
}

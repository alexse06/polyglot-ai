import { Link } from '@/navigation';
import { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DashboardCardProps {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    iconColorClass: string; // e.g., "text-yellow-500"
    iconBgClass: string; // e.g., "bg-yellow-500/10"
    borderColorClass?: string; // hover border color
    badgeText?: string;
    badgeColorClass?: string;
    footerText?: string; // e.g. "Commencer ->"
    footerIcon?: LucideIcon;
}

export function DashboardCard({
    href,
    title,
    description,
    icon: Icon,
    iconColorClass,
    iconBgClass,
    borderColorClass = "group-hover:border-gray-600",
    badgeText,
    badgeColorClass = "bg-yellow-500 text-black",
    footerText,
    footerIcon: FooterIcon
}: DashboardCardProps) {
    return (
        <Link
            href={href}
            className={twMerge(
                "block group relative overflow-hidden glass-card p-6 rounded-2xl transition duration-300 hover:scale-[1.02]",
                borderColorClass
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={twMerge("p-3 rounded-xl transition group-hover:scale-110", iconBgClass, iconColorClass)}>
                    <Icon size={32} />
                </div>
                {badgeText && (
                    <div className={twMerge("text-xs font-bold px-2 py-1 rounded uppercase tracking-wider", badgeColorClass)}>
                        {badgeText}
                    </div>
                )}
            </div>

            <h3 className={twMerge("text-xl font-bold mb-2 transition", borderColorClass ? `group-hover:text-${borderColorClass.replace('border-', '').replace('/50', '')}` : "")}>
                {title}
            </h3>

            <p className="text-gray-400 text-sm mb-6">
                {description}
            </p>

            {footerText && (
                <div className={twMerge("flex items-center font-semibold gap-2", iconColorClass)}>
                    {footerText}
                    {FooterIcon && <FooterIcon size={16} className="group-hover:translate-x-1 transition-transform" />}
                </div>
            )}
        </Link>
    );
}

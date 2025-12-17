import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Star } from 'lucide-react';

export function RecommendedAction({
    userName,
    languageLabel,
    streak,
    lastLessonTitle,
    lessonCount,
    translations
}: {
    userName: string,
    languageLabel: string,
    streak: number,
    lastLessonTitle?: string,
    lessonCount: number,
    translations: any
}) {
    // Logic to determine recommendations
    let title = translations.start.title;
    let desc = translations.start.desc.replace('{language}', languageLabel);
    let action = translations.start.action;
    let link = "/learn";
    let icon = <Sparkles className="text-yellow-400" size={24} />;

    if (streak > 0 && lessonCount > 0) {
        title = translations.continue.title;
        desc = translations.continue.desc.replace('{lesson}', lastLessonTitle || 'Lesson');
        action = translations.continue.action;
        link = "/learn";
        icon = <Star className="text-orange-400" size={24} />;
    } else if (lessonCount > 0) {
        title = translations.resume.title;
        desc = translations.resume.desc;
        action = translations.resume.action;
        link = "/learn";
        icon = <BookOpen className="text-blue-400" size={24} />;
    }

    return (
        <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden group shadow-2xl">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition duration-700"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/5">
                            {icon}
                        </div>
                        <span className="text-indigo-200 font-bold text-xs tracking-widest uppercase">{translations.label}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">{title}</h2>
                    <p className="text-indigo-100/80 text-lg max-w-2xl leading-relaxed">{desc}</p>
                </div>

                <Link
                    href={link}
                    className="group/btn flex items-center gap-3 bg-white text-indigo-950 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:shadow-indigo-500/20 whitespace-nowrap w-full lg:w-auto justify-center"
                >
                    {action}
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

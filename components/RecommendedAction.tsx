import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Star } from 'lucide-react';

export function RecommendedAction({
    userName,
    languageLabel,
    streak,
    lastLessonTitle,
    lessonCount
}: {
    userName: string,
    languageLabel: string,
    streak: number,
    lastLessonTitle?: string,
    lessonCount: number
}) {
    // Logic to determine recommendations
    let title = "Commencez votre voyage !";
    let desc = `Apprenez les bases de ${languageLabel} maintenant.`;
    let action = "Démarrer la Leçon 1";
    let link = "/learn";
    let icon = <Sparkles className="text-yellow-400" size={24} />;

    if (streak > 0 && lessonCount > 0) {
        title = "Continuez sur votre lancée !";
        desc = `Vous avez terminé "${lastLessonTitle}". Prêt pour la suite ?`;
        action = "Leçon Suivante";
        link = "/learn";
        icon = <Star className="text-orange-400" size={24} />;
    } else if (lessonCount > 0) {
        title = "Reprenez l'apprentissage";
        desc = "Cela fait un moment. Une petite leçon de 5 minutes ?";
        action = "Reprendre";
        link = "/learn";
        icon = <BookOpen className="text-blue-400" size={24} />;
    }

    return (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 border border-indigo-700/50 relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            {icon}
                        </div>
                        <span className="text-indigo-200 font-medium text-sm tracking-wider uppercase">Recommandé pour vous</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-indigo-200 max-w-lg">{desc}</p>
                </div>

                <Link
                    href={link}
                    className="group/btn flex items-center gap-3 bg-white text-indigo-950 font-bold px-6 py-4 rounded-xl hover:bg-indigo-50 transition shadow-lg shadow-indigo-900/50 whitespace-nowrap w-full md:w-auto justify-center"
                >
                    {action}
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

import { Wrench, Clock, AlertTriangle } from 'lucide-react';

export const metadata = {
    title: 'Maintenance en cours',
    description: 'Le site est actuellement en maintenance pour amélioration.',
};

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white font-sans relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-500 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-inner group">
                        <Wrench size={40} className="text-yellow-500 group-hover:rotate-45 transition-transform duration-700" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                    Maintenance en cours
                </h1>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    Nous améliorons l'expérience d'apprentissage. <br />
                    L'application sera de retour très bientôt avec de nouvelles voix et fonctionnalités.
                </p>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition">
                        <Clock className="text-purple-400 shrink-0" />
                        <div className="text-left">
                            <h3 className="font-bold text-sm text-gray-200">Durée estimée</h3>
                            <p className="text-xs text-gray-500">Quelques heures</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition">
                        <AlertTriangle className="text-yellow-400 shrink-0" />
                        <div className="text-left">
                            <h3 className="font-bold text-sm text-gray-200">État</h3>
                            <p className="text-xs text-gray-500">Mise à jour des systèmes vocaux</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800">
                    <p className="text-xs text-gray-600">
                        &copy; 2025 Spanish Learning App. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

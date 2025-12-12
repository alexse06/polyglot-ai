import { Target } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-8 animate-in fade-in duration-700 bg-black">
            <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <Target className="absolute text-green-400 animate-pulse ml-1 mt-1" size={32} />
                </div>
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                    Analyse de niveau...
                </h2>
                <p className="text-gray-400">
                    L'IA prépare votre test de placement personnalisé.
                </p>
            </div>
        </div>
    );
}

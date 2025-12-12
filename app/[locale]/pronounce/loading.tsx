import { Mic } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-8 animate-in fade-in duration-700 bg-black">
            <div className="relative">
                <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <Mic className="absolute text-pink-400 animate-pulse ml-1 mt-1" size={32} />
                </div>
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent animate-pulse">
                    Le Coach Vocal se prépare...
                </h2>
                <p className="text-gray-400">
                    Génération d'un défi de prononciation sur mesure.
                </p>
            </div>
        </div>
    );
}

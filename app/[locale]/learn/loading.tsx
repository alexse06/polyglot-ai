import { Sparkles } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-8 animate-in fade-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute text-purple-400 animate-pulse ml-1 mt-1" size={32} />
                </div>
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent animate-pulse">
                    Création de votre parcours...
                </h2>
                <p className="text-gray-400">
                    L'IA génère des leçons adaptées à votre niveau. Cela peut prendre quelques secondes.
                </p>
            </div>

            <div className="flex gap-2 items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-0"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300"></span>
            </div>
        </div>
    );
}

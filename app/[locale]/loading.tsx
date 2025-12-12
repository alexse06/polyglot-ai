export default function Loading() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="relative">
                {/* Pulse Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>

                {/* Spinner */}
                <div className="relative w-16 h-16 border-4 border-gray-800 border-t-indigo-500 rounded-full animate-spin"></div>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
                </div>
            </div>

            <h2 className="mt-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 animate-pulse">
                Chargement...
            </h2>
        </div>
    );
}

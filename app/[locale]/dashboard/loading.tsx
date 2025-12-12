export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Top Bar Skeleton */}
            <header className="p-4 flex justify-between items-center bg-gray-950/80 border-b border-gray-800">
                <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
                <div className="flex gap-4">
                    <div className="h-10 w-20 bg-gray-800 rounded-full animate-pulse"></div>
                    <div className="h-10 w-20 bg-gray-800 rounded-full animate-pulse"></div>
                    <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 mt-6">
                {/* Welcome Skeleton */}
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-gray-800 rounded animate-pulse"></div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 h-48 rounded-2xl p-6 animate-pulse flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 bg-gray-800 rounded-lg"></div>
                                {i === 1 && <div className="h-6 w-24 bg-gray-800 rounded"></div>}
                            </div>
                            <div className="space-y-3">
                                <div className="h-6 w-3/4 bg-gray-800 rounded"></div>
                                <div className="h-4 w-full bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

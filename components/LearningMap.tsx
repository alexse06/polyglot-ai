'use client';

import PathNode from './PathNode';

interface Unit {
    title: string;
    items: any[];
}

interface LearningMapProps {
    units: Unit[];
}

export default function LearningMap({ units }: LearningMapProps) {
    return (
        <div className="w-full max-w-md mx-auto py-12 space-y-16">
            {units.map((unit, unitIndex) => (
                <div key={unit.title} className="relative">
                    {/* Unit Header */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-[1px] flex-1 bg-gray-800"></div>
                        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">{unit.title}</h2>
                        <div className="h-[1px] flex-1 bg-gray-800"></div>
                    </div>

                    {/* Nodes */}
                    <div className="flex flex-col items-center gap-8">
                        {unit.items.map((item, index) => {
                            // Determine if this is the very last item of the very last unit
                            const isGlobalLast = unitIndex === units.length - 1 && index === unit.items.length - 1;

                            // Visual offset for "curvy" path effect
                            const offsetClass = index % 2 === 0 ? "translate-x-0" : index % 4 === 1 ? "-translate-x-12" : "translate-x-12";

                            return (
                                <div key={item.id} className={`transform transition-transform ${offsetClass}`}>
                                    <PathNode
                                        {...item}
                                        isLast={index === unit.items.length - 1 && !isGlobalLast} // Gap between units handled by header
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="text-center pt-8 pb-32">
                <div className="inline-block p-4 rounded-full bg-gray-900 border border-gray-800 text-gray-500">
                    🏆 Plus de contenu bientôt !
                </div>
            </div>
        </div>
    );
}

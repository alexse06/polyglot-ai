'use client'

import { twMerge } from 'tailwind-merge';

type ActivityHeatmapProps = {
    dates: Date[]; // Dates where activity occurred
};

export default function ActivityHeatmap({ dates }: ActivityHeatmapProps) {
    // Generate last 365 days
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    // Convert dates to string set for easy lookup
    const activitySet = new Set(dates.map(d => new Date(d).toDateString()));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📅 Activité (365 derniers jours)
            </h2>
            <div className="flex flex-wrap gap-1 justify-center">
                {days.map((day, idx) => {
                    const isActive = activitySet.has(day.toDateString());
                    return (
                        <div
                            key={idx}
                            title={day.toDateString()}
                            className={twMerge(
                                "w-3 h-3 rounded-sm transition",
                                isActive ? "bg-green-500 shadow-[0_0_4px_rgba(74,222,128,0.5)]" : "bg-gray-800"
                            )}
                        ></div>
                    );
                })}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 justify-end">
                <span>Moins</span>
                <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span>Plus</span>
            </div>
        </div>
    );
}

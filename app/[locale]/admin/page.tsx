import { prisma } from '@/lib/db';
import { Users, Server, Zap, Database, Activity, AlertCircle } from 'lucide-react';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getPerformanceStats() {
    let stats = {
        geminiLatency: 0,
        geminiCount: 0,
        errorCount: 0,
        estimatedCost: 0
    };

    try {
        // Read app logs for latency and tokens
        const logPath = path.join(process.cwd(), 'logs', 'app.log');
        if (fs.existsSync(logPath)) {
            const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n'); // Read all logs for accurate cost

            let totalLatency = 0;
            let latencyCount = 0;
            let totalInputTokens = 0;
            let totalOutputTokens = 0;

            lines.forEach(line => {
                try {
                    const log = JSON.parse(line);

                    // Latency (Gemini only) - last 500 for relevant average
                    if (log.message === 'Gemini conversation response generated' && log.duration) {
                        totalLatency += log.duration;
                        latencyCount++;

                        // Token counting
                        if (log.tokens) {
                            totalInputTokens += log.tokens.input || 0;
                            totalOutputTokens += log.tokens.output || 0;
                        }
                    }
                } catch { } // Ignore malformed lines
            });

            if (latencyCount > 0) {
                stats.geminiLatency = Math.round(totalLatency / latencyCount);
                stats.geminiCount = latencyCount;
            }

            // Pricing: Gemini 1.5 Flash (Approx)
            // Input: $0.075 / 1M tokens
            // Output: $0.30 / 1M tokens
            const cost = (totalInputTokens / 1_000_000 * 0.075) + (totalOutputTokens / 1_000_000 * 0.30);
            stats.estimatedCost = cost;
        }

        // Read error logs for error count
        const errorPath = path.join(process.cwd(), 'logs', 'error.log');
        if (fs.existsSync(errorPath)) {
            const lines = fs.readFileSync(errorPath, 'utf-8').trim().split('\n');
            stats.errorCount = lines.length;
        }

    } catch (e) {
        console.error("Failed to read logs for stats:", e);
    }

    return stats;
}

export default async function AdminDashboardPage() {
    const stats = await getPerformanceStats();

    // Fetch stats
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const recentUsers = await prisma.user.count({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h
            }
        }
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Tableau de Bord</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Utilisateurs Totaux"
                    value={userCount.toString()}
                    icon={Users}
                    trend={`+${recentUsers} derniers 24h`}
                />
                <StatCard
                    title="Latence IA (Moy.)"
                    value={`${stats.geminiLatency}ms`}
                    icon={Zap}
                    color="text-yellow-500"
                    trend={`${stats.geminiCount} requêtes`}
                />
                <StatCard
                    title="Erreurs Système"
                    value={stats.errorCount.toString()}
                    icon={AlertCircle}
                    color={stats.errorCount > 0 ? "text-red-500" : "text-green-500"}
                    trend="Depuis le début"
                />
                <StatCard
                    title="Estimation Coût IA"
                    value={`$${stats.estimatedCost.toFixed(4)}`}
                    icon={Activity}
                    color="text-blue-400"
                    trend="Gemini 2.0 Flash"
                />
            </div>

            {/* Recent Table Preview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Derniers Inscrits</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-zinc-500 border-b border-zinc-800">
                            <tr>
                                <th className="pb-3">Nom</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Niveau</th>
                                <th className="pb-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-300">
                            {(await prisma.user.findMany({
                                take: 5,
                                orderBy: { createdAt: 'desc' },
                                include: { languageProgress: true } // Fetch progress
                            })).map(u => (
                                <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50">
                                    <td className="py-3 font-medium">{u.name || 'Sans nom'}</td>
                                    <td className="py-3 text-zinc-400">{u.email}</td>
                                    <td className="py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {u.languageProgress.length > 0 ? u.languageProgress.map(p => (
                                                <span key={p.language} className="bg-zinc-800 px-2 py-1 rounded text-xs">
                                                    {p.language}: {p.level}
                                                </span>
                                            )) : <span className="text-zinc-600 text-xs">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="py-3 text-zinc-500 text-sm">{u.createdAt.toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, color = "text-white" }: any) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-zinc-800 ${color}`}>
                    <Icon size={24} />
                </div>
                {trend && <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <p className="text-zinc-400 text-sm">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    );
}

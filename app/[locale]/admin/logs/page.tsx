
import fs from 'fs';
import path from 'path';
import { BadgeAlert, Info, AlertTriangle, Terminal, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    [key: string]: any;
}

async function getLogs(lines = 100): Promise<LogEntry[]> {
    const logPath = path.join(process.cwd(), 'logs', 'app.log');

    if (!fs.existsSync(logPath)) {
        return [];
    }

    const fileContent = fs.readFileSync(logPath, 'utf-8');
    const logLines = fileContent.trim().split('\n');

    // Get last N lines and reverse
    const recentLogs = logLines.slice(-lines).reverse();

    return recentLogs
        .map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(Boolean);
}

export default async function AdminLogsPage() {
    const logs = await getLogs(200);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Terminal className="text-zinc-500" />
                    Logs Système
                </h1>
                <form>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-sm">
                        <RefreshCw size={16} />
                        Actualiser
                    </button>
                </form>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 w-24">Level</th>
                                <th className="px-4 py-3 w-48">Timestamp</th>
                                <th className="px-4 py-3">Message</th>
                                <th className="px-4 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                                        Aucun log trouvé.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-900/50 transition">
                                        <td className="px-4 py-3">
                                            <LogLevelBadge level={log.level} />
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                                            {log.timestamp}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-zinc-300">
                                            {log.message}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-zinc-500 max-w-md truncate">
                                            {JSON.stringify(omit(log, ['level', 'message', 'timestamp']))}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LogLevelBadge({ level }: { level: string }) {
    switch (level) {
        case 'error':
            return <span className="flex items-center gap-1 text-red-400"><BadgeAlert size={14} /> ERROR</span>;
        case 'warn':
            return <span className="flex items-center gap-1 text-yellow-400"><AlertTriangle size={14} /> WARN</span>;
        case 'info':
            return <span className="flex items-center gap-1 text-blue-400"><Info size={14} /> INFO</span>;
        default:
            return <span className="text-zinc-500">{level.toUpperCase()}</span>;
    }
}

function omit(obj: any, keys: string[]) {
    const newObj = { ...obj };
    keys.forEach(key => delete newObj[key]);
    return newObj;
}

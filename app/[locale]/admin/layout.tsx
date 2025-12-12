import Link from 'next/link';
import { LayoutDashboard, Users, Activity, Settings, LogOut, Shield } from 'lucide-react';
import { getOrCreateUser, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getOrCreateUser();

    // Basic RBAC check (Note: Middleware should handle this too, but double check here)
    if (!user || user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-10">
                    <Shield className="text-red-500" />
                    <span className="font-bold text-xl tracking-tight">Admin<span className="text-zinc-500">Panel</span></span>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavLink href="/admin" icon={LayoutDashboard} label="Vue d'ensemble" />
                    <NavLink href="/admin/users" icon={Users} label="Utilisateurs" />
                    <NavLink href="/admin/logs" icon={Activity} label="Logs & Perf" />
                    <NavLink href="/admin/settings" icon={Settings} label="Configuration" />
                </nav>

                <form action={async () => {
                    'use server';
                    await logout();
                }}>
                    <button className="flex items-center gap-3 text-zinc-400 hover:text-white transition w-full p-2 hover:bg-zinc-900 rounded-lg">
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </form>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-zinc-900 p-2 rounded-lg transition">
            <Icon size={20} />
            {label}
        </Link>
    );
}

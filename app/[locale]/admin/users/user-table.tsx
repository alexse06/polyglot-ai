'use client'

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, MoreVertical, Shield, Trash, Pencil, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { updateUser, deleteUser } from './actions';

// Assuming useDebounce and toast are defined elsewhere or imported.
// For this change, I'll just add the lines as provided.
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Placeholder for toast, assuming a library like react-hot-toast
const toast = {
    success: (message: string) => alert(`Success: ${message}`),
    error: (message: string) => alert(`Error: ${message}`),
};

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    languageProgress: { language: string; level: string; xp: number }[];
    createdAt: Date;
}

export default function UserTable({ initialUsers, totalPages }: { initialUsers: User[], totalPages: number }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false); // Added loading state
    const router = useRouter();

    const debouncedSearch = useDebounce(search, 500); // Added useDebounce

    // Dialog States
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    // Filter Logic would ideally be server-side, but for small lists client is fine.
    // However, the actions.ts has search, so we should allow triggering it.
    // For now, let's just display the initial users and support the actions.

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        // Debounce logic for server search would go here
        router.push(`/admin/users?search=${e.target.value}`);
    };

    const handleUpdate = async (formData: FormData) => {
        if (!editingUser) return;

        startTransition(async () => {
            const result = await updateUser(editingUser.id, {
                name: formData.get('name') as string,
                role: formData.get('role') as string,
                // level and xp are now part of languageProgress, need to adjust this if editing languageProgress
                // For now, keeping the original fields that were editable
                level: editingUser.languageProgress[0]?.level || '', // Placeholder, needs proper handling
            });

            if (result.success) {
                setEditingUser(null);
                router.refresh();
            }
        });
    };

    const handleDelete = async (userId: string) => { // Modified signature
        if (!confirm("Are you sure? This action is irreversible.")) return; // Added confirm dialog
        startTransition(async () => {
            const res = await deleteUser(userId); // Changed to res
            if (res.success) {
                setUsers(users.filter(u => u.id !== userId)); // Updated setUsers logic
                toast.success("Utilisateur supprimé"); // Added toast
                setDeletingUser(null); // Close delete modal if open
            } else {
                toast.error(res.error || "Erreur inconnue"); // Added toast
            }
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-800 flex justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-zinc-500 bg-zinc-950/50 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3 font-medium">Utilisateur</th>
                            <th className="px-6 py-3 font-medium">Rôle</th>
                            <th className="px-6 py-3 font-medium">Niveau</th>
                            <th className="px-6 py-3 font-medium">XP</th>
                            <th className="px-6 py-3 font-medium">Inscrit le</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-xs">
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name || 'Sans Nom'}</p>
                                            <p className="text-xs text-zinc-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {user.languageProgress.length > 0 ? user.languageProgress.map(p => (
                                            <span key={p.language} className="text-xs text-zinc-300">
                                                <span className="font-bold text-zinc-500 w-4 inline-block">{p.language}</span> {p.level}
                                            </span>
                                        )) : <span className="text-zinc-600 text-xs">-</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {user.languageProgress.length > 0 ? user.languageProgress.map(p => (
                                            <span key={p.language} className="text-xs text-zinc-300">
                                                {p.xp} XP
                                            </span>
                                        )) : <span className="text-zinc-600 text-xs">0</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
                                            title="Éditer"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold">Modifier l'utilisateur</h3>
                        <form action={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Nom</label>
                                <input name="name" defaultValue={editingUser?.name || ''} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Role</label>
                                    <select name="role" defaultValue={editingUser?.role} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2">
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Niveau</label>
                                    <select name="level" defaultValue={editingUser?.languageProgress?.[0]?.level || "A1"} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2">
                                        <option value="A1">A1</option>
                                        <option value="A2">A2</option>
                                        <option value="B1">B1</option>
                                        <option value="B2">B2</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 hover:bg-zinc-800 rounded">Annuler</button>
                                <button disabled={isPending} type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded text-white flex items-center gap-2">
                                    {isPending && <Loader2 className="animate-spin" size={16} />}
                                    Sauvegarder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-red-500 flex items-center gap-2"><Trash size={20} /> Supprimer le compte ?</h3>
                        <p className="text-zinc-400">
                            Êtes-vous sûr de vouloir supprimer <strong>{deletingUser?.email}</strong> ? <br />
                            Cette action est irréversible et effacera toute sa progression.
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setDeletingUser(null)} className="px-4 py-2 hover:bg-zinc-800 rounded">Annuler</button>
                            <button disabled={isPending} onClick={() => handleDelete(deletingUser!.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white flex items-center gap-2">
                                {isPending && <Loader2 className="animate-spin" size={16} />}
                                Confirmer la suppression
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

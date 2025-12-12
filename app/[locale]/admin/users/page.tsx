
import { getUsers } from './actions';
import UserTable from './user-table';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage(props: {
    searchParams: Promise<{ page?: string; search?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams?.page) || 1;
    // Fix: Access properties directly from searchParams if passing directly, 
    // but in Next.js 15+ searchParams is a Promise. 
    // Assuming Next.js 13/14 pattern here based on current context.
    // If it's a promise (Next 15), we need await. Let's handle generic case safely.

    // Actually, in the file signature above, searchParams is typed as an object.
    const query = searchParams?.search || "";

    const { users, totalPages } = await getUsers(page, 20, query);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="text-violet-500" />
                    Gestion Utilisateurs
                </h1>
            </div>

            <UserTable initialUsers={users} totalPages={totalPages} />
        </div>
    );
}

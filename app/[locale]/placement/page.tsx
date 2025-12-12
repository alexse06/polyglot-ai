import { getOrCreateUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PlacementClient from './client';

export default async function PlacementPage() {
    const user = await getOrCreateUser();

    // TEMPORARY: Allow registered users to see placement page for verification
    // if (user && user.email) {
    //    redirect('/dashboard');
    // }

    return <PlacementClient />;
}

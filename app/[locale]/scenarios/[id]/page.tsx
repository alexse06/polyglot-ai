import { getScenarioById } from '../actions';
import ScenarioChatClient from './ScenarioChatClient';
import { redirect } from 'next/navigation';

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const scenario = await getScenarioById(id);

    if (!scenario) {
        redirect('/scenarios');
    }

    return <ScenarioChatClient scenario={scenario} />;
}

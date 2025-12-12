export const dynamic = 'force-dynamic';

import { getLessonById, completeLesson } from '../actions';
import { notFound, redirect } from 'next/navigation';
import LessonWizard from './LessonWizard';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lesson = await getLessonById(id);

    if (!lesson) {
        notFound();
    }

    // Parse content
    let content;
    try {
        content = JSON.parse(lesson.content);
    } catch (e) {
        return <div>Erreur de chargement de la leçon.</div>;
    }

    return (
        <div className="min-h-screen text-white flex flex-col">
            <LessonWizard lesson={lesson} content={content} />
        </div>
    );
}

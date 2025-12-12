'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
        >
            {pending ? 'Traitement en cours...' : 'Continuer'}
        </button>
    );
}

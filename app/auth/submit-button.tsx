'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
    label: string;
    loadingLabel: string;
}

export function SubmitButton({ label, loadingLabel }: SubmitButtonProps) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
        >
            {pending ? loadingLabel : label}
        </button>
    );
}

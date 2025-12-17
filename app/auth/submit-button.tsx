'use client';

import { useFormStatus } from 'react-dom';
import { useSFX } from '@/hooks/use-sfx';

interface SubmitButtonProps {
    label: string;
    loadingLabel: string;
}

export function SubmitButton({ label, loadingLabel }: SubmitButtonProps) {
    const { pending } = useFormStatus();
    const { playClick, playHover } = useSFX();

    return (
        <button
            type="submit"
            disabled={pending}
            onClick={playClick}
            onMouseEnter={playHover}
            className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
        >
            {pending ? loadingLabel : label}
        </button>
    );
}

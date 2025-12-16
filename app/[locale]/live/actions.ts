'use server';

import { generateSystemInstruction } from '@/lib/gemini';

export async function createCustomScenario(topic: string, language: string) {
    try {
        const instruction = await generateSystemInstruction(topic, language);
        return { success: true, instruction };
    } catch (error) {
        console.error("Failed to create custom scenario:", error);
        return { success: false, error: "Failed to generate scenario." };
    }
}

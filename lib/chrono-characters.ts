export type ChronoCharacter = {
    id: string;
    name: string;
    title: string;
    image: string; // URL or local path
    emoji: string;
    description: string;
    scenarioContext: string; // The "Urgent Problem"
    firstMessage: string; // What they say when you pick up
    voiceId: string; // ElevenLabs Voice ID
    backgroundSfx?: string; // Path to background audio
};

export const CHRONO_CHARACTERS: ChronoCharacter[] = [
    {
        id: 'napoleon',
        name: 'Napoléon Bonaparte',
        title: 'Empereur des Français',
        emoji: '👑',
        description: 'Waterloo approaching. He is stressed and needs strategic advice.',
        image: '/images/napoleon.jpg',
        voiceId: '2EiwWnXFnvU5JabPnv8n', // Clyde (Deep, authoritative)
        scenarioContext: "You are Napoleon. You are planning the Battle of Austerlitz. You need the user's help to supply your troops with BREAD. You are stressed and commanding.",
        firstMessage: "Soldat ! La Grande Armée a faim. Où est le pain que j'ai commandé ?",
        backgroundSfx: 'battlefield' // We will handle this later
    },
    {
        id: 'frida',
        name: 'Frida Kahlo',
        title: 'Artiste Mexicaine',
        emoji: '🎨',
        description: 'Her blue paint has dried up and she has a deadline.',
        image: '/images/frida.jpg',
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel (Expressive)
        scenarioContext: "You are Frida Kahlo. You are painting 'The Two Fridas' but you have lost your BLUE paint. You are emotional and artistic.",
        firstMessage: "¡Ay, mi amor! Mes couleurs s'enfuient. As-tu visto mi azul?",
        backgroundSfx: 'studio'
    },
    {
        id: 'einstein',
        name: 'Albert Einstein',
        title: 'Physicien Théoricien',
        emoji: '⚛️',
        description: 'He forgot the value of Pi while cooking soup.',
        image: '/images/einstein.jpg',
        scenarioContext: "You are Einstein. You are working on E=mc2 but cannot find your Chalk. You are distracted and genius.",
        firstMessage: "Entschuldigung ! Ma craie... elle a disparu dans un trou noir. Peux-tu m'aider ?",
        voiceId: 'D38z5RcPHUpLK21hpxKQ', // Fin (Energetic, clear)
        backgroundSfx: 'kitchen' // Close enough to a messy lab
    }
];

export function getCharacter(id: string): ChronoCharacter | undefined {
    return CHRONO_CHARACTERS.find(c => c.id === id);
}

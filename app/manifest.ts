import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Polyglot AI',
        short_name: 'Polyglot',
        description: 'Apprenez l\'espagnol avec l\'intelligence artificielle.',
        start_url: '/',
        display: 'standalone',
        background_color: '#030712', // gray-950
        theme_color: '#000000',
        icons: [
            {
                src: '/polyglot-icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/polyglot-icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ],
    };
}

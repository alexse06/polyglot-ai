import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Español AI Learning',
        short_name: 'Español AI',
        description: 'Apprenez l\'espagnol avec l\'intelligence artificielle.',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#030712', // gray-950
        theme_color: '#000000',
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}

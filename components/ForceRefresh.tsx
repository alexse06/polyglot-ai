'use client';

import { useEffect } from 'react';

export default function ForceRefresh() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                if (registrations.length > 0) console.log("ForceRefresh: Found service workers, unregistering...");
                for (let registration of registrations) {
                    registration.unregister().then(success => {
                        console.log('ServiceWorker unregistration status: ', success);
                        if (success) window.location.reload(); // Force reload once after unregistering
                    });
                }
            });
        }
    }, []);

    return null;
}

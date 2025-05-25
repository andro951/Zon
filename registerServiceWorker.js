"use strict";

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceWorker.js').then(reg => {
        console.log('[Main] Service Worker registered:', reg);

        // Optional: if there's an update found
        reg.onupdatefound = () => {
            const newWorker = reg.installing;
            if (newWorker) {
                newWorker.onstatechange = () => {
                    if (newWorker.state === 'installed') {
                        console.log('[Main] New service worker installed.');

                        // Force activation and page reload if desired
                        if (navigator.serviceWorker.controller) {
                            console.log('[Main] New worker ready — waiting for controller change.');
                        }
                    }
                };
            }
        };
    });

    // Listen for when the new worker becomes active and controlling
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.warn('[Main] Service Worker controller has changed.');
        // Optional: Reload page to use the new service worker and assets
        //window.location.reload();//TODO
    });
}
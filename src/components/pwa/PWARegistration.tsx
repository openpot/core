'use client';

import { useEffect } from 'react';

const AUTO_UPDATE_KEY = 'openpot_auto_update';

/**
 * Privacy-First Service Worker Registration
 * Logic enforced by Openpot Directive 1 & 3:
 * 1. register: false in next.config prevents automatic polling.
 * 2. This hook manually registers the worker ONLY to establish the cache.
 * 3. Background updates are STRICTLY blocked unless AUTO_UPDATE_KEY is true.
 */
export function PWARegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleRegistration = async () => {
      try {
        const registration = await navigator.serviceWorker.register(`/sw.js?v=${process.env.NEXT_PUBLIC_APP_VERSION}`);

        console.log('Openpot SW Registered (Manual Mode)');

        // Check user update preference
        const autoUpdateEnabled = localStorage.getItem(AUTO_UPDATE_KEY) === 'true';

        if (!autoUpdateEnabled) {
          // Directive 3: Explicitly block background update checks
          console.log('Privacy Check: Background updates disabled by policy.');
          return;
        }

        // Only checking if the user explicitly opted-in
        if (registration.active) {
          registration.update();
        }
      } catch (err) {
        console.error('PWA Registration Failure:', err);
      }
    };

    // Delay registration to prioritize core performance and avoid early pings
    if (document.readyState === 'complete') {
      void handleRegistration();
    } else {
      window.addEventListener('load', handleRegistration);
      return () => window.removeEventListener('load', handleRegistration);
    }
  }, []);

  return null;
}

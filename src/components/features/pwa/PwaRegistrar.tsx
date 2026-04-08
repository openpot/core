'use client';

import { useEffect } from 'react';

/**
 * Registers the local service worker needed for offline installability.
 *
 * @returns Null because registration happens as a side effect.
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch {
        // Service worker registration failure should not block the timer UI.
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}

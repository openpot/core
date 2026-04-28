import { useState, useEffect, useCallback } from 'react';

/**
 * Interface for the native BeforeInstallPromptEvent.
 * This event is fired when the browser determines that the user is eligible for a PWA install prompt.
 */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

/**
 * Detects if the application is currently running in standalone mode (installed).
 *
 * @returns boolean indicating whether the app is installed.
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

/**
 * Hook to manage PWA installation logic and UI state.
 *
 * @returns Object containing the installation state and interaction methods.
 */
export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default to true to prevent flash
  const [isIOSInstallModalOpen, setIsIOSInstallModalOpen] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    setIsInstalled(isStandaloneMode());
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const dismissed = localStorage.getItem('openpot_install_dismissed') === 'true';
    setIsDismissed(dismissed);

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setInstallPrompt(installEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (isIOS) {
      setIsIOSInstallModalOpen(true);
      return;
    }

    if (!installPrompt) {
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      setIsInstalled(choice.outcome === 'accepted' || isStandaloneMode());
    } catch (err) {
      console.error('PWA Install Prompt Failed:', err);
    }
  }, [installPrompt, isIOS]);

  const dismissInstallBanner = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem('openpot_install_dismissed', 'true');
  }, []);

  const showInstallPromotion = !isInstalled && !isDismissed && (isIOS || !!installPrompt);

  return {
    installApp,
    dismissInstallBanner,
    showInstallPromotion,
    isIOSInstallModalOpen,
    setIsIOSInstallModalOpen,
  };
}

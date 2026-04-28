'use client';

interface InstallPromotionBannerProps {
  showInstallPromotion: boolean;
  dismissInstallBanner: () => void;
  installApp: () => Promise<void>;
}

/**
 * Renders a promotional banner encouraging the user to install the application as a PWA.
 *
 * @param props - Banner state and event handlers.
 * @returns A UI element that prompts the user to add the app to their home screen, or null if not applicable.
 */
export function InstallPromotionBanner({
  showInstallPromotion,
  dismissInstallBanner,
  installApp,
}: InstallPromotionBannerProps) {
  if (!showInstallPromotion) {
    return null;
  }

  return (
    <section className="relative rounded-lg border border-border-subtle bg-bg-overlay/50 px-4 py-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <button
        type="button"
        aria-label="Dismiss install banner"
        onClick={dismissInstallBanner}
        className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-bg-subtle hover:text-text-primary active:scale-90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pr-6">
        <div className="flex items-start gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
              Install Openpot
            </h3>
            <p className="mt-1 text-[11px] text-text-secondary leading-normal text-left">
              Add to home screen for the best experience and native-style tracking.
            </p>
          </div>
        </div>
        <button
          className="min-h-11 shrink-0 rounded-full bg-primary px-5 py-2 text-xs font-bold text-text-inverse shadow-sm transition-all hover:bg-primary-hover active:scale-95"
          onClick={() => void installApp()}
          type="button"
        >
          Install Now
        </button>
      </div>
    </section>
  );
}

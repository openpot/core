'use client';

/**
 * Quota Warning Modal
 * safety interceptor for sessions exceeding the 50g monthly limit.
 */
interface QuotaWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function QuotaWarningModal({ isOpen, onClose, onConfirm }: QuotaWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="panel-shell w-full max-w-sm border-2 border-primary/30 bg-bg-base p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="quota-warning-title"
      >
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Warning Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 id="quota-warning-title" className="text-lg font-bold tracking-tight text-text-primary">
              Quota Threshold Warning
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              You are about to go over the <span className="text-text-primary font-bold">legal monthly limit</span> of 50g.
            </p>
          </div>

          <div className="grid w-full gap-3">
            <button
              onClick={onConfirm}
              className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-text-inverse transition hover:bg-primary-hover active:scale-[0.98]"
            >
              Disregard
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-border bg-bg-subtle py-3 text-sm font-semibold text-text-secondary transition hover:bg-bg-hover active:scale-[0.98]"
            >
              Adjust
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

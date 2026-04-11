'use client';

import { useCallback, useEffect, useState } from 'react';

import { Logo } from '@/components/ui/Logo';
import { useSecureTimer } from '@/hooks/use-secure-timer';
import { formatDuration, TIMER_STATUS } from '@/lib/timer/timer-machine';
import type { SessionRecord } from '@/types/session';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function isStandaloneMode(): boolean {
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

function getStatusCopy(status: string): string {
  if (status === TIMER_STATUS.ACTIVE) {
    return 'Active';
  }

  if (status === TIMER_STATUS.STOPPED) {
    return 'Stopped';
  }

  return 'Ready';
}


/**
 * Renders the secure timer dashboard and local sync status UI.
 *
 * @returns A responsive timer dashboard for the MVP home screen.
 */
export function SecureTimerDashboard() {
  const {
    formattedElapsed,
    historyError,
    isLoadingHistory,
    recentSessions,
    removeSession,
    state,
    startSession,
    stopSession,
  } = useSecureTimer();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    setIsInstalled(isStandaloneMode());

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setInstallPrompt(installEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failure should not block the timer UI.
    });

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    setInstallPrompt(null);
    setIsInstalled(choice.outcome === 'accepted' || isStandaloneMode());
  }, [installPrompt]);

  const isActive = state.status === TIMER_STATUS.ACTIVE;
  const isStopped = state.status === TIMER_STATUS.STOPPED;
  const isStopDisabled = isActive && state.elapsedMs < 1000;

  const primaryActionLabel = isStopped 
    ? 'Start Another Session' 
    : isActive 
      ? (isStopDisabled ? (state.lastSavedSession ? 'Start Another Session' : 'Start Session') : 'Stop Session')
      : 'Start Session';
  const canInstall = installPrompt !== null && !isInstalled;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <section className="panel-shell relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-6 overflow-hidden px-5 py-6 sm:px-8 sm:py-8" data-testid="timer-shell">
        <header className="flex flex-col items-center justify-center border-b border-border-subtle pb-6 pt-2">
          <Logo aria-hidden="true" className="mb-4 h-[72px] w-auto text-white sm:h-[84px]" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-white text-center">
            Secure Session Tracker
          </h1>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-8">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-overlay px-4 py-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              <span
                className="status-dot"
                style={{
                  backgroundColor: isActive
                    ? 'var(--color-accent)'
                    : isStopped
                      ? 'var(--color-success)'
                      : 'var(--color-primary)',
                }}
              />
              <span data-testid="timer-state">{getStatusCopy(state.status)}</span>
            </div>

            <div className="space-y-3">
              <p className="timer-display overflow-hidden text-text-primary" data-testid="timer-display">
                {formattedElapsed}
              </p>
              <p className="text-sm text-text-secondary sm:text-base">
                Secured locally. Synced anonymously.
              </p>
            </div>
          </div>

          <div className="w-full">
            <button
              className="w-full min-h-12 rounded-lg bg-primary px-5 py-4 text-sm font-semibold text-text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
              data-testid="primary-timer-button"
              disabled={isStopDisabled}
              onClick={isActive ? stopSession : startSession}
              type="button"
            >
              {primaryActionLabel}
            </button>
          </div>

          {canInstall ? (
            <div className="rounded-lg border border-border-subtle bg-bg-overlay px-4 py-3" data-testid="install-prompt">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                    Install app
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Add Openpot to your Android home screen from Chrome.
                  </p>
                </div>
                <button
                  className="min-h-11 rounded-lg border border-border bg-bg-base px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-bg-subtle"
                  data-testid="install-app-button"
                  onClick={() => {
                    void installApp();
                  }}
                  type="button"
                >
                  Install Openpot
                </button>
              </div>
            </div>
          ) : null}

          <div className="min-h-14 rounded-lg border border-border-subtle bg-bg-overlay px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Local confirmation
            </p>
            <p
              aria-live="polite"
              className={`mt-2 text-sm text-text-primary ${state.notice ? 'toast-enter' : ''}`}
              data-testid="secure-notice"
            >
              {state.errorMessage ?? state.notice ?? 'Your next stop will secure a local session entry.'}
            </p>
          </div>
        </div>

        <div className="grid gap-4">

          <section className="rounded-lg border border-border-subtle bg-bg-overlay px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
                  Recent secured sessions
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Anonymous records stored locally inside IndexedDB only.
                </p>
              </div>
            </div>

            <div className="mt-4" data-testid="session-list">
              {isLoadingHistory ? (
                <p className="text-sm text-text-secondary">Loading secured sessions…</p>
              ) : historyError ? (
                <p className="text-sm text-error">{historyError}</p>
              ) : recentSessions.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No secured sessions yet. Start the timer when you are ready.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentSessions.map((session) => (
                    <li className="rounded-md bg-bg-base px-4 py-3" key={session.session_id}>
                      {activeDeleteId === session.session_id ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-text-secondary">Delete this session?</p>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded px-3 py-1 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
                              onClick={() => setActiveDeleteId(null)}
                              type="button"
                            >
                              Cancel
                            </button>
                            <button
                              className="rounded bg-error/10 px-3 py-1 text-xs font-semibold text-error transition hover:bg-error/20"
                              onClick={async () => {
                                setActiveDeleteId(null);
                                await removeSession(session.session_id);
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-mono text-lg font-semibold text-text-primary">
                              {formatDuration(session.duration_seconds)}
                            </p>
                            <p className="text-xs uppercase tracking-wider text-text-secondary">
                              {new Date(session.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <button
                            aria-label="Delete session"
                            className="rounded p-1.5 text-text-tertiary transition hover:bg-error/10 hover:text-error"
                            onClick={() => setActiveDeleteId(session.session_id)}
                            type="button"
                          >
                            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </section>

      <div className="mb-2 mt-auto pt-8 flex w-full justify-center">
        <span className="inline-flex w-max rounded border border-border-subtle bg-bg-base/50 px-2 py-1 font-mono text-[10px] font-medium text-text-tertiary backdrop-blur-sm">
          {process.env.NEXT_PUBLIC_APP_VERSION || 'v0.1.0-dev'}
        </span>
      </div>
    </main>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';

import { Logo } from '@/components/ui/Logo';
import { useSecureTimer } from '@/hooks/use-secure-timer';
import { formatDuration, TIMER_STATUS } from '@/lib/timer/timer-machine';
import { APP_VERSION } from '@/lib/version';
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


const PILL_CLASSES = "inline-flex items-center justify-center h-9 min-w-[85px] rounded-full border border-border bg-bg-overlay px-4 text-xs font-semibold font-sans uppercase tracking-widest text-text-secondary transition-all leading-none";

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
    ghostLibrary,
    removeSession,
    removeGhostSuggestion,
    state,
    customName,
    setCustomName,
    selectedMethod,
    setSelectedMethod,
    rateSession,
    startSession,
    stopSession,
    resetSession,
  } = useSecureTimer();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);
  const [isEditingStrains, setIsEditingStrains] = useState(false);

  const methods = ['Flower', 'Vape', 'Extract', 'Edible', 'Drink', 'Tincture'];
  const ratings = ["Dialed In", "Mellow", "Mid", "Too Heavy"];

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

    void navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('SecureTimer SW Registered:', reg.scope);
      })
      .catch((err) => {
        console.error('SecureTimer SW Registration Failed:', err);
        if (err.name === 'SecurityError') {
          console.error('SecurityError typically indicates an SSL trust issue. Ensure the Root CA is installed on this device.');
        }
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

  const isIdle = state.status === TIMER_STATUS.READY;
  const isActive = state.status === TIMER_STATUS.ACTIVE;
  const isStopped = state.status === TIMER_STATUS.STOPPED;
  const isStopDisabled = isActive && state.elapsedMs < 1000;

  const primaryActionLabel = isStopped 
    ? 'New Session' 
    : isActive 
      ? 'Stop Session' 
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
          <div className="space-y-8 text-center">

            {(
              <div className="mx-0 w-full space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="custom-name" className="block text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      WHAT ARE YOU TRACKING?
                    </label>

                    {isIdle && (
                      <button 
                        type="button" 
                        onClick={() => setIsEditingStrains(!isEditingStrains)}
                        className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                          isEditingStrains 
                            ? 'bg-primary text-text-inverse shadow-sm' 
                            : 'text-text-tertiary hover:bg-bg-overlay hover:text-text-secondary'
                        }`}
                        aria-label={isEditingStrains ? "Disable edit mode" : "Enable edit mode"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                        </svg>
                      </button>
                    )}
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      {customName.length}/20
                    </span>
                  </div>
                  <input
                    id="custom-name"
                    type="text"
                    disabled={!isIdle}
                    maxLength={20}
                    placeholder="E.g. OG Kush, Blue Dream"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value.slice(0, 20))}
                    className="w-full rounded-lg border border-border bg-bg-base/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  {ghostLibrary.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {ghostLibrary.map((name) => (
                        <div 
                          key={name}
                          className={`shrink-0 flex items-center h-9 min-w-[85px] rounded-full border transition-all overflow-hidden ${
                            customName === name
                              ? 'bg-primary/10 border-primary/40'
                              : 'bg-bg-overlay border-border hover:border-text-tertiary'
                          } ${!isIdle && customName !== name ? 'opacity-40 grayscale pointer-events-none' : ''} ${!isIdle && customName === name ? 'pointer-events-none' : ''}`}
                        >
                          <button
                            type="button"
                            disabled={!isIdle}
                            onClick={() => setCustomName(name)}
                            className={`flex flex-1 items-center justify-center h-full text-xs font-semibold font-sans uppercase tracking-widest transition-colors leading-none ${
                               isEditingStrains ? 'pl-4 pr-3' : 'px-4'
                            } ${
                              customName === name ? '!text-primary' : 'text-text-secondary'
                            } ${!isIdle && customName !== name ? 'opacity-40 cursor-not-allowed' : ''}`}
                            style={{ 
                              fontSize: '12px',
                              transform: 'none', 
                              WebkitTransform: 'none'
                            }}
                          >
                            {name}
                          </button>
                          {isEditingStrains && (
                            <>
                              <div className={`h-4 w-px shrink-0 ${customName === name ? 'bg-primary/20' : 'bg-border'}`} />
                              <button
                                type="button"
                                disabled={!isIdle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGhostSuggestion(name);
                                }}
                                className={`px-3 h-full flex items-center justify-center transition-colors animate-in fade-in zoom-in-95 duration-200 ${
                                  customName === name 
                                    ? '!text-primary/70 hover:bg-primary/5' 
                                    : 'text-text-tertiary hover:text-error hover:bg-error/5'
                                } ${!isIdle ? 'opacity-40 cursor-not-allowed' : ''}`}
                                aria-label={`Remove ${name} from suggestions`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-1.5 mb-2 relative group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary text-left">
                      HOW ARE YOU CONSUMING?
                    </p>
                    <div className="flex h-5 w-5 items-center justify-center cursor-help text-text-tertiary hover:text-text-secondary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-bg-overlay/95 backdrop-blur-md border border-border rounded-lg shadow-2xl opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all pointer-events-none z-50">
                      <ul className="space-y-2 text-[11px] leading-snug text-text-secondary">
                        <li><span className="font-bold text-primary uppercase tracking-wider text-[9px]">Flower:</span> Buds for smoking or vaporizing.</li>
                        <li><span className="font-bold text-primary uppercase tracking-wider text-[9px]">Vape:</span> Oil cartridges or pods.</li>
                        <li><span className="font-bold text-primary uppercase tracking-wider text-[9px]">Extract:</span> Wax, shatter, or dabs.</li>
                        <li><span className="font-bold text-primary uppercase tracking-wider text-[9px]">Edible:</span> Infused food or gummies.</li>
                        <li><span className="font-bold text-primary uppercase tracking-wider text-[9px]">Drink:</span> Infused beverages.</li>
                        <li><span className="font-bold text-primary uppercase tracking-wider text-[9px]">Tincture:</span> Sublingual liquid drops.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {methods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        disabled={!isIdle}
                        onClick={() => setSelectedMethod(selectedMethod === m ? null : m)}
                        className={`shrink-0 ${PILL_CLASSES} !text-xs ${
                          selectedMethod === m
                            ? 'bg-primary/10 border-primary/40 !text-primary'
                            : 'hover:border-text-tertiary text-text-secondary'
                        } ${!isIdle && selectedMethod !== m ? 'opacity-40 grayscale pointer-events-none' : ''} ${!isIdle && selectedMethod === m ? 'pointer-events-none' : ''}`}
                        style={{ 
                          fontSize: '12px', 
                          transform: 'none', 
                          WebkitTransform: 'none'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-0 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-1.5 mb-2 relative group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary text-left">
                      HOW WAS THE SESSION?
                    </p>
                    <div className="flex h-5 w-5 items-center justify-center cursor-help text-text-tertiary hover:text-text-secondary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-bg-overlay/95 backdrop-blur-md border border-border rounded-lg shadow-2xl opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all pointer-events-none z-50">
                      <p className="text-[11px] leading-relaxed text-text-secondary font-medium">
                        This can be changed any time until creating a new session.
                      </p>
                    </div>
                  </div>
                  <div className={`flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar transition-all duration-500 ${!isStopped ? 'opacity-40 grayscale pointer-events-none' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {ratings.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => rateSession(r)}
                        className={`shrink-0 ${PILL_CLASSES} !text-xs ${
                          state.pendingSession?.rating === r
                            ? 'bg-primary/10 border-primary/40 !text-primary'
                            : 'hover:border-text-tertiary text-text-secondary'
                        } ${!isStopped && !isIdle ? 'opacity-40 grayscale pointer-events-none' : ''} ${!isStopped && isIdle ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                        style={{ 
                          fontSize: '12px', 
                          transform: 'none', 
                          WebkitTransform: 'none'
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
              </div>
            )}

            <div className="space-y-3">
              <p className="timer-display overflow-hidden text-text-primary" data-testid="timer-display">
                {formattedElapsed}
              </p>
              <p className="flex items-center justify-center gap-1.5 text-sm text-text-secondary sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70 -translate-y-[0.5px]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Secured locally. Never shared.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="w-full">
              <button
                className="w-full min-h-12 rounded-lg bg-primary px-5 py-4 text-sm font-semibold text-text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
                data-testid="primary-timer-button"
                disabled={isStopDisabled}
                onClick={isStopped ? () => resetSession() : isActive ? () => stopSession(customName, selectedMethod || undefined) : () => startSession(customName)}
                type="button"
              >
                {primaryActionLabel}
              </button>
            </div>
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

        </div>

        <div className="grid gap-4">

          <section className="rounded-lg border border-border-subtle bg-bg-overlay px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-text-secondary">
                  Recent secured sessions
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary -translate-y-[0.5px]">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Anonymous records stored locally inside your device only.
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
                    <li
                      className="flex min-h-[4.5rem] items-center rounded-md bg-bg-base px-4"
                      key={session.session_id}
                    >
                      {activeDeleteId === session.session_id ? (
                        <div className="flex w-full items-center justify-between gap-2">
                          <p className="shrink-0 text-sm text-text-secondary">Delete session?</p>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              aria-label="Confirm deletion"
                              className="rounded-full p-2 text-error transition hover:bg-error/10"
                              onClick={async () => {
                                setActiveDeleteId(null);
                                await removeSession(session.session_id);
                              }}
                              type="button"
                            >
                              <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                            <button
                              aria-label="Cancel deletion"
                              className="rounded-full p-2 text-text-tertiary transition hover:bg-bg-overlay hover:text-text-primary"
                              onClick={() => setActiveDeleteId(null)}
                              type="button"
                            >
                              <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                <line x1="18" x2="6" y1="6" y2="18" />
                                <line x1="6" x2="18" y1="6" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-lg font-semibold text-text-primary">
                                {formatDuration(session.duration_seconds)}
                              </p>
                              {session.method && (
                                <span className="flex items-center justify-center h-4 rounded-full border border-border bg-bg-overlay px-0.5 text-[11px] font-semibold font-sans uppercase tracking-widest text-text-secondary leading-none">
                                  {session.method}
                                </span>
                              )}
                              {session.rating && (
                                <span className="flex items-center justify-center h-4 rounded-full border border-border bg-bg-overlay px-0.5 text-[11px] font-semibold font-sans uppercase tracking-widest text-text-secondary leading-none">
                                  {session.rating}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <span className="uppercase tracking-wider">
                                {new Date(session.start_time).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {session.custom_name && (
                                <>
                                  <span className="text-text-tertiary">•</span>
                                  <span className="font-medium text-text-tertiary truncate max-w-[120px]">
                                    {session.custom_name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            aria-label="Delete session"
                            className="shrink-0 rounded p-2 text-text-tertiary transition hover:bg-error/10 hover:text-error"
                            onClick={() => setActiveDeleteId(session.session_id)}
                            type="button"
                          >
                            <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
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
          {APP_VERSION}
        </span>
      </div>
    </main>
  );
}

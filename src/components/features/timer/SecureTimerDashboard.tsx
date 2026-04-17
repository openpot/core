'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Footer } from '@/components/ui/Footer';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { listAllSessions } from '@/lib/db/session-db';
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
  const [isIOS, setIsIOS] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);
  const [isEditingStrains, setIsEditingStrains] = useState(false);
  const [isRatingDismissed, setIsRatingDismissed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('openpot:install-banner-dismissed') === '1';
  });

  const methods = ['Flower', 'Vape', 'Extract', 'Edible', 'Drink', 'Tincture'];
  const ratings = ["Dialed In", "Mellow", "Mid", "Too Heavy"];

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    setIsInstalled(isStandaloneMode());
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);


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

  const handleExportCSV = useCallback(async () => {
    try {
      const allSessions = await listAllSessions();
      if (allSessions.length === 0) return;

      const headers = ['Date', 'Time', 'Item', 'Method', 'Duration (sec)', 'Rating'];
      const rows = allSessions.map(s => {
        const dateObj = new Date(s.start_time);
        return [
          dateObj.toLocaleDateString(),
          dateObj.toLocaleTimeString(),
          s.custom_name || 'Unnamed',
          s.method || 'N/A',
          Math.floor((Date.parse(s.end_time) - Date.parse(s.start_time)) / 1000),
          s.rating || 'Unrated'
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `openpot_full_log_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export sessions:', err);
    }
  }, []);

  const isIdle = state.status === TIMER_STATUS.READY;
  const isActive = state.status === TIMER_STATUS.ACTIVE;
  const isStopped = state.status === TIMER_STATUS.STOPPED;

  useEffect(() => {
    if (isActive) {
      setIsRatingDismissed(false);
    }
  }, [isActive]);

  const isStopDisabled = isActive && state.elapsedMs < 1000;

  const primaryActionLabel = isStopped 
    ? 'New Session' 
    : isActive 
      ? 'Stop Session' 
      : 'Start Session';
  
  const showInstallPromotion = !isInstalled && !isDismissed;

  const dismissInstallBanner = useCallback(() => {
    localStorage.setItem('openpot:install-banner-dismissed', '1');
    setIsDismissed(true);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <section className="panel-shell relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-6 overflow-hidden px-5 py-6 sm:px-8 sm:py-8" data-testid="timer-shell">
        <header className="flex flex-row items-center justify-center gap-1.5 border-b border-border-subtle pb-6 pt-2">
          <LogoMark aria-hidden="true" className="h-[38px] w-auto text-text-primary sm:h-[45px]" />
          <div className="flex flex-col items-start gap-1 leading-none">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl leading-none">
              Openpot
            </h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-text-secondary sm:text-[10px] leading-none">
              Secure Session Tracker
            </p>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-8">
          <div className="space-y-8 text-center">

            {(
              <div className="mx-0 w-full space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
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

          {showInstallPromotion ? (
            <section className="relative rounded-lg border border-border-subtle bg-bg-overlay/50 px-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Dismiss button */}
              <button
                type="button"
                aria-label="Dismiss install banner"
                onClick={dismissInstallBanner}
                className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-bg-subtle hover:text-text-primary active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pr-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                      Install Openpot
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary leading-normal">
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
                  {recentSessions.length > 0 && (
                    <>
                      {' '}
                      <button 
                        onClick={() => void handleExportCSV()}
                        className="text-primary hover:text-primary-hover font-bold transition-colors"
                      >
                        Download full log as CSV.
                      </button>
                    </>
                  )}
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

      {isStopped && !isRatingDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="panel-shell w-full max-w-[320px] p-6 animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-[11px] font-bold tracking-widest text-text-primary uppercase opacity-90">
                How was your session?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ratings.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    rateSession(r);
                    setIsRatingDismissed(true);
                  }}
                  className={`${PILL_CLASSES} !w-full !max-w-none !min-w-0 !text-[11px] !min-h-[44px] !px-2 border-border-subtle bg-bg-overlay hover:border-primary/40 hover:text-primary transition-all`}
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsRatingDismissed(true)}
                className={`${PILL_CLASSES} !w-full !max-w-none !min-w-0 !text-[10px] !min-h-[44px] col-span-2 mt-1 border-border-subtle hover:border-border bg-bg-subtle/50 hover:bg-bg-subtle text-text-tertiary hover:text-text-secondary transition-all opacity-80`}
              >
                SKIP
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

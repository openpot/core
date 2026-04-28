'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Footer } from '@/components/ui/Footer';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { listAllSessions, updateSessionDuration } from '@/lib/db/session-db';
import { useSecureTimer } from '@/hooks/use-secure-timer';
import { formatDuration, TIMER_STATUS } from '@/lib/timer/timer-machine';
import { AmountInputModal } from '@/components/features/timer/AmountInputModal';
import { DurationEditModal } from './DurationEditModal';
import { MonthlyQuotaCard } from './MonthlyQuotaCard';
import { QuotaWarningModal } from './QuotaWarningModal';
import { InstallPromotionBanner } from './InstallPromotionBanner';
import { SessionHistoryList } from './SessionHistoryList';
import { exportSessionsToCSV } from '@/lib/utils/export-csv';
import { usePwaInstall } from '@/hooks/use-pwa-install';


const PILL_CLASSES = "inline-flex items-center justify-center h-9 min-w-[85px] rounded-full border border-border bg-bg-overlay px-4 text-xs font-semibold font-sans uppercase tracking-widest text-text-secondary transition-all leading-none";

const DEFAULT_METHODS = ['Flower', 'Vape', 'Extract', 'Edible', 'Drink', 'Tincture'];
const METHODS_KEY = 'openpot:methods_order';

import { APP_VERSION } from '@/lib/version';
import type { SessionRecord } from '@/types/session';

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
    amount,
    setAmount,
    amountUnit,
    setAmountUnit,
    rateSession,
    startSession,
    stopSession,
    resetSession,
    refreshHistory,
  } = useSecureTimer();
  
  const {
    installApp,
    dismissInstallBanner,
    showInstallPromotion,
    isIOSInstallModalOpen,
    setIsIOSInstallModalOpen,
  } = usePwaInstall();

  const [isEditingStrains, setIsEditingStrains] = useState(false);
  const [isRatingDismissed, setIsRatingDismissed] = useState(false);

  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<string | null>(null);
  const [methods, setMethods] = useState<string[]>(DEFAULT_METHODS);
  const [displayMethods, setDisplayMethods] = useState<string[]>(DEFAULT_METHODS);
  const [displayGhost, setDisplayGhost] = useState<string[]>(ghostLibrary);
  const [isEditDurationModalOpen, setIsEditDurationModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);
  const methodsScrollRef = useRef<HTMLDivElement>(null);
  const strainsScrollRef = useRef<HTMLDivElement>(null);
  const [fullSessions, setFullSessions] = useState<SessionRecord[]>([]);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);

  // Fetch full sessions for quota tracking
  const loadFullHistory = useCallback(async () => {
    try {
      const all = await listAllSessions();
      setFullSessions(all);
    } catch (err) {
      console.error('Failed to load full history:', err);
    }
  }, []);

  useEffect(() => {
    loadFullHistory();
  }, [loadFullHistory, recentSessions]);

  const handleDurationSave = async (newSeconds: number) => {
    if (editingSession) {
      await updateSessionDuration(editingSession.session_id, newSeconds);
      await refreshHistory();
      setIsEditDurationModalOpen(false);
      setEditingSession(null);
    }
  };

  const handleMethodClick = (m: string) => {
    if (selectedMethod === m) {
      // Re-open modal pre-filled with existing amount to edit
      setPendingMethod(m);
      setIsAmountModalOpen(true);
    } else {
      setPendingMethod(m);
      setIsAmountModalOpen(true);
    }
  };

  const handleAmountSave = (savedAmount: number | undefined, savedUnit: 'g' | 'mg') => {
    if (pendingMethod) {
      setSelectedMethod(pendingMethod);
    }
    setAmount(savedAmount);
    setAmountUnit(savedUnit);
    setIsAmountModalOpen(false);
    setPendingMethod(null);
  };

  const handleAmountClose = () => {
    setIsAmountModalOpen(false);
    setPendingMethod(null);
  };

  const handleTryStartSession = useCallback(() => {
    // Calculate current month's total in grams
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const currentTotalG = fullSessions.reduce((acc, s) => {
      const sessionDate = new Date(s.start_time);
      if (sessionDate >= firstOfMonth) {
        const grams = s.amount || 0;
        return acc + grams;
      }
      return acc;
    }, 0);

    const inputG = amount || 0;
    
    if (currentTotalG + inputG > 50.0) {
      setShowQuotaWarning(true);
    } else {
      startSession(customName);
    }
  }, [fullSessions, amount, customName, startSession]);

  const ratings = ["Dialed In", "Mellow", "Mid", "Too Heavy"];


  useEffect(() => {
    try {
      const saved = localStorage.getItem(METHODS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = Array.from(new Set([...parsed, ...DEFAULT_METHODS]))
            .filter(m => DEFAULT_METHODS.includes(m as string));
          setMethods(merged as string[]);
        }
      }
    } catch { }
  }, []);

  const handleExportCSV = useCallback(async () => {
    try {
      const allSessions = await listAllSessions();
      await exportSessionsToCSV(allSessions);
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
      setIsEditingStrains(false);
      // Reset scroll positions of input pill rows
      if (methodsScrollRef.current) methodsScrollRef.current.scrollLeft = 0;
      if (strainsScrollRef.current) strainsScrollRef.current.scrollLeft = 0;
    }
  }, [isActive]);

  // Push used method to front ONLY after starting a new session
  useEffect(() => {
    if (isActive && selectedMethod) {
      setMethods(prev => {
        if (prev[0] === selectedMethod) return prev;
        const next = [selectedMethod, ...prev.filter(m => m !== selectedMethod)];
        try { localStorage.setItem(METHODS_KEY, JSON.stringify(next)); } catch { }
        return next;
      });
    }
  }, [isActive, selectedMethod]);

  const isStopDisabled = isActive && state.elapsedMs < 1000;

  // Sync display states and handle Smart Strain Filtering
  useEffect(() => {
    if (isIdle) {
      setDisplayMethods(methods);
      
      // Smart Filtering:
      // 1. If input is empty, show Top 3 most recently used
      if (!customName.trim()) {
        setDisplayGhost(ghostLibrary.slice(0, 3));
      } else {
        // 2. While typing, show up to 10 matching strains from the whole library
        const searchTerm = customName.toLowerCase().trim();
        const filtered = ghostLibrary
          .filter(name => name.toLowerCase().includes(searchTerm))
          .slice(0, 10);
        setDisplayGhost(filtered);
      }
    }
  }, [isIdle, methods, ghostLibrary, customName]);

  const primaryActionLabel = isStopped
    ? 'New Session'
    : isActive
      ? 'Stop Session'
      : 'Start Session';


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-4 py-6 sm:px-6 sm:py-12 min-w-0">
      <section className="panel-shell relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-6 overflow-hidden px-4 py-6 sm:px-8 sm:py-8 min-w-0" data-testid="timer-shell">
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
            <InstallPromotionBanner 
              showInstallPromotion={showInstallPromotion} 
              dismissInstallBanner={dismissInstallBanner} 
              installApp={installApp} 
            />

            {(
              <div className="mx-0 w-full space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-[3.84px] text-left">
                  <div className="flex items-center gap-1.5 relative group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary text-left">
                      HOW ARE YOU CONSUMING?
                    </p>
                  </div>
                  <div 
                    ref={methodsScrollRef}
                    className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {displayMethods.map((m) => {
                      const hasAmount = selectedMethod === m && amount !== undefined && amountUnit;
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={!isIdle}
                          onClick={() => handleMethodClick(m)}
                          className={`shrink-0 ${PILL_CLASSES} !text-xs ${selectedMethod === m
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
                          {hasAmount && (
                            <>
                              <div className={`mx-2.5 h-4 w-px shrink-0 ${selectedMethod === m ? 'bg-primary/30' : 'bg-border'}`} />
                              <span className="normal-case">
                                {amountUnit === 'mg'
                                  ? parseFloat((amount * 1000).toFixed(3)).toString()
                                  : parseFloat(amount.toFixed(3)).toString()
                                }
                                {amountUnit}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-[4.8px] text-left">
                  <div className="flex items-center gap-0">
                    <label htmlFor="custom-name" className="block text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      WHAT ARE YOU TRACKING?
                    </label>

                    {isIdle && (
                      <button
                        type="button"
                        onClick={() => setIsEditingStrains(!isEditingStrains)}
                        className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${isEditingStrains
                            ? 'bg-primary text-text-inverse shadow-sm'
                            : 'text-text-tertiary hover:bg-bg-overlay hover:text-text-secondary'
                          }`}
                        aria-label={isEditingStrains ? "Disable edit mode" : "Enable edit mode"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
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
                  <div className="h-10">
                    {displayGhost.length > 0 && (
                      <div 
                        ref={strainsScrollRef}
                        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar" 
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {displayGhost.map((name) => (
                          <div
                            key={name}
                            className={`shrink-0 flex items-center h-9 min-w-[85px] rounded-full border transition-all overflow-hidden ${customName === name
                                ? 'bg-primary/10 border-primary/40'
                                : 'bg-bg-overlay border-border hover:border-text-tertiary'
                              } ${!isIdle && customName !== name ? 'opacity-40 grayscale pointer-events-none' : ''} ${!isIdle && customName === name ? 'pointer-events-none' : ''}`}
                          >
                            <button
                              type="button"
                              disabled={!isIdle}
                              onClick={() => setCustomName(name)}
                              className={`flex flex-1 items-center justify-center h-full text-xs font-semibold font-sans tracking-widest transition-colors leading-none ${isEditingStrains ? 'pl-4 pr-3' : 'px-4'
                                } ${customName === name ? '!text-primary' : 'text-text-secondary'
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
                                  className={`px-3 h-full flex items-center justify-center transition-colors animate-in fade-in zoom-in-95 duration-200 ${customName === name
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
                </div>


                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
              </div>
            )}

            <div className="space-y-1">
              <p className="timer-display overflow-hidden text-text-primary" data-testid="timer-display">
                {formattedElapsed}
              </p>
              <p className="flex items-center justify-center gap-1.5 text-sm text-text-secondary sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70 -translate-y-[0.5px]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
                onClick={isStopped ? () => resetSession() : isActive ? () => stopSession(customName, selectedMethod || undefined) : () => handleTryStartSession()}
                type="button"
              >
                {primaryActionLabel}
              </button>
            </div>
          </div>

          <MonthlyQuotaCard sessions={fullSessions} />

        </div>

        <div className="grid gap-4">

          <section className="rounded-lg border border-border-subtle bg-bg-overlay px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-text-secondary">
                  Recent secured sessions
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary -translate-y-[0.5px]">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

            <div className="mt-4 w-full min-w-0 overflow-hidden" data-testid="session-list">
              <SessionHistoryList
                isLoadingHistory={isLoadingHistory}
                historyError={historyError}
                recentSessions={recentSessions}
                removeSession={removeSession}
                onEditDuration={(session) => {
                  setEditingSession(session);
                  setIsEditDurationModalOpen(true);
                }}
              />
            </div>
          </section>
        </div>
      </section>

      {isStopped && !isRatingDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="panel-shell w-full max-w-[320px] p-6 animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-[11px] font-bold tracking-widest text-text-primary uppercase opacity-90">
                How are you feeling?
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
                className="w-full h-10 rounded-lg border border-error bg-error text-[11px] font-bold text-white hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm col-span-2 mt-1"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <AmountInputModal
        isOpen={isAmountModalOpen}
        methodName={pendingMethod || ''}
        initialAmount={amount}
        initialUnit={amountUnit}
        onClose={handleAmountClose}
        onSave={handleAmountSave}
      />
      {editingSession && (
        <DurationEditModal
          isOpen={isEditDurationModalOpen}
          onClose={() => setIsEditDurationModalOpen(false)}
          onSave={handleDurationSave}
          currentDurationSeconds={editingSession.duration_seconds}
        />
      )}

      <QuotaWarningModal 
        isOpen={showQuotaWarning}
        onClose={() => setShowQuotaWarning(false)}
        onConfirm={() => {
          setShowQuotaWarning(false);
          startSession(customName);
        }}
      />

      {/* iOS Install Instructions Modal */}
      {isIOSInstallModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-bg-base/80 backdrop-blur-md p-4 animate-in fade-in slide-in-from-bottom-full duration-500 sm:items-center">
          <div className="panel-shell w-full max-w-[360px] p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setIsIOSInstallModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-bg-subtle hover:text-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">
                Install Openpot on iOS
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                To install this app on your iPhone or iPad, follow these simple steps:
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-bg-overlay p-4 border border-border-subtle">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-base border border-border">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 3v18" /><path d="M3 12h18" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  1. Tap the <span className="font-bold">Share</span> icon in Safari.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-base border border-border">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 9v6" /><path d="M9 12h6" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  2. Select <span className="font-bold text-primary">Add to Home Screen</span>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsIOSInstallModalOpen(false)}
              className="mt-2 w-full h-11 rounded-lg bg-primary text-sm font-bold text-text-inverse hover:bg-primary-hover transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

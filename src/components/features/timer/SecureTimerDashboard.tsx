'use client';

import { Logo } from '@/components/ui/Logo';
import { useSecureTimer } from '@/hooks/use-secure-timer';
import { TIMER_STATUS } from '@/lib/timer/timer-machine';
import { formatDuration } from '@/lib/utils/format-duration';
import { SYNC_STATUS } from '@/types/session';

import type { SessionRecord } from '@/types/session';

function getStatusCopy(status: string): string {
  if (status === TIMER_STATUS.ACTIVE) {
    return 'Active';
  }

  if (status === TIMER_STATUS.STOPPED) {
    return 'Stopped';
  }

  return 'Ready';
}

function getSyncTone(syncStatus: SessionRecord['sync_status']): string {
  if (syncStatus === SYNC_STATUS.SYNCED) {
    return 'var(--color-sync-synced)';
  }

  if (syncStatus === SYNC_STATUS.ERROR) {
    return 'var(--color-sync-error)';
  }

  return 'var(--color-sync-pending)';
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
    networkStatus,
    recentSessions,
    state,
    summary,
    startSession,
    stopSession,
    syncWorkerNow,
  } = useSecureTimer();

  const isActive = state.status === TIMER_STATUS.ACTIVE;
  const isStopped = state.status === TIMER_STATUS.STOPPED;
  const primaryActionLabel = isActive ? 'Stop' : isStopped ? 'Start Another Session' : 'Start';

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="ambient-orb -left-16 -top-12 h-40 w-40 sm:h-56 sm:w-56" />
      <div className="ambient-orb -bottom-20 -right-8 h-48 w-48 sm:h-64 sm:w-64" />

      <section className="panel-shell relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-6 overflow-hidden px-5 py-6 sm:px-8 sm:py-8" data-testid="timer-shell">
        <header className="flex flex-col gap-4 border-b border-border-subtle pb-5">
          <Logo aria-hidden="true" className="h-12 w-auto text-text-primary sm:h-14" />
          <div className="space-y-1">
            <h1 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Secure Timer MVP
            </h1>
            <p className="max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
              Private session timing that stays on-device first and syncs without identity.
            </p>
          </div>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="min-h-12 rounded-lg bg-primary px-5 py-4 text-sm font-semibold text-text-inverse transition hover:bg-primary-hover"
              data-testid="primary-timer-button"
              onClick={isActive ? stopSession : startSession}
              type="button"
            >
              {primaryActionLabel}
            </button>
            <button
              className="min-h-12 rounded-lg border border-border bg-transparent px-5 py-4 text-sm font-semibold text-text-primary transition hover:bg-bg-subtle disabled:cursor-not-allowed disabled:text-text-tertiary"
              data-testid="sync-now-button"
              disabled={summary.pendingCount === 0 || networkStatus === 'offline'}
              onClick={syncWorkerNow}
              type="button"
            >
              Sync Now
            </button>
          </div>

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

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border-subtle bg-bg-overlay px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Sync engine
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Dedicated worker monitoring the local queue.
                </p>
              </div>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-primary"
                data-testid="sync-state"
              >
                <span
                  className="status-dot"
                  style={{
                    backgroundColor:
                      networkStatus === 'online'
                        ? 'var(--color-sync-synced)'
                        : 'var(--color-sync-offline)',
                  }}
                />
                {networkStatus}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-md bg-bg-base px-3 py-3">
                <dt className="text-xs uppercase tracking-wider text-text-secondary">
                  Pending
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-text-primary" data-testid="pending-count">
                  {summary.pendingCount}
                </dd>
              </div>
              <div className="rounded-md bg-bg-base px-3 py-3">
                <dt className="text-xs uppercase tracking-wider text-text-secondary">
                  Synced
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-text-primary">
                  {summary.syncedCount}
                </dd>
              </div>
              <div className="rounded-md bg-bg-base px-3 py-3">
                <dt className="text-xs uppercase tracking-wider text-text-secondary">
                  Errors
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-text-primary">
                  {summary.errorCount}
                </dd>
              </div>
            </dl>
          </section>

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
                    <li className="flex items-center justify-between gap-3 rounded-md bg-bg-base px-4 py-3" key={session.session_id}>
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
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-primary">
                        <span className="status-dot" style={{ backgroundColor: getSyncTone(session.sync_status) }} />
                        {session.sync_status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

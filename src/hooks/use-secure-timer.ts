'use client';

import { startTransition, useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { flushPendingSessions, getSessionSummary, listRecentSessions, queueSession } from '@/lib/db/session-db';
import {
  createSessionRecord,
  formatDuration,
  getInitialTimerState,
  timerReducer,
  TIMER_STATUS,
} from '@/lib/timer/timer-machine';

import type { SessionSummary } from '@/lib/db/session-db';
import type { SessionRecord } from '@/types/session';

const EMPTY_SUMMARY: SessionSummary = {
  totalCount: 0,
  pendingCount: 0,
  syncedCount: 0,
  errorCount: 0,
};

interface WorkerSummaryMessage {
  type: 'sync-summary';
  summary: SessionSummary;
}

interface WorkerRefreshMessage {
  type: 'refresh-required';
}

type WorkerMessage = WorkerSummaryMessage | WorkerRefreshMessage;

/**
 * Coordinates the timer state machine, local persistence, and background sync worker.
 *
 * @returns Timer state, recent sessions, sync metrics, and UI event handlers.
 */
export function useSecureTimer() {
  const [state, dispatch] = useReducer(timerReducer, undefined, getInitialTimerState);
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);
  const [summary, setSummary] = useState<SessionSummary>(EMPTY_SUMMARY);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string>();
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const workerRef = useRef<Worker | null>(null);
  const fallbackIntervalRef = useRef<number | undefined>(undefined);
  const fallbackSyncInFlightRef = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const [sessions, nextSummary] = await Promise.all([listRecentSessions(), getSessionSummary()]);

      startTransition(() => {
        setRecentSessions(sessions);
        setSummary(nextSummary);
        setHistoryError(undefined);
        setIsLoadingHistory(false);
      });
    } catch {
      startTransition(() => {
        setHistoryError('Unable to read the secure session history right now.');
        setIsLoadingHistory(false);
      });
    }
  }, []);

  const runFallbackSync = useCallback(async () => {
    if (typeof window === 'undefined' || fallbackSyncInFlightRef.current) {
      return;
    }

    fallbackSyncInFlightRef.current = true;

    try {
      const result = await flushPendingSessions(window.navigator.onLine);

      if (result.refreshRequired) {
        await loadSessions();
        return;
      }

      startTransition(() => {
        setSummary(result.summary);
      });
    } catch {
      startTransition(() => {
        setHistoryError('Unable to refresh the secure sync queue right now.');
      });
    } finally {
      fallbackSyncInFlightRef.current = false;
    }
  }, [loadSessions]);

  const requestSync = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'sync' });
      return;
    }

    void runFallbackSync();
  }, [runFallbackSync]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      switch (message.type) {
        case 'sync-summary': {
          const nextSummary = message.summary;

          startTransition(() => {
            setSummary(nextSummary);
          });
          break;
        }
        case 'refresh-required':
          void loadSessions();
          break;
      }
    };

    const startFallbackSyncLoop = () => {
      if (fallbackIntervalRef.current !== undefined) {
        return;
      }

      fallbackIntervalRef.current = window.setInterval(() => {
        void runFallbackSync();
      }, 5000);
    };

    const stopFallbackSyncLoop = () => {
      if (fallbackIntervalRef.current === undefined) {
        return;
      }

      window.clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = undefined;
    };

    const activateFallbackSync = () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      startFallbackSyncLoop();
    };

    const updateNetworkStatus = () => {
      const nextStatus = navigator.onLine ? 'online' : 'offline';

      startTransition(() => {
        setNetworkStatus(nextStatus);
      });

      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'sync' });
        return;
      }

      void runFallbackSync();
    };

    try {
      const worker = new Worker(new URL('../workers/sync.worker.ts', import.meta.url), {
        type: 'module',
        name: 'openpot-sync-worker',
      });

      workerRef.current = worker;
      stopFallbackSyncLoop();

      worker.addEventListener('message', handleWorkerMessage);
      worker.addEventListener('error', activateFallbackSync);
    } catch {
      activateFallbackSync();
    }

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      if (workerRef.current) {
        workerRef.current.removeEventListener('message', handleWorkerMessage);
        workerRef.current.terminate();
        workerRef.current = null;
      }

      stopFallbackSyncLoop();
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [loadSessions, runFallbackSync]);

  useEffect(() => {
    if (state.status !== TIMER_STATUS.ACTIVE || state.startedAt === undefined) {
      return;
    }

    const tick = () => {
      dispatch({ type: 'TICK', now: Date.now() });
    };

    tick();
    const intervalId = window.setInterval(() => {
      tick();
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.startedAt, state.status]);

  useEffect(() => {
    if (!state.notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'DISMISS_NOTICE' });
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state.notice]);

  const startSession = useCallback(() => {
    dispatch({ type: 'START', startedAt: Date.now() });
  }, []);

  const stopSession = useCallback(async () => {
    if (state.status !== TIMER_STATUS.ACTIVE || state.startedAt === undefined) {
      return;
    }

    const session = createSessionRecord(state.startedAt, Date.now());
    dispatch({ type: 'STOP', session });

    const result = await queueSession(session);

    if (!result.ok) {
      dispatch({ type: 'SAVE_FAILURE', message: result.error });
      return;
    }

    dispatch({ type: 'SAVE_SUCCESS', session: result.value });
    await loadSessions();
    requestSync();
  }, [loadSessions, requestSync, state.startedAt, state.status]);

  return {
    formattedElapsed: formatDuration(state.elapsedMs / 1000),
    historyError,
    isLoadingHistory,
    networkStatus,
    recentSessions,
    state,
    summary,
    startSession,
    stopSession,
    syncWorkerNow: requestSync,
  };
}

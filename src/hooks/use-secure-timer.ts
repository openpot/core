'use client';

import { startTransition, useCallback, useEffect, useReducer, useState } from 'react';

import { deleteGhostName, deleteSession, getGhostLibrary, listRecentSessions, queueSession, saveGhostName, updateSessionRating } from '@/lib/db/session-db';
import {
  ACTIVE_SESSION_KEY,
  createSessionRecord,
  formatDurationFull,
  getInitialTimerState,
  timerReducer,
  TIMER_STATUS,
} from '@/lib/timer/timer-machine';

import type { SessionRecord } from '@/types/session';

/**
 * Coordinates the timer state machine and local persistence.
 *
 * @returns Timer state, recent sessions, and UI event handlers.
 */
export function useSecureTimer() {
  const [state, dispatch] = useReducer(timerReducer, undefined, getInitialTimerState);
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);
  const [ghostLibrary, setGhostLibrary] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string>();
  const [customName, setCustomName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [amountUnit, setAmountUnit] = useState<'g' | 'mg' | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const activeString = window.localStorage.getItem(ACTIVE_SESSION_KEY);
      if (activeString) {
        try {
          const data = JSON.parse(activeString);
          if (data && typeof data === 'object' && typeof data.startedAt === 'number') {
            const startedAt = data.startedAt;
            if (startedAt <= Date.now()) {
              if (data.customName) setCustomName(String(data.customName));
              if (data.method) setSelectedMethod(String(data.method));
              if (data.amount !== undefined) setAmount(Number(data.amount));
              if (data.amountUnit) setAmountUnit(data.amountUnit as 'g' | 'mg');
              dispatch({ type: 'START', startedAt });
              return;
            }
          }
        } catch {
          const startedAt = parseInt(activeString, 10);
          if (!isNaN(startedAt) && startedAt <= Date.now()) {
            dispatch({ type: 'START', startedAt });
            return;
          }
        }
        window.localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    } catch { }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const [sessions, nextGhostLibrary] = await Promise.all([
        listRecentSessions(),
        getGhostLibrary(),
      ]);

      startTransition(() => {
        setRecentSessions(sessions);
        setGhostLibrary(nextGhostLibrary);
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

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

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

  const startSession = useCallback((name?: string, method?: string, sessionAmount?: number, sessionAmountUnit?: 'g' | 'mg') => {
    const startedAt = Date.now();
    const effectiveName = name ?? customName;
    const effectiveMethod = method ?? selectedMethod;
    const effectiveAmount = sessionAmount ?? amount;
    const effectiveAmountUnit = sessionAmountUnit ?? amountUnit;

    try {
      window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
        startedAt,
        customName: effectiveName,
        method: effectiveMethod,
        amount: effectiveAmount,
        amountUnit: effectiveAmountUnit
      }));
    } catch { }

    if (effectiveName) {
      void saveGhostName(effectiveName).then(() => {
        void getGhostLibrary().then(setGhostLibrary);
      });
    }

    dispatch({ type: 'START', startedAt });
  }, [customName, selectedMethod, amount, amountUnit]);

  const removeSession = useCallback(async (sessionId: string) => {
    await deleteSession(sessionId);
    await loadSessions();
  }, [loadSessions]);

  const stopSession = useCallback(async (
    argName?: string,
    argMethod?: string,
    argAmount?: number,
    argAmountUnit?: 'g' | 'mg'
  ) => {
    if (state.status !== TIMER_STATUS.ACTIVE || state.startedAt === undefined) {
      return;
    }

    try {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch { }

    const effectiveName = argName ?? customName;
    const effectiveMethod = argMethod ?? selectedMethod;
    const effectiveAmount = argAmount ?? amount;
    const effectiveAmountUnit = argAmountUnit ?? amountUnit;

    const session = createSessionRecord(
      state.startedAt,
      Date.now(),
      effectiveName || undefined,
      effectiveMethod || undefined,
      effectiveAmount,
      effectiveAmountUnit
    );
    dispatch({ type: 'STOP', session });

    await queueSession(session);
    dispatch({ type: 'SAVE_SUCCESS', session });
    await loadSessions();
  }, [loadSessions, state.startedAt, state.status, customName, selectedMethod, amount, amountUnit]);

  const removeGhostSuggestion = useCallback(async (name: string) => {
    await deleteGhostName(name);
    const nextGhostLibrary = await getGhostLibrary();
    setGhostLibrary(nextGhostLibrary);
  }, []);

  const rateSession = useCallback(async (rating: string) => {
    if (!state.pendingSession) {
      return;
    }

    dispatch({ type: 'SET_RATING', rating });
    await updateSessionRating(state.pendingSession.session_id, rating);
    await loadSessions();
  }, [loadSessions, state.pendingSession]);

  const resetSession = useCallback(() => {
    setCustomName('');
    setSelectedMethod(null);
    setAmount(undefined);
    setAmountUnit(undefined);
    dispatch({ type: 'RESET' });
  }, []);

  return {
    formattedElapsed: formatDurationFull(state.elapsedMs / 1000),
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
    refreshHistory: loadSessions,
  };
}

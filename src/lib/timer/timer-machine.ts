import type { SessionRecord } from '@/types/session';

export const ACTIVE_SESSION_KEY = 'openpot_active_session_start';

export const TIMER_STATUS = {
  READY: 'READY',
  ACTIVE: 'ACTIVE',
  STOPPED: 'STOPPED',
} as const;

export const SAVE_STATUS = {
  IDLE: 'IDLE',
  SAVING: 'SAVING',
  SAVED: 'SAVED',
  ERROR: 'ERROR',
} as const;

export type TimerStatus = (typeof TIMER_STATUS)[keyof typeof TIMER_STATUS];
export type SaveStatus = (typeof SAVE_STATUS)[keyof typeof SAVE_STATUS];

export interface TimerState {
  status: TimerStatus;
  elapsedMs: number;
  startedAt?: number;
  pendingSession?: SessionRecord;
  lastSavedSession?: SessionRecord;
  saveStatus: SaveStatus;
  notice?: string;
  errorMessage?: string;
}

export type TimerEvent =
  | { type: 'START'; startedAt: number }
  | { type: 'TICK'; now: number }
  | { type: 'STOP'; session: SessionRecord }
  | { type: 'SAVE_SUCCESS'; session: SessionRecord }
  | { type: 'SAVE_FAILURE'; message: string }
  | { type: 'SET_RATING'; rating: string }
  | { type: 'DISMISS_NOTICE' }
  | { type: 'RESET' };

function formatUuidFromBytes(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));

  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

function generateSessionId(): string {
  const webCrypto = globalThis.crypto;

  if (typeof webCrypto?.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }

  if (typeof webCrypto?.getRandomValues === 'function') {
    const randomBytes = new Uint8Array(16);
    webCrypto.getRandomValues(randomBytes);
    const versionByte = randomBytes[6] ?? 0;
    const variantByte = randomBytes[8] ?? 0;

    randomBytes[6] = (versionByte & 0x0f) | 0x40;
    randomBytes[8] = (variantByte & 0x3f) | 0x80;

    return formatUuidFromBytes(randomBytes);
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

/**
 * Formats elapsed seconds into a full HH:MM:SS string.
 *
 * @param totalSeconds - Elapsed time in whole seconds.
 * @returns A timer string like `00:00:00`.
 */
export function formatDurationFull(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats elapsed seconds into a descriptive HMS string (e.g., 00h 00m 00s).
 *
 * @param totalSeconds - Elapsed time in whole seconds.
 * @returns A descriptive string like `00h 00m 00s`.
 */
export function formatDurationHMS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Formats elapsed seconds into a mobile-safe timer string.
 * (Deprecated: use formatDurationFull or formatDurationHMS instead)
 *
 * @param totalSeconds - Elapsed time in whole seconds.
 * @returns A timer string.
 */
export function formatDuration(totalSeconds: number): string {
  return formatDurationHMS(totalSeconds);
}

/**
 * Returns the baseline timer state used on initial render.
 *
 * @returns A READY timer state with no elapsed time.
 */
export function getInitialTimerState(): TimerState {
  return {
    status: TIMER_STATUS.READY,
    elapsedMs: 0,
    saveStatus: SAVE_STATUS.IDLE,
  };
}

/**
 * Converts raw timestamps into the approved session schema.
 *
 * @param startedAt - Session start time in epoch milliseconds.
 * @param endedAt - Session stop time in epoch milliseconds.
 * @returns An anonymous session record ready for IndexedDB.
 */
export function createSessionRecord(
  startedAt: number,
  endedAt: number,
  customName?: string,
  method?: string,
  amount?: number,
  amountUnit?: 'g' | 'mg',
): SessionRecord {
  const durationSeconds = Math.max(0, Math.floor((endedAt - startedAt) / 1000));

  return {
    session_id: generateSessionId(),
    start_time: new Date(startedAt).toISOString(),
    end_time: new Date(endedAt).toISOString(),
    duration_seconds: durationSeconds,
    custom_name: customName || undefined,
    method: method || undefined,
    amount: amount !== undefined ? amount : undefined,
    amount_unit: amountUnit || undefined,
    sync_status: 'PENDING',
  };
}

/**
 * Advances the secure timer state machine.
 *
 * @param state - Current timer state snapshot.
 * @param event - Transition event to apply.
 * @returns The next timer state.
 */
export function timerReducer(state: TimerState, event: TimerEvent): TimerState {
  switch (event.type) {
    case 'START':
      return {
        status: TIMER_STATUS.ACTIVE,
        elapsedMs: 0,
        startedAt: event.startedAt,
        pendingSession: undefined,
        lastSavedSession: state.lastSavedSession,
        saveStatus: SAVE_STATUS.IDLE,
        notice: undefined,
        errorMessage: undefined,
      };

    case 'TICK':
      if (state.status !== TIMER_STATUS.ACTIVE || state.startedAt === undefined) {
        return state;
      }

      return {
        ...state,
        elapsedMs: Math.max(0, event.now - state.startedAt),
      };

    case 'STOP':
      return {
        ...state,
        status: TIMER_STATUS.STOPPED,
        elapsedMs: event.session.duration_seconds * 1000,
        pendingSession: event.session,
        saveStatus: SAVE_STATUS.SAVING,
        notice: 'Securing locally...',
        errorMessage: undefined,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        pendingSession: event.session,
        lastSavedSession: event.session,
        saveStatus: SAVE_STATUS.SAVED,
        notice: 'Data Secured Locally',
        errorMessage: undefined,
      };

    case 'SAVE_FAILURE':
      return {
        ...state,
        saveStatus: SAVE_STATUS.ERROR,
        notice: undefined,
        errorMessage: event.message,
      };

    case 'SET_RATING':
      if (!state.pendingSession) {
        return state;
      }

      return {
        ...state,
        pendingSession: {
          ...state.pendingSession,
          rating: event.rating,
        },
      };

    case 'DISMISS_NOTICE':
      return {
        ...state,
        notice: undefined,
      };

    case 'RESET':
      return {
        status: TIMER_STATUS.READY,
        elapsedMs: 0,
        saveStatus: SAVE_STATUS.IDLE,
        lastSavedSession: state.lastSavedSession,
      };

    default:
      return state;
  }
}

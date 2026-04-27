import {
  createSessionRecord,
  formatDuration,
  getInitialTimerState,
  SAVE_STATUS,
  timerReducer,
  TIMER_STATUS,
} from '@/lib/timer/timer-machine';
import { SESSION_RECORD_KEYS, SYNC_STATUS } from '@/types/session';
import { afterEach, vi } from 'vitest';

const originalCrypto = globalThis.crypto;

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: originalCrypto,
  });
});

describe('timerReducer', () => {
  it('moves from ready to active and updates elapsed time', () => {
    const startedAt = Date.parse('2026-04-08T12:00:00.000Z');
    const activeState = timerReducer(getInitialTimerState(), {
      type: 'START',
      startedAt,
    });

    expect(activeState.status).toBe(TIMER_STATUS.ACTIVE);
    expect(activeState.elapsedMs).toBe(0);

    const tickingState = timerReducer(activeState, {
      type: 'TICK',
      now: startedAt + 3200,
    });

    expect(tickingState.elapsedMs).toBe(3200);
  });

  it('captures the stopped state and save confirmation', () => {
    const session = createSessionRecord(
      Date.parse('2026-04-08T12:00:00.000Z'),
      Date.parse('2026-04-08T12:00:05.200Z'),
    );

    const stoppedState = timerReducer(getInitialTimerState(), {
      type: 'STOP',
      session,
    });

    expect(stoppedState.status).toBe(TIMER_STATUS.STOPPED);
    expect(stoppedState.saveStatus).toBe(SAVE_STATUS.SAVING);
    expect(stoppedState.notice).toBe('Securing locally...');

    const savedState = timerReducer(stoppedState, {
      type: 'SAVE_SUCCESS',
      session,
    });

    expect(savedState.saveStatus).toBe(SAVE_STATUS.SAVED);
    expect(savedState.lastSavedSession).toEqual(session);
    expect(savedState.notice).toBe('Data Secured Locally');
  });

  it('handles local save failures without losing the stopped snapshot', () => {
    const failureState = timerReducer(
      {
        ...getInitialTimerState(),
        status: TIMER_STATUS.STOPPED,
      },
      {
        type: 'SAVE_FAILURE',
        message: 'Unable to secure the session on this device.',
      },
    );

    expect(failureState.status).toBe(TIMER_STATUS.STOPPED);
    expect(failureState.saveStatus).toBe(SAVE_STATUS.ERROR);
    expect(failureState.errorMessage).toContain('Unable');
  });
});

describe('createSessionRecord', () => {
  it('returns only the approved zero-knowledge fields', () => {
    const session = createSessionRecord(
      Date.parse('2026-04-08T12:00:00.000Z'),
      Date.parse('2026-04-08T12:01:05.900Z'),
    );

    // ensure all returned keys are part of the approved zero-knowledge fields
    const validKeys = new Set(SESSION_RECORD_KEYS);
    Object.keys(session).forEach((key) => {
      expect(validKeys.has(key as any)).toBe(true);
    });
    expect(session.duration_seconds).toBe(65);
  });

  it('falls back when randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {
        getRandomValues: (buffer: Uint8Array) => {
          buffer.set([
            0x10, 0x32, 0x54, 0x76,
            0x98, 0xba, 0xdc, 0xfe,
            0x01, 0x23, 0x45, 0x67,
            0x89, 0xab, 0xcd, 0xef,
          ]);

          return buffer;
        },
      },
    });

    const session = createSessionRecord(
      Date.parse('2026-04-08T12:00:00.000Z'),
      Date.parse('2026-04-08T12:00:05.200Z'),
    );

    expect(session.session_id).toBe('10325476-98ba-4cfe-8123-456789abcdef');
  });
});

describe('formatDuration', () => {
  it('formats zero safely', () => {
    expect(formatDuration(0)).toBe('00h 00m 00s');
  });

  it('pads seconds and minutes', () => {
    expect(formatDuration(125)).toBe('00h 02m 05s');
  });

  it('keeps counting minutes and flows into hours', () => {
    expect(formatDuration(3605)).toBe('01h 00m 05s');
  });
});

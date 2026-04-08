import { NextResponse } from 'next/server';

import { isSyncStatus, SESSION_RECORD_KEYS } from '@/types/session';

function hasOnlyAllowedKeys(value: Record<string, unknown>): boolean {
  const sortedKeys = Object.keys(value).sort();
  const expectedKeys = [...SESSION_RECORD_KEYS].sort();

  return sortedKeys.length === expectedKeys.length && sortedKeys.every((key, index) => key === expectedKeys[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return true;
}

function isValidPayload(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  if (!hasOnlyAllowedKeys(value)) {
    return false;
  }

  return (
    typeof value.session_id === 'string' &&
    typeof value.start_time === 'string' &&
    typeof value.end_time === 'string' &&
    typeof value.duration_seconds === 'number' &&
    Number.isFinite(value.duration_seconds) &&
    value.duration_seconds >= 0 &&
    typeof value.sync_status === 'string' &&
    isSyncStatus(value.sync_status)
  );
}

/**
 * Accepts an anonymous session payload for local queue synchronization.
 *
 * @param request - Incoming HTTP request containing a session payload.
 * @returns A success response when the payload matches the zero-knowledge schema.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!isValidPayload(payload)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid secure session payload.' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Unreadable secure session payload.' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}

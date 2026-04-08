import { getPendingSessions, getSessionSummary, updateSessionSyncStatus } from '@/lib/db/session-db';
import { SYNC_STATUS } from '@/types/session';

import type { SessionSummary } from '@/lib/db/session-db';

export interface QueueFlushResult {
  refreshRequired: boolean;
  summary: SessionSummary;
}

/**
 * Flushes locally pending sessions to the relative sync API while preserving the approved schema.
 *
 * @param isOnline - Whether the current runtime can reach the network.
 * @returns The latest summary plus whether the UI should refresh local history.
 */
export async function flushPendingSessions(isOnline: boolean): Promise<QueueFlushResult> {
  if (!isOnline) {
    return {
      refreshRequired: false,
      summary: await getSessionSummary(),
    };
  }

  const pendingSessions = await getPendingSessions();

  if (pendingSessions.length === 0) {
    return {
      refreshRequired: false,
      summary: await getSessionSummary(),
    };
  }

  let refreshRequired = false;

  for (const session of pendingSessions) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        await updateSessionSyncStatus(session.session_id, SYNC_STATUS.ERROR);
        refreshRequired = true;
        continue;
      }

      await updateSessionSyncStatus(session.session_id, SYNC_STATUS.SYNCED);
      refreshRequired = true;
    } catch {
      break;
    }
  }

  return {
    refreshRequired,
    summary: await getSessionSummary(),
  };
}

import { SESSION_RECORD_KEYS, SYNC_STATUS } from '@/types/session';

import type { SessionRecord, SyncStatus } from '@/types/session';

const DB_NAME = 'openpot-db';
const DB_VERSION = 2;
const SESSION_STORE_NAME = 'sessionQueue';
const GHOST_LIBRARY_STORE_NAME = 'ghostLibrary';
const SYNC_STATUS_INDEX = 'sync_status';

interface ResultSuccess<T> {
  ok: true;
  value: T;
}

interface ResultFailure {
  ok: false;
  error: string;
}

type Result<T> = ResultSuccess<T> | ResultFailure;

export interface SessionSummary {
  totalCount: number;
  pendingCount: number;
  syncedCount: number;
  errorCount: number;
}

export interface QueueFlushResult {
  refreshRequired: boolean;
  summary: SessionSummary;
}

function createDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(SESSION_STORE_NAME)) {
        const store = database.createObjectStore(SESSION_STORE_NAME, {
          keyPath: SESSION_RECORD_KEYS[0],
        });

        store.createIndex(SYNC_STATUS_INDEX, SESSION_RECORD_KEYS[4], { unique: false });
      }

      if (!database.objectStoreNames.contains(GHOST_LIBRARY_STORE_NAME)) {
        database.createObjectStore(GHOST_LIBRARY_STORE_NAME, {
          keyPath: 'name',
        });
      }
    };

    request.onerror = () => {
      reject(request.error ?? new Error('Unable to open the secure session database.'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T> {
  const database = await createDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SESSION_STORE_NAME, mode);
    const store = transaction.objectStore(SESSION_STORE_NAME);
    let callbackResult!: T;
    let callbackFinished = false;
    let transactionFinished = false;
    let settled = false;

    const closeDatabase = () => {
      database.close();
    };

    const rejectOnce = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      closeDatabase();
      reject(error);
    };

    const resolveWhenReady = () => {
      if (!settled && callbackFinished && transactionFinished) {
        settled = true;
        closeDatabase();
        resolve(callbackResult);
      }
    };

    transaction.oncomplete = () => {
      transactionFinished = true;
      resolveWhenReady();
    };

    transaction.onabort = () => {
      rejectOnce(transaction.error ?? new Error('A secure session transaction was aborted.'));
    };

    transaction.onerror = () => {
      rejectOnce(transaction.error ?? new Error('A secure session transaction failed.'));
    };

    Promise.resolve(callback(store))
      .then((value) => {
        callbackResult = value;
        callbackFinished = true;
        resolveWhenReady();
      })
      .catch((error) => {
        try {
          transaction.abort();
        } catch {
          rejectOnce(error);
          return;
        }

        rejectOnce(error);
      });
  });
}

async function withGhostStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T> {
  const database = await createDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(GHOST_LIBRARY_STORE_NAME, mode);
    const store = transaction.objectStore(GHOST_LIBRARY_STORE_NAME);
    let callbackResult!: T;
    let callbackFinished = false;
    let transactionFinished = false;
    let settled = false;

    const closeDatabase = () => {
      database.close();
    };

    const rejectOnce = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      closeDatabase();
      reject(error);
    };

    const resolveWhenReady = () => {
      if (!settled && callbackFinished && transactionFinished) {
        settled = true;
        closeDatabase();
        resolve(callbackResult);
      }
    };

    transaction.oncomplete = () => {
      transactionFinished = true;
      resolveWhenReady();
    };

    transaction.onabort = () => {
      rejectOnce(transaction.error ?? new Error('A ghost library transaction was aborted.'));
    };

    transaction.onerror = () => {
      rejectOnce(transaction.error ?? new Error('A ghost library transaction failed.'));
    };

    Promise.resolve(callback(store))
      .then((value) => {
        callbackResult = value;
        callbackFinished = true;
        resolveWhenReady();
      })
      .catch((error) => {
        try {
          transaction.abort();
        } catch {
          rejectOnce(error);
          return;
        }

        rejectOnce(error);
      });
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function sortByNewest(a: SessionRecord, b: SessionRecord): number {
  return Date.parse(b.start_time) - Date.parse(a.start_time);
}

/**
 * Persists a secure session in the local IndexedDB queue.
 *
 * @param session - Anonymous session payload limited to the approved schema.
 * @returns A result containing the stored session or an explanatory error.
 */
export async function queueSession(session: SessionRecord): Promise<Result<SessionRecord>> {
  try {
    await withStore('readwrite', async (store) => {
      await requestToPromise(store.put(session));
    });

    return { ok: true, value: session };
  } catch {
    return { ok: false, error: 'Unable to secure the session on this device.' };
  }
}

/**
 * Permanently removes a single secure session from the local IndexedDB store.
 *
 * @param sessionId - The unique session identifier to delete.
 * @returns A result describing whether the deletion succeeded.
 */
export async function deleteSession(sessionId: string): Promise<Result<void>> {
  try {
    await withStore('readwrite', async (store) => {
      await requestToPromise(store.delete(sessionId));
    });

    return { ok: true, value: undefined };
  } catch {
    return { ok: false, error: 'Unable to delete the session from this device.' };
  }
}

/**
 * Permanently removes a custom name from the local Ghost Library.
 *
 * @param name - The custom name to remove.
 */
export async function deleteGhostName(name: string): Promise<void> {
  try {
    await withGhostStore('readwrite', async (store) => {
      await requestToPromise(store.delete(name));
    });
  } catch {
    // Ignore ghost library errors to avoid blocking the primary flow.
  }
}

/**
 * Saves a custom name to the local Ghost Library for future suggestions.
 *
 * @param name - The custom name used for a session.
 */
export async function saveGhostName(name: string): Promise<void> {
  if (!name.trim()) return;

  try {
    await withGhostStore('readwrite', async (store) => {
      await requestToPromise(store.put({ name: name.trim(), last_used: Date.now() }));
    });
  } catch {
    // Ignore ghost library errors to avoid blocking the primary flow.
  }
}

/**
 * Returns the 3 most recently used custom names from the Ghost Library.
 *
 * @returns An array of up to 3 unique custom name strings.
 */
export async function getGhostLibrary(): Promise<string[]> {
  try {
    return await withGhostStore('readonly', async (store) => {
      const all = (await requestToPromise(store.getAll())) as { name: string; last_used: number }[];
      return all
        .sort((a, b) => b.last_used - a.last_used)
        .slice(0, 3)
        .map((entry) => entry.name);
    });
  } catch {
    return [];
  }
}

/**
 * Lists the newest locally secured sessions for the dashboard history view.
 *
 * @param limit - Maximum number of sessions to return.
 * @returns A sorted array of recent secure session records.
 */
export async function listRecentSessions(limit = 5): Promise<SessionRecord[]> {
  return withStore('readonly', async (store) => {
    const sessions = (await requestToPromise(store.getAll())) as SessionRecord[];

    return sessions.sort(sortByNewest).slice(0, limit);
  });
}

/**
 * Returns all sessions that are still waiting to sync.
 *
 * @returns Anonymous session records whose sync status is still pending.
 */
export async function getPendingSessions(): Promise<SessionRecord[]> {
  return withStore('readonly', async (store) => {
    const index = store.index(SYNC_STATUS_INDEX);
    const sessions = (await requestToPromise(index.getAll(SYNC_STATUS.PENDING))) as SessionRecord[];

    return sessions.sort(sortByNewest);
  });
}

/**
 * Updates the sync status for a locally stored session.
 *
 * @param sessionId - Stable session identifier.
 * @param syncStatus - Next sync status for the stored record.
 * @returns A result describing whether the status update succeeded.
 */
export async function updateSessionSyncStatus(
  sessionId: string,
  syncStatus: SyncStatus,
): Promise<Result<void>> {
  try {
    await withStore('readwrite', async (store) => {
      const session = (await requestToPromise(store.get(sessionId))) as SessionRecord | undefined;

      if (!session) {
        throw new Error('Missing session record.');
      }

      session.sync_status = syncStatus;
      await requestToPromise(store.put(session));
    });

    return { ok: true, value: undefined };
  } catch {
    return { ok: false, error: 'Unable to update the local sync status.' };
  }
}

/**
 * Summarizes the current IndexedDB queue for UI status messaging.
 *
 * @returns Aggregate counts grouped by sync status.
 */
export async function getSessionSummary(): Promise<SessionSummary> {
  return withStore('readonly', async (store) => {
    const sessions = (await requestToPromise(store.getAll())) as SessionRecord[];

    return sessions.reduce<SessionSummary>(
      (summary, session) => {
        if (session.sync_status === SYNC_STATUS.PENDING) {
          summary.pendingCount += 1;
        }

        if (session.sync_status === SYNC_STATUS.SYNCED) {
          summary.syncedCount += 1;
        }

        if (session.sync_status === SYNC_STATUS.ERROR) {
          summary.errorCount += 1;
        }

        summary.totalCount += 1;
        return summary;
      },
      {
        totalCount: 0,
        pendingCount: 0,
        syncedCount: 0,
        errorCount: 0,
      },
    );
  });
}

/**
 * Flushes pending sessions to the local sync API and returns the updated queue summary.
 *
 * @param isOnline - Whether the current runtime can reach the network.
 * @returns Summary data plus whether recent-session UI should refresh.
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
      // Privacy Firewall: Strip custom_name before syncing to the cloud
      const { custom_name, ...payload } = session;

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const nextStatus = response.ok ? SYNC_STATUS.SYNCED : SYNC_STATUS.ERROR;
      await updateSessionSyncStatus(session.session_id, nextStatus);
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

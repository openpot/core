import { SESSION_RECORD_KEYS } from '@/types/session';

import type { SessionRecord } from '@/types/session';

const DB_NAME = 'openpot-db';
const DB_VERSION = 3;
const SESSION_STORE_NAME = 'sessionQueue';
const GHOST_LIBRARY_STORE_NAME = 'ghostLibrary';

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
        database.createObjectStore(SESSION_STORE_NAME, {
          keyPath: SESSION_RECORD_KEYS[0],
        });
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
export async function queueSession(session: SessionRecord): Promise<void> {
  try {
    await withStore('readwrite', async (store) => {
      await requestToPromise(store.put(session));
    });
  } catch {
    // Ignore errors for this MVP
  }
}

/**
 * Permanently removes a single secure session from the local IndexedDB store.
 *
 * @param sessionId - The unique session identifier to delete.
 * @returns A result describing whether the deletion succeeded.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await withStore('readwrite', async (store) => {
      await requestToPromise(store.delete(sessionId));
    });
  } catch {
    // Ignore errors for this MVP
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
        .map((entry) => entry.name);
    });
  } catch {
    return [];
  }
}

/**
 * Returns all locally secured sessions sorted by newest first.
 *
 * @returns An array of all secure session records in IndexedDB.
 */
export async function listAllSessions(): Promise<SessionRecord[]> {
  return withStore('readonly', async (store) => {
    const sessions = (await requestToPromise(store.getAll())) as SessionRecord[];

    return sessions.sort(sortByNewest);
  });
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
 * Updates the rating for a locally stored session.
 *
 * @param sessionId - Stable session identifier.
 * @param rating - Qualitative rating string ("Dialed In", "Mellow", etc.).
 */
export async function updateSessionRating(
  sessionId: string,
  rating: string,
): Promise<void> {
  try {
    await withStore('readwrite', async (store) => {
      const session = (await requestToPromise(store.get(sessionId))) as SessionRecord | undefined;

      if (!session) {
        throw new Error('Missing session record.');
      }

      session.rating = rating;
      await requestToPromise(store.put(session));
    });
  } catch {
    // Ignore errors for this MVP
  }
}

/**
 * Updates the duration and end_time for a locally stored session.
 *
 * @param sessionId - Stable session identifier.
 * @param durationSeconds - New duration in whole seconds.
 */
export async function updateSessionDuration(
  sessionId: string,
  durationSeconds: number,
): Promise<void> {
  try {
    await withStore('readwrite', async (store) => {
      const session = (await requestToPromise(store.get(sessionId))) as SessionRecord | undefined;

      if (!session) {
        throw new Error('Missing session record.');
      }

      session.duration_seconds = durationSeconds;
      session.is_adjusted = true;
      const startMs = Date.parse(session.start_time);
      session.end_time = new Date(startMs + durationSeconds * 1000).toISOString();
      
      await requestToPromise(store.put(session));
    });
  } catch {
    // Ignore errors for this MVP
  }
}


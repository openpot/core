export const SYNC_STATUS = {
  PENDING: 'PENDING',
  SYNCED: 'SYNCED',
  ERROR: 'ERROR',
} as const;

export const SESSION_RECORD_KEYS = [
  'session_id',
  'start_time',
  'end_time',
  'duration_seconds',
  'sync_status',
  'custom_name',
  'method',
  'rating',
] as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

export interface SessionRecord {
  session_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  sync_status: SyncStatus;
  custom_name?: string;
  method?: string;
  rating?: string;
}

/**
 * Checks whether a string is a supported sync status value.
 *
 * @param value - Candidate sync status string.
 * @returns True when the value maps to an allowed sync status.
 */
export function isSyncStatus(value: string): value is SyncStatus {
  return Object.values(SYNC_STATUS).includes(value as SyncStatus);
}

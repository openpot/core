/**
 * Formats elapsed seconds into a mobile-safe timer string.
 *
 * @param totalSeconds - Elapsed time in whole seconds.
 * @returns A timer string like `00:00` or `61:09`.
 *
 * @example
 * formatDuration(0); // "00:00"
 * formatDuration(125); // "02:05"
 */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

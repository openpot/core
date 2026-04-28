'use client';

import { useState } from 'react';
import type { SessionRecord } from '@/types/session';
import { formatDuration } from '@/lib/timer/timer-machine';

interface SessionHistoryListProps {
  isLoadingHistory: boolean;
  historyError: string | undefined;
  recentSessions: SessionRecord[];
  removeSession: (sessionId: string) => Promise<void>;
  onEditDuration: (session: SessionRecord) => void;
}

/**
 * Renders the list of recently secured sessions, including controls for deletion and duration editing.
 *
 * @param props - State and event handlers for the session history list.
 * @returns A UI component rendering a list of sessions or appropriate loading/error states.
 */
export function SessionHistoryList({
  isLoadingHistory,
  historyError,
  recentSessions,
  removeSession,
  onEditDuration,
}: SessionHistoryListProps) {
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  if (isLoadingHistory) {
    return <p className="text-sm text-text-secondary">Loading secured sessions…</p>;
  }

  if (historyError) {
    return <p className="text-sm text-error">{historyError}</p>;
  }

  if (recentSessions.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No secured sessions yet. Start the timer when you are ready.
      </p>
    );
  }

  return (
    <ul className="space-y-3 w-full min-w-0">
      {recentSessions.map((session, index) => (
        <li
          className="group relative grid grid-cols-[1fr_auto] w-full min-w-0 min-h-[62px] items-center rounded-md bg-bg-base overflow-hidden"
          key={session.session_id}
        >
          {activeDeleteId === session.session_id ? (
            <div className="grid grid-cols-[1fr_auto] w-full items-center gap-2 h-[62px] min-w-0 px-4">
              <p className="min-w-0 text-sm text-error tracking-tight truncate">Delete session?</p>
              <div className="sticky right-0 z-10 flex shrink-0 items-center gap-1 bg-bg-base pl-2">
                <button
                  aria-label="Confirm deletion"
                  className="rounded-full p-2 text-error transition hover:bg-error/10 active:scale-90"
                  onClick={async () => {
                    setActiveDeleteId(null);
                    await removeSession(session.session_id);
                  }}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  aria-label="Cancel deletion"
                  className="rounded-full p-2 text-text-tertiary transition hover:bg-bg-overlay hover:text-text-primary active:scale-90"
                  onClick={() => setActiveDeleteId(null)}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto] w-full items-center gap-2 px-3 min-w-0 h-[62px]">
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 overflow-hidden">
                {/* Row 1: Date Time • Duration + Pencil */}
                <div className="flex items-center gap-1 overflow-hidden min-w-0">
                  <span
                    className="min-w-0 truncate font-sans text-[10px] font-bold uppercase tracking-widest text-text-tertiary leading-none pt-0.5"
                    title={(() => {
                      const d = new Date(session.start_time);
                      const dateStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                      const timeStr = d.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      });
                      return `[${dateStr} ${timeStr}]`;
                    })()}
                  >
                    {(() => {
                      const d = new Date(session.start_time);
                      const dateStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                      const timeStr = d.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      });
                      return `[${dateStr} ${timeStr}]`;
                    })()}
                  </span>

                  <div className="shrink-0 flex items-center gap-2 overflow-hidden min-w-0 ml-1.5">
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={() => onEditDuration(session)}
                        className="shrink-0 flex items-center gap-1 rounded-sm transition-all hover:opacity-70 active:scale-[0.98] touch-manipulation"
                        aria-label="Edit most recent duration"
                      >
                        <p className="shrink-0 font-mono text-sm font-bold text-text-primary leading-none pt-0.5">
                          {formatDuration(session.duration_seconds)}
                        </p>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-text-tertiary"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>
                    ) : (
                      <p className="shrink-0 font-mono text-sm font-bold text-text-primary leading-none pt-0.5">
                        {formatDuration(session.duration_seconds)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Metadata Pills (Method|Amount, Rating, Strain) */}
                {(session.rating || session.method || session.amount !== undefined || session.custom_name) && (
                  <div
                    className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide no-scrollbar min-w-0 h-4.5"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {/* Method | Amount Pill */}
                    {(session.method || session.amount !== undefined) && (
                      <div className="shrink-0 flex items-center h-4.5 rounded-full border border-border bg-bg-overlay px-1.5 text-[10px] font-bold font-sans uppercase tracking-widest text-text-secondary leading-none">
                        {session.method && (
                          <span className={`uppercase ${session.amount !== undefined ? 'mr-1' : ''}`}>
                            {session.method}
                          </span>
                        )}
                        {session.method && session.amount !== undefined && (
                          <span className="mr-1 opacity-30 font-light">|</span>
                        )}
                        {session.amount !== undefined && (
                          <span className="font-mono normal-case">
                            {session.amount_unit === 'mg'
                              ? `${parseFloat((session.amount * 1000).toFixed(1))}mg`
                              : `${parseFloat(session.amount.toFixed(2))}g`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rating Pill */}
                    {session.rating && (
                      <div className="shrink-0 flex items-center h-4.5 rounded-full border border-border bg-bg-overlay px-1.5 text-[10px] font-bold font-sans uppercase tracking-widest text-text-secondary leading-none">
                        {session.rating}
                      </div>
                    )}

                    {/* Strain Pill */}
                    {session.custom_name && (
                      <div className="shrink-0 flex items-center h-4.5 rounded-full border border-border bg-bg-overlay px-1.5 text-[10px] font-bold font-sans uppercase tracking-widest text-text-secondary leading-none">
                        <span className="whitespace-nowrap" title={session.custom_name}>
                          {session.custom_name}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sticky right-0 z-10 flex items-center shrink-0 bg-bg-base pl-2">
                <button
                  aria-label="Delete session"
                  className="shrink-0 rounded-full p-2 text-text-tertiary transition hover:bg-error/10 hover:text-error active:scale-95"
                  onClick={() => setActiveDeleteId(session.session_id)}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

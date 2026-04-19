'use client';

import { useState, useEffect } from 'react';

/**
 * Interface defining the operational parameters for the duration editor.
 */
interface DurationEditModalProps {
  isOpen: boolean;
  currentDurationSeconds: number;
  onClose: () => void;
  onSave: (newDurationSeconds: number) => void;
}

/**
 * A specialized modal for adjusting a session's duration post-completion.
 * Synchronized with the AmountInputModal aesthetic for visual consistency.
 *
 * @returns A high-contrast, centered modal for time correction.
 */
export function DurationEditModal({
  isOpen,
  currentDurationSeconds,
  onClose,
  onSave,
}: DurationEditModalProps) {
  const [hours, setHours] = useState(Math.floor(currentDurationSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((currentDurationSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(currentDurationSeconds % 60);

  useEffect(() => {
    if (isOpen) {
      setHours(Math.floor(currentDurationSeconds / 3600));
      setMinutes(Math.floor((currentDurationSeconds % 3600) / 60));
      setSeconds(currentDurationSeconds % 60);
    }
  }, [isOpen, currentDurationSeconds]);

  if (!isOpen) return null;

  const handleSave = () => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds >= 0) {
      onSave(totalSeconds);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="button"
      tabIndex={-1}
      aria-label="Close modal"
    >
      <div className="panel-shell w-full max-w-[320px] p-6 animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col gap-5">
        
        {/* Header — centered */}
        <div className="text-center">
          <h3 className="text-[11px] font-bold tracking-widest text-text-primary uppercase opacity-90">
            Adjust your session length
          </h3>
        </div>

        {/* Content — centered */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2">
            
            {/* Hours */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-tertiary">h</span>
              <div className="h-10 w-16 flex overflow-hidden rounded-lg border border-border bg-bg-base transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_2px_hsl(152_52%_42%_/_0.18)]">
                <input
                  type="text"
                  inputMode="numeric"
                  value={hours.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const parsed = parseInt(raw, 10) || 0;
                    setHours(Math.min(99, Math.max(0, parsed)));
                  }}
                  className="w-full bg-transparent px-2 text-center text-sm font-bold font-mono text-text-primary outline-none"
                />
              </div>
            </div>

            <span className="text-lg font-bold text-text-tertiary mt-5 leading-none px-0.5">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-tertiary">m</span>
              <div className="h-10 w-16 flex overflow-hidden rounded-lg border border-border bg-bg-base transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_2px_hsl(152_52%_42%_/_0.18)]">
                <input
                  type="text"
                  inputMode="numeric"
                  value={minutes.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const parsed = parseInt(raw, 10) || 0;
                    setMinutes(Math.min(59, Math.max(0, parsed)));
                  }}
                  className="w-full bg-transparent px-2 text-center text-sm font-bold font-mono text-text-primary outline-none"
                />
              </div>
            </div>

            <span className="text-lg font-bold text-text-tertiary mt-5 leading-none px-0.5">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-tertiary">s</span>
              <div className="h-10 w-16 flex overflow-hidden rounded-lg border border-border bg-bg-base transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_2px_hsl(152_52%_42%_/_0.18)]">
                <input
                  type="text"
                  inputMode="numeric"
                  value={seconds.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const parsed = parseInt(raw, 10) || 0;
                    setSeconds(Math.min(59, Math.max(0, parsed)));
                  }}
                  className="w-full bg-transparent px-2 text-center text-sm font-bold font-mono text-text-primary outline-none"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Cancel / Save */}
        <div className="grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-bg-overlay h-10 text-[11px] font-bold text-text-secondary transition-all hover:bg-bg-subtle active:scale-95 outline-none shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-primary h-10 text-[11px] font-bold text-text-inverse transition-all hover:bg-primary-hover active:scale-95 shadow-sm focus:outline-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

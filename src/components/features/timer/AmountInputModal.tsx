'use client';

import { useState, useEffect, useRef } from 'react';

type Unit = 'g' | 'mg';

const MIN_G = 0.001; // Allow for small mg amounts
const MAX_G = 50;
const RECENTS_MAX = 5;

const METHOD_CONFIGS: Record<string, {
  initialGrams: number;
  defaultUnit: Unit;
  stepGrams: number;
  defaultRecentsGrams: number[];
}> = {
  flower: {
    initialGrams: 0.5,
    defaultUnit: 'g',
    stepGrams: 0.1,
    defaultRecentsGrams: [0.1, 0.5, 1.0, 1.5]
  },
  vape: {
    initialGrams: 0.05,
    defaultUnit: 'g',
    stepGrams: 0.01,
    defaultRecentsGrams: [0.05, 0.1, 0.15, 0.2]
  },
  extract: {
    initialGrams: 0.05,
    defaultUnit: 'g',
    stepGrams: 0.01,
    defaultRecentsGrams: [0.05, 0.1, 0.15, 0.2]
  },
  edible: {
    initialGrams: 0.01, // 10mg
    defaultUnit: 'mg',
    stepGrams: 0.005, // 5mg
    defaultRecentsGrams: [0.01, 0.02, 0.03, 0.05] // 10, 20, 30, 50mg
  },
  drink: {
    initialGrams: 0.01, // 10mg
    defaultUnit: 'mg',
    stepGrams: 0.005, // 5mg
    defaultRecentsGrams: [0.01, 0.02, 0.03, 0.05] // 10, 20, 30, 50mg
  },
  tincture: {
    initialGrams: 0.01, // 10mg
    defaultUnit: 'mg',
    stepGrams: 0.005, // 5mg
    defaultRecentsGrams: [0.005, 0.01, 0.02, 0.025] // 5, 10, 20, 25mg
  }
};

const DEFAULT_CONFIG = METHOD_CONFIGS.flower;

function recentsKey(method: string) {
  return `openpot:recents:${method.toLowerCase()}`;
}

function loadRecents(method: string): number[] {
  const config = METHOD_CONFIGS[method.toLowerCase()] || DEFAULT_CONFIG;
  if (typeof window === 'undefined') return config.defaultRecentsGrams;
  try {
    const raw = localStorage.getItem(recentsKey(method));
    if (raw) {
      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return config.defaultRecentsGrams;
}

function saveRecents(method: string, list: number[]) {
  try {
    localStorage.setItem(recentsKey(method), JSON.stringify(list));
  } catch { /* ignore */ }
}

function pushRecent(list: number[], value: number): number[] {
  const deduped = list.filter((v) => v !== value);
  return [value, ...deduped].slice(0, RECENTS_MAX);
}

function formatDisplay(grams: number, unit: Unit): string {
  const val = unit === 'mg' ? grams * 1000 : grams;
  return parseFloat(val.toFixed(3)).toString();
}

function parseToGrams(raw: string, unit: Unit): number | null {
  const n = parseFloat(raw);
  if (isNaN(n) || n < 0) return null;
  return unit === 'mg' ? n / 1000 : n;
}

interface AmountInputModalProps {
  isOpen: boolean;
  methodName: string;
  initialAmount?: number;
  initialUnit?: 'g' | 'mg';
  onClose: () => void;
  onSave: (amount: number | undefined, unit: 'g' | 'mg') => void;
}

export function AmountInputModal({
  isOpen,
  methodName,
  initialAmount,
  initialUnit,
  onClose: _onClose,
  onSave,
}: AmountInputModalProps) {
  const config = METHOD_CONFIGS[methodName.toLowerCase()] || DEFAULT_CONFIG;
  const [grams, setGrams] = useState<number>(initialAmount ?? config.initialGrams);
  const [unit, setUnit] = useState<Unit>(initialUnit ?? config.defaultUnit);
  const [recents, setRecents] = useState<number[]>(config.defaultRecentsGrams);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const localConfig = METHOD_CONFIGS[methodName.toLowerCase()] || DEFAULT_CONFIG;
      setGrams(initialAmount ?? localConfig.initialGrams);
      setUnit(initialUnit ?? localConfig.defaultUnit);
      setRecents(loadRecents(methodName));
    }
  }, [isOpen, initialAmount, initialUnit, methodName]);

  if (!isOpen) return null;

  const displayVal = formatDisplay(grams, unit);

  const clamp = (v: number) =>
    Math.min(MAX_G, Math.max(MIN_G, parseFloat(v.toFixed(4))));

  const inc = () => setGrams((g) => clamp(g + config.stepGrams));
  const dec = () => setGrams((g) => clamp(g - config.stepGrams));

  const stopContinuous = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startContinuous = (action: () => void) => {
    // Stop any existing interval
    stopContinuous();
    // Trigger action immediately on down
    action();
    // Then start interval
    intervalRef.current = setInterval(action, 250);
  };

  const handleDirect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseToGrams(e.target.value.replace(/[^0-9.]/g, ''), unit);
    if (parsed !== null) setGrams(Math.min(MAX_G, Math.max(0, parsed)));
  };

  const handleSave = () => {
    if (grams >= MIN_G) {
      const next = pushRecent(recents, grams);
      saveRecents(methodName, next);
      setRecents(next);
      onSave(grams, unit);
    } else {
      onSave(undefined, unit);
    }
  };

  const handleRecentSelect = (g: number) => {
    const next = pushRecent(recents, g);
    saveRecents(methodName, next);
    setRecents(next);
    onSave(g, unit);
  };

  const handleCancel = () => onSave(undefined, unit);



  const displayRecents = [...recents.slice(0, 4)].sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="panel-shell w-full max-w-[320px] p-6 animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col gap-5">
        
        {/* Close 'X' — No action */}
        <button 
          type="button"
          onClick={_onClose}
          className="absolute top-2.5 right-2.5 h-11 w-11 flex items-center justify-center rounded-full text-text-tertiary hover:bg-bg-overlay transition-all active:scale-95"
          aria-label="Close without saving"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Header — centered */}
        <div className="text-center">
          <h3 className="text-[11px] font-bold tracking-widest text-text-primary uppercase opacity-90">
            How much are you consuming?
          </h3>
        </div>

        {/* Content — centered */}
        <div className="flex flex-col items-center gap-3">

          {/* Stepper + Unit toggle */}
          <div className="flex w-full gap-2">
            <div
              className="flex h-10 flex-1 items-stretch overflow-hidden rounded-lg border border-border bg-bg transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_2px_hsl(152_52%_42%_/_0.18)]"
            >
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  startContinuous(dec);
                }}
                onPointerUp={stopContinuous}
                onPointerLeave={stopContinuous}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Decrease amount"
                className="flex w-10 shrink-0 select-none items-center justify-center text-lg font-light text-text-secondary transition-colors hover:bg-primary/10 border-r border-border focus:outline-none"
              >
                <span aria-hidden>−</span>
              </button>
              <input
                id="input-amount-stepper"
                inputMode="decimal"
                type="text"
                pattern="[0-9]*\.?[0-9]*"
                value={displayVal}
                onChange={handleDirect}
                aria-label={`Amount: ${displayVal} ${unit}`}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-center text-sm font-bold text-text-primary outline-none"
              />
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  startContinuous(inc);
                }}
                onPointerUp={stopContinuous}
                onPointerLeave={stopContinuous}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Increase amount"
                className="flex w-10 shrink-0 select-none items-center justify-center text-lg font-light text-text-secondary transition-colors hover:bg-primary/10 border-l border-border focus:outline-none"
              >
                <span aria-hidden>+</span>
              </button>
            </div>
            {/* Unit toggle */}
            <div className="flex h-10 shrink-0 rounded-lg overflow-hidden border border-border text-[10px] font-bold">
              {(['g', 'mg'] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={[
                    'flex w-10 items-center justify-center transition-colors focus:outline-none',
                    unit === u ? 'bg-primary/15 text-primary' : 'text-text-tertiary hover:text-text-secondary',
                  ].join(' ')}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Cancel / Save */}
          <div className="grid w-full grid-cols-2 gap-2">
            <button
              onClick={handleCancel}
              className="rounded-lg border border-error bg-error h-10 text-[11px] font-bold text-white transition-all hover:brightness-110 active:scale-95 outline-none shadow-sm"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-primary h-10 text-[11px] font-bold text-text-inverse transition-all hover:bg-primary-hover active:scale-95 shadow-sm focus:outline-none"
            >
              Save
            </button>
          </div>

          {/* Recents separator */}
          <div className="w-full flex items-center">
            <div className="flex-1 border-t border-border-subtle"></div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary px-2">Recents</span>
            <div className="flex-1 border-t border-border-subtle"></div>
          </div>

          {/* Recents FIFO */}
          <div className="flex w-full items-stretch gap-1.5">
            {displayRecents.map((g, i) => {
              const label = formatDisplay(g, unit);
              return (
                <button
                  key={i}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleRecentSelect(g)}
                  className="flex-1 rounded-lg py-2 px-0.5 text-[10px] font-bold transition-all duration-150 border bg-primary border-primary text-text-inverse hover:brightness-110 active:scale-95 focus:outline-none"
                >
                  {label}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';
import { useState, useCallback, useRef } from 'react';

// ─── helpers ────────────────────────────────────────────────────────────────

type Unit = 'g' | 'mg';

/** Convert any g/mg value to a canonical display string in the chosen unit */
function formatAmount(grams: number | null, unit: Unit): string {
  if (grams === null) return '';
  const val = unit === 'mg' ? grams * 1000 : grams;
  // Up to 3 decimal places, trimmed
  return parseFloat(val.toFixed(3)).toString();
}

/** Parse a raw string into grams. Returns null if invalid. */
function parseToGrams(raw: string, unit: Unit): number | null {
  const n = parseFloat(raw);
  if (isNaN(n) || n < 0) return null;
  return unit === 'mg' ? n / 1000 : n;
}

/** Quick preset steps for the stepper */
const PRESETS_G = [0.1, 0.25, 0.5, 1, 2, 5];

// ─── sub-components ─────────────────────────────────────────────────────────

interface SectionHeaderProps {
  index: number;
  title: string;
  description: string;
  badge?: string;
}
function SectionHeader({ index, title, description, badge }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-border-subtle">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
          {index}
        </span>
        <span className="text-sm font-bold text-text-primary tracking-tight">{title}</span>
        {badge && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-text-tertiary pl-8">{description}</p>
    </div>
  );
}

// ─── Input 1: Numeric keyboard with inline unit toggle ───────────────────────

function InlineUnitInput() {
  const [raw, setRaw] = useState('');
  const [unit, setUnit] = useState<Unit>('g');

  const gramsValue = parseToGrams(raw, unit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and a single decimal point
    const v = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setRaw(v);
  };

  const toggleUnit = () => {
    if (gramsValue !== null) {
      const newUnit: Unit = unit === 'g' ? 'mg' : 'g';
      setRaw(formatAmount(gramsValue, newUnit));
      setUnit(newUnit);
    } else {
      setUnit((u) => (u === 'g' ? 'mg' : 'g'));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center overflow-hidden rounded-xl border border-border bg-bg-overlay transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_hsl(152_52%_42%_/_0.18)]"
        style={{ minHeight: '56px' }}
      >
        <input
          id="input-inline-unit"
          inputMode="decimal"
          type="text"
          pattern="[0-9]*\.?[0-9]*"
          placeholder="0.0"
          value={raw}
          onChange={handleChange}
          aria-label={`Amount in ${unit}`}
          className="flex-1 bg-transparent px-4 py-3 text-xl font-semibold text-text-primary outline-none placeholder:text-text-tertiary"
        />
        <button
          type="button"
          onClick={toggleUnit}
          aria-label={`Switch unit, currently ${unit}`}
          className="flex h-full min-w-[60px] items-center justify-center border-l border-border px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10 active:bg-primary/20"
        >
          {unit}
        </button>
      </div>

      {gramsValue !== null && (
        <p className="text-xs text-text-tertiary pl-1">
          ≈{' '}
          <span className="font-semibold text-text-secondary">
            {unit === 'g'
              ? `${formatAmount(gramsValue, 'mg')} mg`
              : `${formatAmount(gramsValue, 'g')} g`}
          </span>
        </p>
      )}
    </div>
  );
}

// ─── Input 2: Segmented unit selector (radio-like) ───────────────────────────

function SegmentedUnitInput() {
  const [raw, setRaw] = useState('');
  const [unit, setUnit] = useState<Unit>('g');
  const inputRef = useRef<HTMLInputElement>(null);

  const gramsValue = parseToGrams(raw, unit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setRaw(v);
  };

  const switchUnit = useCallback(
    (newUnit: Unit) => {
      if (newUnit === unit) return;
      if (gramsValue !== null) {
        setRaw(formatAmount(gramsValue, newUnit));
      }
      setUnit(newUnit);
      inputRef.current?.focus();
    },
    [unit, gramsValue],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Segmented control */}
      <div
        role="group"
        aria-label="Unit selector"
        className="flex rounded-lg overflow-hidden border border-border bg-bg-overlay p-0.5 w-fit gap-0.5"
      >
        {(['g', 'mg'] as Unit[]).map((u) => (
          <button
            key={u}
            type="button"
            role="radio"
            aria-checked={unit === u}
            onClick={() => switchUnit(u)}
            className={[
              'px-5 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-150',
              unit === u
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary',
            ].join(' ')}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Number input */}
      <div
        className="flex items-center overflow-hidden rounded-xl border border-border bg-bg-overlay transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_hsl(152_52%_42%_/_0.18)]"
        style={{ minHeight: '56px' }}
      >
        <input
          ref={inputRef}
          id="input-segmented-unit"
          inputMode="decimal"
          type="text"
          pattern="[0-9]*\.?[0-9]*"
          placeholder="0.0"
          value={raw}
          onChange={handleChange}
          aria-label={`Amount in ${unit}`}
          className="flex-1 bg-transparent px-4 py-3 text-xl font-semibold text-text-primary outline-none placeholder:text-text-tertiary"
        />
        <span className="pr-4 text-sm font-bold text-text-tertiary select-none">{unit}</span>
      </div>

      {gramsValue !== null && (
        <p className="text-xs text-text-tertiary pl-1">
          ={' '}
          <span className="font-semibold text-text-secondary">
            {unit === 'g'
              ? `${formatAmount(gramsValue, 'mg')} mg`
              : `${formatAmount(gramsValue, 'g')} g`}
          </span>
        </p>
      )}
    </div>
  );
}

// ─── Input 3: Stepper + direct entry ────────────────────────────────────────

function StepperInput() {
  const [grams, setGrams] = useState<number>(0);
  const [unit, setUnit] = useState<Unit>('g');
  const [step, setStep] = useState(0.1);

  const displayVal = formatAmount(grams, unit);

  const inc = () => setGrams((g) => parseFloat((g + step).toFixed(4)));
  const dec = () => setGrams((g) => Math.max(0, parseFloat((g - step).toFixed(4))));

  const handleDirect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseToGrams(e.target.value.replace(/[^0-9.]/g, ''), unit);
    if (parsed !== null) setGrams(parsed);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stepper row */}
      <div
        className="flex items-stretch overflow-hidden rounded-xl border border-border bg-bg-overlay transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_hsl(152_52%_42%_/_0.18)]"
        style={{ minHeight: '56px' }}
      >
        <button
          type="button"
          onClick={dec}
          aria-label="Decrease amount"
          className="flex min-w-[52px] items-center justify-center text-2xl font-light text-text-secondary transition-colors hover:bg-primary/10 active:bg-primary/20 border-r border-border"
        >
          −
        </button>
        <input
          id="input-stepper"
          inputMode="decimal"
          type="text"
          pattern="[0-9]*\.?[0-9]*"
          value={displayVal}
          onChange={handleDirect}
          aria-label={`Amount: ${displayVal} ${unit}`}
          className="flex-1 bg-transparent py-3 text-center text-xl font-bold text-text-primary outline-none"
        />
        <button
          type="button"
          onClick={inc}
          aria-label="Increase amount"
          className="flex min-w-[52px] items-center justify-center text-2xl font-light text-text-secondary transition-colors hover:bg-primary/10 active:bg-primary/20 border-l border-border"
        >
          +
        </button>
      </div>

      {/* Step + unit row */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-text-tertiary mr-1">Step:</span>
        {PRESETS_G.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={[
              'rounded-md px-2.5 py-1 text-xs font-bold transition-colors',
              step === s
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-bg-subtle text-text-tertiary hover:text-text-secondary border border-transparent',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto flex rounded-md overflow-hidden border border-border text-xs font-bold">
          {(['g', 'mg'] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={[
                'px-3 py-1 transition-colors',
                unit === u ? 'bg-primary text-text-inverse' : 'text-text-tertiary hover:text-text-secondary',
              ].join(' ')}
            >
              {u}
            </button>
          ))}
        </span>
      </div>

      <p className="text-xs text-text-tertiary pl-1">
        Value:{' '}
        <span className="font-semibold text-text-secondary">
          {formatAmount(grams, 'g')} g / {formatAmount(grams, 'mg')} mg
        </span>
      </p>
    </div>
  );
}

// ─── Input 4: Slider + fine-tune keyboard ────────────────────────────────────

function SliderInput() {
  const [grams, setGrams] = useState(0.5);
  const [unit, setUnit] = useState<Unit>('g');
  const MAX_G = 10;

  const displayVal = formatAmount(grams, unit);
  const percent = Math.min(100, (grams / MAX_G) * 100);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGrams(parseFloat(parseFloat(e.target.value).toFixed(4)));
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseToGrams(e.target.value.replace(/[^0-9.]/g, ''), unit);
    if (parsed !== null) setGrams(Math.min(MAX_G, parsed));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Text + unit row */}
      <div
        className="flex items-center overflow-hidden rounded-xl border border-border bg-bg-overlay transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_hsl(152_52%_42%_/_0.18)]"
        style={{ minHeight: '56px' }}
      >
        <input
          id="input-slider-text"
          inputMode="decimal"
          type="text"
          pattern="[0-9]*\.?[0-9]*"
          value={displayVal}
          onChange={handleText}
          aria-label={`Amount in ${unit}`}
          className="flex-1 bg-transparent px-4 py-3 text-xl font-semibold text-text-primary outline-none"
        />
        <button
          type="button"
          onClick={() => setUnit((u) => (u === 'g' ? 'mg' : 'g'))}
          aria-label={`Toggle unit, currently ${unit}`}
          className="flex h-full min-w-[60px] items-center justify-center border-l border-border px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
        >
          {unit}
        </button>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-1.5 px-1">
        <style>{`
          #slider-amount::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 24px; height: 24px;
            border-radius: 50%;
            background: hsl(152 52% 42%);
            cursor: pointer;
            box-shadow: 0 0 0 3px hsl(152 52% 42% / 0.25);
            transition: box-shadow 150ms;
          }
          #slider-amount::-webkit-slider-thumb:active {
            box-shadow: 0 0 0 6px hsl(152 52% 42% / 0.3);
          }
          #slider-amount::-moz-range-thumb {
            width: 24px; height: 24px;
            border-radius: 50%;
            background: hsl(152 52% 42%);
            cursor: pointer;
            border: none;
          }
          #slider-amount {
            -webkit-appearance: none;
            width: 100%; height: 6px;
            border-radius: 3px;
            background: linear-gradient(
              to right,
              hsl(152 52% 42%) 0%,
              hsl(152 52% 42%) ${percent}%,
              hsl(220 10% 22%) ${percent}%,
              hsl(220 10% 22%) 100%
            );
            outline: none;
            cursor: pointer;
          }
        `}</style>
        <input
          id="slider-amount"
          type="range"
          min="0"
          max={MAX_G}
          step="0.01"
          value={grams}
          onChange={handleSlider}
          aria-label={`Amount slider, max ${MAX_G} g`}
        />
        <div className="flex justify-between text-[10px] text-text-tertiary font-mono">
          <span>0</span>
          <span>{MAX_G / 2} g</span>
          <span>{MAX_G} g</span>
        </div>
      </div>

      <p className="text-xs text-text-tertiary pl-1">
        ={' '}
        <span className="font-semibold text-text-secondary">
          {formatAmount(grams, 'g')} g / {formatAmount(grams, 'mg')} mg
        </span>
      </p>
    </div>
  );
}

// ─── Input 5: Quick-select pill grid ─────────────────────────────────────────

const QUICK_AMOUNTS_G = [0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.5, 5.0];

function QuickSelectInput() {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [unit, setUnit] = useState<Unit>('g');

  const customGrams = parseToGrams(custom, unit);
  const activeGrams = custom !== '' ? customGrams : selected;

  return (
    <div className="flex flex-col gap-4">
      {/* Unit toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-tertiary">Unit:</span>
        <div className="flex rounded-lg overflow-hidden border border-border text-xs font-bold">
          {(['g', 'mg'] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={[
                'px-4 py-1.5 transition-colors',
                unit === u ? 'bg-primary text-text-inverse' : 'text-text-tertiary hover:text-text-secondary',
              ].join(' ')}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Pill grid */}
      <div
        role="listbox"
        aria-label="Quick amount selection"
        className="grid grid-cols-5 gap-2"
      >
        {QUICK_AMOUNTS_G.map((g) => {
          const label = formatAmount(g, unit);
          const isActive = selected === g && custom === '';
          return (
            <button
              key={g}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => {
                setSelected(g);
                setCustom('');
              }}
              className={[
                'rounded-xl py-3 px-1 text-sm font-bold transition-all duration-150 border',
                isActive
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_0_1px_hsl(152_52%_42%_/_0.35)]'
                  : 'bg-bg-overlay border-border text-text-secondary hover:border-primary/50 hover:text-text-primary active:scale-95',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Custom override field */}
      <div
        className="flex items-center overflow-hidden rounded-xl border border-border bg-bg-overlay transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_hsl(152_52%_42%_/_0.18)]"
        style={{ minHeight: '48px' }}
      >
        <span className="pl-4 text-xs font-bold text-text-tertiary uppercase tracking-widest select-none whitespace-nowrap">Custom</span>
        <input
          id="input-quickselect-custom"
          inputMode="decimal"
          type="text"
          pattern="[0-9]*\.?[0-9]*"
          placeholder="0.0"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
            setSelected(null);
          }}
          aria-label={`Custom amount in ${unit}`}
          className="flex-1 bg-transparent px-3 py-2.5 text-base font-semibold text-text-primary outline-none placeholder:text-text-tertiary"
        />
        <span className="pr-4 text-sm font-bold text-text-tertiary">{unit}</span>
      </div>

      {activeGrams !== null && (
        <p className="text-xs text-text-tertiary pl-1">
          ={' '}
          <span className="font-semibold text-text-secondary">
            {formatAmount(activeGrams, 'g')} g / {formatAmount(activeGrams, 'mg')} mg
          </span>
        </p>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TestPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-4 py-6 sm:px-6 sm:py-12">
      <section className="panel-shell relative mx-auto flex w-full max-w-3xl flex-col gap-8 overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
        {/* ── Header ── */}
        <header className="border-b border-border-subtle pb-6 pt-2">
          <Link
            href="/"
            className="flex flex-row items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogoMark aria-hidden="true" className="h-[38px] w-auto text-text-primary sm:h-[45px]" />
            <div className="flex flex-col items-start gap-1 leading-none text-left">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl leading-none">
                Openpot
              </h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-text-secondary sm:text-[10px] leading-none">
                Secure Session Tracker
              </p>
            </div>
          </Link>
        </header>

        {/* ── Page title ── */}
        <div className="text-left">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Amount Input Lab</h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Mobile-optimised input patterns for decimal amounts in <strong className="text-text-secondary">g</strong> or{' '}
            <strong className="text-text-secondary">mg</strong>. All inputs are unit-aware and convert on the fly.
          </p>
        </div>

        {/* ── Input sections ── */}
        <div className="flex flex-col gap-8">

          {/* 1 · Inline unit toggle */}
          <div className="flex flex-col gap-4 rounded-xl bg-bg-subtle/40 border border-border-subtle p-4 sm:p-5">
            <SectionHeader
              index={1}
              title="Inline Unit Toggle"
              description="Single text field — tap the unit badge to convert and switch between g and mg instantly."
              badge="Recommended"
            />
            <InlineUnitInput />
          </div>

          {/* 2 · Segmented control */}
          <div className="flex flex-col gap-4 rounded-xl bg-bg-subtle/40 border border-border-subtle p-4 sm:p-5">
            <SectionHeader
              index={2}
              title="Segmented Unit Selector"
              description="Choose the unit before typing. The value is automatically converted when you switch between g and mg."
            />
            <SegmentedUnitInput />
          </div>

          {/* 3 · Stepper */}
          <div className="flex flex-col gap-4 rounded-xl bg-bg-subtle/40 border border-border-subtle p-4 sm:p-5">
            <SectionHeader
              index={3}
              title="Stepper with Presets"
              description="Nudge the value up/down using large tap targets. Choose a step size from the preset row or type directly."
            />
            <StepperInput />
          </div>

          {/* 4 · Slider */}
          <div className="flex flex-col gap-4 rounded-xl bg-bg-subtle/40 border border-border-subtle p-4 sm:p-5">
            <SectionHeader
              index={4}
              title="Slider + Keyboard Override"
              description="Drag the thumb for coarse control (0–10 g). Type directly in the field for precise fine-tuning."
            />
            <SliderInput />
          </div>

          {/* 5 · Quick-select pill grid */}
          <div className="flex flex-col gap-4 rounded-xl bg-bg-subtle/40 border border-border-subtle p-4 sm:p-5">
            <SectionHeader
              index={5}
              title="Quick-Select Grid"
              description="Tap a common amount pill for one-tap entry, or use the custom field for any value."
            />
            <QuickSelectInput />
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}

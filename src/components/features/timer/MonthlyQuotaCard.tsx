'use client';

import { useState, useEffect, useMemo } from 'react';
import type { SessionRecord } from '@/types/session';

interface MonthlyQuotaCardProps {
  sessions: SessionRecord[];
}

const MONTHLY_LIMIT_G = 50.0;

/**
 * Monthly Quota Card
 * visualizes the user's total consumption in grams for the current month.
 */
export function MonthlyQuotaCard({ sessions }: MonthlyQuotaCardProps) {
  const [now, setNow] = useState<Date | null>(null);

  // Initialize client-side date to avoid hydration mismatch
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const today = now || new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Filter sessions for the current month
    const monthlySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= firstOfMonth && sessionDate <= lastOfMonth;
    });

    // Aggregate consumption in grams
    const totalGrams = monthlySessions.reduce((acc, s) => {
      if (s.amount === undefined) return acc;
      const grams = s.amount;
      return acc + grams;
    }, 0);

    const percent = Math.min((totalGrams / MONTHLY_LIMIT_G) * 100, 100);
    
    // Native date formatting helpers
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fmtMarker = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
    const fmtTimestamp = (d: Date) => {
      const day = d.getDate().toString().padStart(2, '0');
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
      const year = d.getFullYear();
      return `${day}.${month} ${year}`;
    };
    
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const remainingDays = lastDayOfMonth.getDate() - today.getDate();
    
    return {
      totalGrams,
      percent,
      startDate: fmtMarker(firstOfMonth),
      endDate: fmtMarker(lastDayOfMonth),
      timestamp: fmtTimestamp(today),
      remaining: Math.max(MONTHLY_LIMIT_G - totalGrams, 0),
      remainingDays: Math.max(remainingDays, 0),
    };
  }, [sessions, now]);

  if (!now) return null;

  return (
    <section className="relative rounded-lg border border-border-subtle bg-bg-overlay/50 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary flex items-center gap-1.5 leading-none">
          <span className="shrink-0">CanG COMPLIANCE</span>
          <span className="text-[8px] opacity-30 font-normal">•</span>
          <span className="text-[9px] lowercase tracking-normal font-medium opacity-70">as of</span>
          <span className="text-[10px] text-text-primary font-bold tracking-normal normal-case">{stats.timestamp}</span>
        </h2>

        {/* Main Stats */}
        <div className="flex items-baseline justify-between mb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-text-primary">
              {stats.totalGrams.toFixed(3)}g
            </span>
            <span className="text-xs font-medium text-text-tertiary">/ {MONTHLY_LIMIT_G.toFixed(3)}g</span>
          </div>
          <div className="text-[10px] font-bold text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
            {stats.percent.toFixed(0)}% Used
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-bg-subtle border border-border-subtle/50">
            {/* The actual progress bar */}
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
          
          {/* Calendar Markers */}
          <div className="flex justify-between text-sm text-text-secondary font-medium">
            <span>{stats.startDate}</span>
            <span>{stats.endDate}</span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-2 pt-1 border-t border-border-subtle/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p className="text-sm text-text-secondary leading-normal">
            <span className="text-text-primary font-bold">{stats.remaining.toFixed(3)}g</span> available for the next <span className="text-text-primary font-bold">{stats.remainingDays}</span> {stats.remainingDays === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
    </section>
  );
}

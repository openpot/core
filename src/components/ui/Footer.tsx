'use client';

import Link from 'next/link';

/**
 * A unified navigation footer used across all pages of the application.
 * Standardizes the 'Home • About • Privacy • Terms' link row.
 */
export function Footer() {
  return (
    <footer className="mb-2 pt-8 flex w-full flex-col items-center gap-2 justify-center">
      <nav 
        aria-label="Secondary Navigation"
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-tertiary"
      >
        <Link 
          href="/" 
          className="hover:text-primary transition-colors"
        >
          Home
        </Link>
        <span className="opacity-50 text-[8px]" aria-hidden="true">•</span>
        <Link 
          href="/about" 
          className="hover:text-primary transition-colors"
        >
          About
        </Link>
        <span className="opacity-50 text-[8px]" aria-hidden="true">•</span>
        <Link 
          href="/privacy" 
          className="hover:text-primary transition-colors"
        >
          Privacy
        </Link>
        <span className="opacity-50 text-[8px]" aria-hidden="true">•</span>
        <Link 
          href="/terms" 
          className="hover:text-primary transition-colors"
        >
          Terms
        </Link>
        {process.env.NODE_ENV !== 'production' && (
          <>
            <span className="opacity-50 text-[8px]" aria-hidden="true">•</span>
            <Link 
              href="/test" 
              className="hover:text-primary transition-colors"
            >
              Test
            </Link>
          </>
        )}
      </nav>
    </footer>
  );
}

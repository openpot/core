'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';

/**
 * Feedback Page Implementation (Option 2: Hidden Mailto)
 * Provides a clean UI for message composition and then triggers the user's
 * local mail client while protecting the project email from simple scrapers.
 */
export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  // Simple obfuscation to prevent bot scrapers from seeing the raw email in HTML
  const emailUser = 'feedback';
  const emailDomain = 'openpot.co';
  const fullEmail = `${emailUser}@${emailDomain}`;

  const handleSend = () => {
    const subject = encodeURIComponent('Openpot Secure Timer Feedback');
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${fullEmail}?subject=${subject}&body=${body}`;
    setIsRevealed(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullEmail);
    alert('Email address copied to clipboard!');
    setIsRevealed(true);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-4 py-6 sm:px-6 sm:py-12">
      <section className="panel-shell relative mx-auto flex w-full max-w-2xl flex-col gap-6 overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
        <header className="border-b border-border-subtle pb-6 pt-2">
          <Link href="/" className="flex flex-row items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98]">
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

        <div className="mt-4 text-left space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Send Feedback</h2>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            Your feedback helps us harden the security and refine the UX of the Secure Timer. 
            Since we operate a 100% client-side app, this form will launch your local mail client.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              className="w-full min-h-[200px] bg-bg-overlay border border-border-subtle rounded-lg p-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="What can we improve? (e.g. UX bugs, feature requests, or security suggestions...)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSend}
              className="flex-1 bg-primary hover:bg-primary-hover text-bg-panel font-bold py-3 px-6 rounded-lg transition-all active:scale-[0.98] text-sm"
            >
              Launch Mail Client
            </button>
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-bg-overlay border border-border-subtle hover:border-primary text-text-secondary hover:text-text-primary font-bold py-3 px-6 rounded-lg transition-all active:scale-[0.98] text-sm"
            >
              Copy Support Email
            </button>
          </div>

          {isRevealed && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center animate-in fade-in slide-in-from-top-2 duration-500">
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest">
                Support Endpoint: {fullEmail}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border-subtle pt-6 mt-2">
          <p className="text-[11px] text-text-tertiary italic">
            Note: We prioritize high-density reporting. Please include your device and browser info 
            if you are reporting a PWA installation issue.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogoMark } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';

/**
 * Openpot Landing Page
 * 
 * Featuring a premium carousel of actual app screenshots.
 */
export default function LandingPage() {
  const screenshots = [
    { src: '/images/dashboard-1.jpg', alt: 'Native Home Screen Experience' },
    { src: '/images/dashboard-3.jpg', alt: 'Precision Consumption Tracking' },
    { src: '/images/dashboard-2.jpg', alt: 'Zero-Knowledge Local History' },
    { src: '/images/dashboard-4.jpg', alt: 'Sovereign Update Control' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [screenshots.length]);

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 selection:bg-emerald-500/30">
      {/* Centered Brand Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-8">
        <div className="flex flex-row items-center justify-center gap-2">
          <LogoMark aria-hidden="true" className="h-[48px] w-auto text-text-primary sm:h-[60px]" />
          <div className="flex flex-col items-start gap-1 leading-none">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl leading-none">
              Openpot
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary sm:text-[12px] leading-none">
              Secure Session Tracker
            </p>
          </div>
        </div>
        
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24 max-w-5xl mx-auto w-full">
        <div className="space-y-6 max-w-3xl mb-24">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Sovereign Tracking for the <span className="text-emerald-500">Modern Human.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A premium, zero-knowledge session tracker built for complete anonymity. 
            Your data stays on your device—cryptographically invisible to the world.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://app.openpot.co" 
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
            >
              Launch Secure App
            </a>
            <a 
              href="https://github.com/openpot/core/blob/main/CONTRIBUTING.md" 
              className="px-10 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all border border-slate-700/50 active:scale-95 text-lg flex items-center justify-center gap-3"
            >
              <span>Contribute To Cause</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.230.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-6 italic">
            No accounts. No telemetry. Fully Local-First.
          </p>
        </div>

        {/* Product Showcase Section */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 w-full">
          {/* Dashboard Carousel */}
          <div className="relative w-full max-w-[320px] group flex-shrink-0">
            {/* Glass background decoration */}
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            
            <div className="relative aspect-[472/1024] w-full overflow-hidden rounded-[2.5rem] border-[12px] border-slate-900 shadow-2xl shadow-black/50">
              {screenshots.map((shot, idx) => (
                <div 
                  key={shot.src}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === activeIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image 
                    src={shot.src} 
                    alt={shot.alt} 
                    fill
                    style={{ objectFit: 'cover' }}
                    priority={idx === 0}
                    unoptimized
                  />
                </div>
              ))}
            </div>

            {/* Carousel Indicators */}
            <div className="mt-8 flex justify-center gap-3">
              {screenshots.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 transition-all rounded-full ${
                    idx === activeIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            
            <div className="mt-4 text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
              {activeIndex + 1} / {screenshots.length} — {screenshots[activeIndex].alt}
            </div>
          </div>

          {/* Feature List (Vertical) */}
          <div className="flex flex-col gap-16 text-left max-w-md w-full">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 font-bold text-xl">01</div>
              <h3 className="text-xl font-semibold">Zero-Knowledge</h3>
              <p className="text-slate-400 leading-relaxed">
                We never see your data because we never touch it. No accounts, no database, no logs.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 font-bold text-xl">02</div>
              <h3 className="text-xl font-semibold">Local-First</h3>
              <p className="text-slate-400 leading-relaxed">
                Everything runs inside your browser&apos;s secure context. Offline-ready and cryptographically private.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 font-bold text-xl">03</div>
              <h3 className="text-xl font-semibold">Premium PWA</h3>
              <p className="text-slate-400 leading-relaxed">
                Install directly to your home screen. Experience a native feel without the surveillance of App Stores.
              </p>
            </div>
          </div>
        </div>

        {/* Community Signup Section */}
        <div className="mt-40 w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the community.</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Stay updated on new features and private tracking protocols. We promise: No tracking, no spam.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              required
            />
            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-8 py-3 transition-all active:scale-95"
            >
              Join
            </button>
          </form>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-slate-500">
            <a href="https://github.com/openpot/core/blob/main/README.md" className="hover:text-white transition-colors">About</a>
            <a href="https://github.com/openpot/core/blob/main/NOTICE.md" className="hover:text-white transition-colors">Notice</a>
            <a href="https://github.com/openpot/core/blob/main/CONTRIBUTING.md" className="hover:text-white transition-colors">Contribute</a>
            <a href="https://github.com/openpot/core/blob/main/CODE_OF_CONDUCT.md" className="hover:text-white transition-colors">Code of Conduct</a>
            <a href="https://github.com/openpot/core/blob/main/LICENSE" className="hover:text-white transition-colors">License</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

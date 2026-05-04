'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';

/**
 * Openpot Landing Page
 * 
 * Featuring a premium carousel of actual app screenshots.
 */
export default function LandingPage() {
  const screenshots = [
    { src: '/images/dashboard-1.jpg', alt: 'Native Home Screen Experience' },
    { src: '/images/dashboard-2.jpg', alt: 'Precision Consumption Tracking' },
    { src: '/images/dashboard-3.jpg', alt: 'Zero-Knowledge Local History' },
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
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="w-40">
          <Logo />
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <a href="https://github.com/openpot/core" className="hover:text-white transition-colors">GitHub</a>
          <a href="https://github.com/openpot/core/blob/main/CONTRIBUTING.md" className="hover:text-white transition-colors">Contribute</a>
          <Link href="/about" className="hover:text-white transition-colors">Protocol</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24 max-w-5xl mx-auto w-full">
        <div className="space-y-6 max-w-3xl mb-24">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Sovereign Tracking for the <span className="text-emerald-500">Modern Human.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A premium, zero-knowledge session tracker built for complete anonymity. 
            Your data stays on your device—mathematically invisible to the world.
          </p>
          <div className="pt-8 flex flex-col items-center justify-center gap-4">
            <a 
              href="https://app.openpot.co" 
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
            >
              Launch Secure App
            </a>
            <p className="text-sm text-slate-500 mt-2 italic">
              No accounts. No telemetry. Fully Local-First.
            </p>
          </div>
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
                Everything runs inside your browser's secure context. Offline-ready and cryptographically private.
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
          <div className="mt-8 flex justify-center gap-6 text-sm text-slate-500">
            <a href="https://github.com/openpot/core" className="hover:text-white transition-colors">GitHub Repository</a>
            <a href="https://github.com/openpot/core/issues" className="hover:text-white transition-colors">Report Issues</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

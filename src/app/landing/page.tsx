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
    { src: '/images/dashboard-1.jpg', alt: 'Openpot Timer & Dashboard' },
    { src: '/images/dashboard-2.jpg', alt: 'Consumption History & Stats' },
    { src: '/images/dashboard-3.jpg', alt: 'Secure Local Storage Tracking' },
    { src: '/images/dashboard-4.jpg', alt: 'About Openpot & Privacy Controls' },
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
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <a href="https://github.com/openpot/core" className="hover:text-white transition-colors">Source</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24 max-w-5xl mx-auto w-full">
        <div className="space-y-6 max-w-3xl mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Sovereign Tracking for the <span className="text-emerald-500">Modern Human.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A premium, zero-knowledge session tracker built for complete anonymity. 
            Your data stays on your device—mathematically invisible to the world.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://app.openpot.co" 
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Launch Secure App
            </a>
            <Link 
              href="/about" 
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all border border-slate-700/50 active:scale-95"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Dashboard Carousel */}
        <div className="relative w-full max-w-[320px] mx-auto group">
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
          
          {/* Mobile indicator for swipe/scroll feel */}
          <div className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
            {activeIndex + 1} / {screenshots.length} — {screenshots[activeIndex].alt}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-12 text-left w-full">
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
      </main>

      <Footer />
    </div>
  );
}

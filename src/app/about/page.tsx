import Link from 'next/link';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';
import { NetworkSettings } from '@/components/features/settings/NetworkSettings';
import { APP_VERSION } from '@/lib/version';

export const metadata = {
  title: 'About Us | Openpot',
  description: 'The story and mission behind the Openpot Secure Timer.',
};

export default function AboutPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-4 py-6 sm:px-6 sm:py-12">
      <section className="panel-shell relative mx-auto flex w-full max-w-3xl flex-col gap-6 overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
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

        <div className="mt-4 text-left">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">About Us</h2>
        </div>

        <article className="prose prose-invert space-y-8 text-text-secondary leading-relaxed text-left">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest text-xs">
              Privacy as a Human Right
            </h2>
            <p className="text-sm">
              Openpot was created with a single mission: to provide a premium, modern tracking experience 
              that respects user privacy above all else. In an era of data harvesting, Openpot stands apart 
              by ensuring your consumption history never leaves your device unless you explicitly choose to 
              sync anonymous durations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest text-xs">
              Local-First Engineering
            </h2>
            <p className="text-sm">
              Our architecture is &quot;Stuttgart-Safe,&quot; meaning we prioritize local execution and zero-knowledge 
              storage. By using browser-native IndexedDB, we offer the speed of a web app with the security 
              of an offline ledger.
            </p>
          </section>

          <NetworkSettings />

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary uppercase tracking-widest text-xs">
              Open Source Transparency
            </h2>
            <p className="text-sm">
              The Secure Timer is an open-source project licensed under the AGPL-3.0. This means the community 
              can audit our code, verify our security claims, and contribute to the future of private 
              session tracking.
            </p>
          </section>

          <section className="space-y-6 border-t border-border-subtle pt-8">
            <h2 className="text-xl font-bold tracking-tight text-text-primary text-left">
              Release Log
            </h2>
            
           <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">v0.8.0</span>
                  <span className="text-xs font-bold text-text-primary">The Master Sync Release</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-secondary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Zero-Commit Master Sync: Re-engineered versioning architecture using real-time Git/Vercel metadata for parity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>PWA Update Hardening: Implemented controllerchange event synchronization for race-condition-free reloads.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>High-Precision Weight Metrics: Upgraded Monthly Quota card to 3-decimal precision for granular tracking.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Scaling Accuracy Fix: Resolved double-conversion weight calculations for milligram dose totals.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-bg-overlay border border-border-subtle px-1.5 py-0.5 rounded">v0.7.0</span>
                  <span className="text-xs font-bold text-text-secondary">The Privacy Overhaul</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-secondary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Zero-Network Architecture: Implemented manual PWA registration to eliminate unauthorized background pings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Multi-Stage Update Flow: Added Check &gt; Pull &gt; Apply dashboard for absolute transparency on software updates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Aggressive Shell Precaching: pro-actively caches core routes (Home, About, Privacy) for instant offline availability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Stale Build Guard: Integrated an &quot;Atomic Sync&quot; engine to prevent broken UIs when build hashes change.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-bg-overlay border border-border-subtle px-1.5 py-0.5 rounded">v0.6.0</span>
                  <span className="text-xs font-bold text-text-secondary">The Hardening Release</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-secondary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>PWA Reliability v2: Fail-safe installation capture and guided iOS Safari instructional modal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Mobile Layout Hardening: Grid-anchored history cards and synchronized typographic rhythm.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>High-Density UX: Optimized input spacing and automatic scroll-reset for newly started sessions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Production Stability: Fixed build-blocking accessibility (a11y) and TypeScript inconsistencies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Platform Resilience: Versioned manifest logic and cache busting for reliable splash screen coloring.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-bg-overlay border border-border-subtle px-1.5 py-0.5 rounded">v0.5.0</span>
                  <span className="text-xs font-bold text-text-secondary">The Precision Release</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-secondary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Method-specific intelligent defaults for amounts, units (g/mg), and step sizes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Fixed amount persistence logic ensuring 100% local database consistency.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Enhanced Secure CSV Export with specialized amount tracking and gram unit conversion.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Refined dashboard rhythm with precise 3.2px spacing and optimized mobile cards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Standardized micro-pill tagging infrastructure for history metadata.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-bg-overlay border border-border-subtle px-1.5 py-0.5 rounded">v0.4.0</span>
                  <span className="text-xs font-bold text-text-secondary">The Experience Release</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-secondary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Decoupled session rating flow into a dedicated post-session modal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Optimized mobile entry flows with dedicated Amount Input Lab layout structures.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Persistent, dismissible PWA install prompt shown proactively on unsupported devices.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Refined tracking selection forms and re-ordered inputs (Consumption method first).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Secure environment gating logic implemented for non-production lab routes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Standardized top-anchored vertical rhythm and tight logo horizontal lockups.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-bg-overlay border border-border-subtle px-1.5 py-0.5 rounded">v0.3.0</span>
                  <span className="text-xs font-bold text-text-secondary">The Identity Release</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-tertiary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Unified project-wide branding with horizontal lockup and tuned tracking.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Universal &quot;Page Shell&quot; (panel-card) structure across all secondary pages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Standardized Navigation Footer (Home • About • Privacy • Terms).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Optimized top-anchored layout for improved identity and readability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Hardened build system with JSX entity sanitization for production stability.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-bg-overlay border border-border-subtle px-1.5 py-0.5 rounded">v0.2.0</span>
                  <span className="text-xs font-bold text-text-secondary">The Stuttgart Release</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-tertiary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Adaptive PWA integration with smart install prompts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Secure CSV Export for local-first data ownership.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Professional legal infrastructure (Privacy & Terms).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Vercel-optimized deployment engine and build hardening.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter bg-bg-overlay border border-border-subtle px-1.5 py-0.5 rounded">v0.1.0</span>
                  <span className="text-xs font-bold text-text-secondary">The Kernel Release</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-tertiary list-none pl-1">
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Initial Secure Timer state machine implementation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Local IndexedDB persistence and session queue.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="opacity-50 mt-1">•</span>
                    <span>Anonymous session records and rating system.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </article>
      </section>

      <Footer />
    </main>
  );
}

import Link from 'next/link';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';
import { NetworkSettings } from '@/components/features/settings/NetworkSettings';
import { APP_VERSION } from '@/lib/version';
import { RELEASES } from '@/data/releases';

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
              Recent Release Notes
            </h2>
            
            <div className="space-y-6">
              {RELEASES.slice(0, 5).map((release, index) => (
                <div key={release.version} className={`space-y-2 ${index > 0 ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                      index === 0 
                        ? 'text-primary bg-primary/10' 
                        : 'text-text-tertiary bg-bg-overlay border border-border-subtle'
                    }`}>
                      {release.version}
                    </span>
                    <span className={`text-xs font-bold ${index === 0 ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {release.title}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-[13px] text-text-secondary list-none pl-1">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </article>
      </section>

      <Footer />
    </main>
  );
}

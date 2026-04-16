import Link from 'next/link';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';

export const metadata = {
  title: 'Privacy Policy | Openpot',
  description: 'Zero-knowledge, local-only privacy policy for the Openpot Secure Timer.',
};

export default function PrivacyPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <section className="panel-shell relative mx-auto flex w-full max-w-3xl flex-col gap-6 overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
        <header className="border-b border-border-subtle pb-6 pt-2">
          <Link href="/" className="flex flex-row items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
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
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Privacy Policy</h2>
        </div>

        <article className="prose prose-invert space-y-8 text-text-secondary leading-relaxed">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">1. Zero-Tracking Policy</h3>
            <p className="text-sm">
              Openpot is a local-first application. We do not use cookies, tracking pixels, or third-party 
              analytics. Your session data never leaves your device unless you explicitly initiate an 
              export or sync (where available).
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">2. Local Storage</h3>
            <p className="text-sm">
              All session history, ratings, and durations are stored locally in your browser&apos;s IndexedDB. 
              Clearing your browser cache or site data will permanently delete this information as we 
              do not maintain any server-side backups.
            </p>
          </section>

          <section className="space-y-4 border-t border-border-subtle pt-6">
            <h3 className="text-lg font-bold text-text-primary">3. Data Ownership</h3>
            <p className="text-sm italic">
              You own your data. You can export your entire session history as a CSV file at any time from 
               the dashboard. This data is provided in plain text for your personal records.
            </p>
          </section>
        </article>
      </section>

      <Footer />
    </main>
  );
}

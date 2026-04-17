import Link from 'next/link';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { Footer } from '@/components/ui/Footer';

export const metadata = {
  title: 'Terms of Service | Openpot',
  description: 'Minimal terms of service and license agreement for the Openpot Secure Timer.',
};

export default function TermsPage() {
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
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Terms of Service</h2>
        </div>

        <article className="prose prose-invert space-y-8 text-text-secondary leading-relaxed">
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">1. Software License</h3>
            <p className="text-sm">
              Openpot is open-source software distributed under the AGPL-3.0 License. You are free to use, 
              modify, and distribute the software as long as you comply with the terms of the license.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">2. No Warranty</h3>
            <p className="text-sm">
              The software is provided &quot;AS IS&quot;, without warranty of any kind, express or implied. The 
              authors or copyright holders shall not be liable for any claim, damages or other liability, 
              including data loss or device damage, arising from the use of the software.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">3. User Responsibility</h3>
            <p className="text-sm">
              You are solely responsible for the content you log in Openpot and for maintaining your 
              own backups. As a local-first application, we cannot recover deleted data.
            </p>
          </section>

          <section className="space-y-4 border-t border-border-subtle pt-6">
            <p className="text-xs italic text-text-tertiary">
              By using Openpot, you agree that your data is stored locally and we carry no liability for 
              its persistence or security.
            </p>
          </section>
        </article>
      </section>

      <Footer />
    </main>
  );
}

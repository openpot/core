import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { PwaRegistration } from '@/components/pwa/PwaRegistration';
import { locales, getDictionary, type Locale } from '@/i18n/config';
import { I18nProvider } from '@/i18n/I18nProvider';

import '../globals.css';

/**
 * Directive 2: Stable PWA Tags
 * We use simple metadata but ensure the manifest and icons are consistent.
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://openpot.co'),
  applicationName: 'Openpot',
  title: 'Openpot',
  description: 'A zero-knowledge session timer secured locally and synced anonymously.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Openpot',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  referrer: 'no-referrer',
};

export const viewport: Viewport = {
  themeColor: '#0d1117',
  colorScheme: 'dark light',
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Root Layout
 * Enforces 'Zero-Network' architecture by:
 * 1. Mounting PwaRegistration for manual SW control.
 * 2. Providing a stable document structure.
 */
export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang}>
      <head>
        {/* Stale Build Guard: Prevents UI breakage when hashes change during zero-network state */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT') {
                  const url = e.target.src || e.target.href;
                  if (url && url.includes('/_next/static/')) {
                    console.warn('Openpot: Stale asset detected. Synchronizing build...');
                    
                    if (!sessionStorage.getItem('openpot_sync_retry')) {
                      sessionStorage.setItem('openpot_sync_retry', 'true');
                      
                      // Nuclear Cleanup: Clear SW and hard reload
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                          for(let registration of registrations) {
                            registration.unregister();
                          }
                          window.location.reload(true);
                        }).catch(() => {
                           window.location.reload(true);
                        });
                      } else {
                        window.location.reload(true);
                      }
                    }
                  }
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <PwaRegistration />
        <I18nProvider dict={dict} locale={lang}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

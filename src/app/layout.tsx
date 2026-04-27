import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { PWARegistration } from '@/components/pwa/PWARegistration';

import './globals.css';

/**
 * Directive 2: Stable PWA Tags
 * We use simple metadata but ensure the manifest and icons are consistent.
 */
export const metadata: Metadata = {
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
}

/**
 * Root Layout
 * Enforces 'Zero-Network' architecture by:
 * 1. Mounting PWARegistration for manual SW control.
 * 2. Providing a stable document structure.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
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
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}

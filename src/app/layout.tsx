import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  applicationName: 'Openpot',
  title: 'Openpot',
  description: 'A zero-knowledge session timer secured locally and synced anonymously.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Openpot',
  },
  referrer: 'no-referrer',
};

export const viewport: Viewport = {
  themeColor: '#143151',
  colorScheme: 'dark light',
};

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Provides the global app shell and metadata wiring.
 *
 * @param children - Route content rendered inside the root layout.
 * @returns The application document structure.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

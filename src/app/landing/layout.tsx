import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Openpot | Sovereign Session Tracker',
  description: 'A premium, zero-knowledge session tracker built for complete anonymity. Your data stays on your device. Cryptographically invisible to the world.',
  keywords: ['session tracker', 'privacy', 'zero-knowledge', 'local-first', 'anonymity', 'secure tracker', 'openpot'],
  authors: [{ name: 'Openpot' }],
  creator: 'Openpot',
  publisher: 'Openpot',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openpot.co/landing',
    siteName: 'Openpot',
    title: 'Openpot | Sovereign Session Tracker',
    description: 'A premium, zero-knowledge session tracker built for complete anonymity. Your data stays on your device.',
    images: [
      {
        url: '/images/dashboard-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Openpot Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Openpot | Sovereign Session Tracker',
    description: 'A premium, zero-knowledge session tracker built for complete anonymity.',
    images: ['/images/dashboard-1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://openpot.co/landing',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

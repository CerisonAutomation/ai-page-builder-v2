/**
 * Root Layout
 * Wraps entire application with metadata, fonts, and styling
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | AI Page Builder',
    default: 'AI Page Builder — Create Pages with AI',
  },
  description:
    'Create beautiful, responsive pages without coding. Powered by AI. Start free today.',
  keywords: [
    'page builder',
    'no-code',
    'website builder',
    'AI-powered',
    'page design',
    'drag-and-drop',
  ],
  authors: [{ name: 'AI Page Builder' }],
  creator: 'AI Page Builder',
  publisher: 'AI Page Builder',

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://yoursite.com',
    siteName: 'AI Page Builder',
    title: 'AI Page Builder — Create Pages with AI',
    description: 'Create beautiful, responsive pages without coding.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Page Builder',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@yourhandle',
    creator: '@yourhandle',
    title: 'AI Page Builder — Create Pages with AI',
    description: 'Create beautiful, responsive pages without coding.',
    images: ['/twitter-image.png'],
  },

  // Viewport and theme
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },

  // Robots
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

  // Alternate links for multilingual (optional)
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://yoursite.com',
    languages: {
      'en-US': `${process.env.NEXT_PUBLIC_APP_URL || 'https://yoursite.com'}/en`,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for APIs */}
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
      </head>

      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {/* Main content */}
        {children}
        <Toaster />

        {/* Fallback for JavaScript disabled */}
        <noscript>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-100"
            style={{
              padding: '20px',
              textAlign: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ maxWidth: '400px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                JavaScript Required
              </h1>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                This application requires JavaScript to be enabled. Please enable JavaScript in
                your browser settings and reload the page.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}

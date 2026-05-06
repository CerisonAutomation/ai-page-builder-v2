/**
 * Locale Layout
 * Wraps all pages with NextIntlClientProvider for i18n support
 * Loads theme fonts and provides theme context via ThemeProvider
 */

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Montserrat, Poppins, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import ThemeProvider from '@/lib/theme/ThemeProvider';

// Base font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Corporate theme fonts
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

// Modern theme fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

// Minimal theme fonts
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
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
  twitter: {
    card: 'summary_large_image',
    site: '@yourhandle',
    creator: '@yourhandle',
    title: 'AI Page Builder — Create Pages with AI',
    description: 'Create beautiful, responsive pages without coding.',
    images: ['/twitter-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
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
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  // Combine all font variables
  const fontVariables = [
    inter.variable,
    montserrat.variable,
    poppins.variable,
    playfairDisplay.variable,
  ].join(' ');

  return (
    <html lang={locale} dir="ltr" className={fontVariables} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Space Grotesk for modern theme - loaded via CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50" style={{ fontFamily: 'var(--font-family, Inter, system-ui, sans-serif)' }}>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
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
                <span data-i18n="common.javascriptRequired">JavaScript Required</span>
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

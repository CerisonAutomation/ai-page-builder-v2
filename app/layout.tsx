/**
 * Root Layout
 * Wraps entire application with metadata, fonts, and skip-to-content.
 *
 * @module app/layout
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  // Preload only the weights we actually use
  weight: ["400", "500", "600", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yoursite.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    template: "%s | AI Page Builder",
    default: "AI Page Builder — Create Pages with AI",
  },
  description:
    "Create beautiful, responsive pages without coding. Powered by Gemini AI + Puck editor. Start free today.",
  keywords: [
    "page builder",
    "no-code",
    "website builder",
    "AI-powered",
    "page design",
    "drag-and-drop",
    "Puck editor",
    "Gemini AI",
  ],
  authors: [{ name: "AI Page Builder" }],
  creator: "AI Page Builder",
  publisher: "AI Page Builder",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "AI Page Builder",
    title: "AI Page Builder — Create Pages with AI",
    description: "Create beautiful, responsive pages without coding.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "AI Page Builder",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@yourhandle",
    creator: "@yourhandle",
    title: "AI Page Builder — Create Pages with AI",
    description: "Create beautiful, responsive pages without coding.",
    images: ["/api/og"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: appUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* DNS Prefetch for APIs */}
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link
          rel="dns-prefetch"
          href="https://generativelanguage.googleapis.com"
        />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {/* Skip to main content — accessibility requirement */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Skip to main content
        </a>

        {children}

        <noscript>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
            style={{
              padding: "20px",
              textAlign: "center",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <div style={{ maxWidth: "400px", color: "#f8fafc" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                JavaScript Required
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  lineHeight: "1.5",
                }}
              >
                This application requires JavaScript. Please enable it in your
                browser settings and reload the page.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}

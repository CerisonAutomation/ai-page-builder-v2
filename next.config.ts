import type { NextConfig } from "next";

/**
 * Content Security Policy
 * Adjust directives as integrations are added (e.g. Stripe, analytics).
 */
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval required by Next.js dev & Puck
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com",
  "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com wss://*.supabase.co",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  /**
   * Image optimisation
   * Allow Supabase Storage public + signed URLs.
   * Add additional hostnames as integrations grow.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        // GitHub avatars (used in admin user display)
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    // Prefer modern formats
    formats: ["image/avif", "image/webp"],
  },

  /**
   * Experimental features
   */
  experimental: {
    // Server Actions are stable in Next.js 15 — no flag needed
    // Optimise package imports to reduce bundle size
    optimizePackageImports: ["lucide-react", "@measured/puck"],
  },

  /**
   * HTTP security headers applied to every response.
   * CSP is set here; auth routes may override via middleware.
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Clickjacking protection
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // HSTS — 1 year, include sub-domains, preload-ready
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Permissions policy — disable unused browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          // Cross-Origin policies for SharedArrayBuffer / performance isolation
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        ],
      },
    ];
  },

  /**
   * Redirects — keep legacy paths alive
   */
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/pages",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

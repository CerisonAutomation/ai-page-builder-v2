import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    domains: [
      "localhost:3000",
      "localhost:3001",
      // Supabase storage domain - extract from environment
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname]
        : []),
    ],
    // Optimize images in production
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "geolocation=(), microphone=(), camera=()",
        },
      ],
    },
  ],

  // Redirects
  redirects: async () => [
    {
      source: "/",
      destination: "/edit",
      permanent: false,
    },
  ],

  // Rewrites for API proxying if needed
  rewrites: async () => ({
    beforeFiles: [
      // Add any API rewrites here
    ],
    afterFiles: [],
    fallback: [],
  }),

  // Environment variables to expose to client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "AI Page Builder",
  },

  // Optimize package size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            // Separate Puck editor into its own chunk
            puck: {
              test: /[\\/]node_modules[\\/]@measured[\\/]puck/,
              name: "puck",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate @supabase into its own chunk
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase/,
              name: "supabase",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "@supabase/supabase-js",
      "@measured/puck",
      "sonner",
    ],
  },

  // Build configuration
  productionBrowserSourceMaps: false, // Disable source maps in production for security

  // Enable strict mode for development
  reactStrictMode: true,

  // Disable power by Next.js header for security
  poweredByHeader: false,

  // Cache configuration
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute
    pagesBufferLength: 5,
  },

  // Compress responses
  compress: true,

  // Generate ETags
  generateEtags: true,

  // Turbopack config (empty to use defaults)
  turbopack: {},
};

export default nextConfig;

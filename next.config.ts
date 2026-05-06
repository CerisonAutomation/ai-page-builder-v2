import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js Image Optimization for Supabase Storage and common CDNs.
  // Add additional hostnames here as integrations are added.
  images: {
    remotePatterns: [
      {
        // Supabase Storage public bucket
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Supabase Storage signed URLs
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevents MIME-type sniffing attacks
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Controls how much referrer info is included with requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disallows embedding in iframes (click-jacking protection)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Enables HSTS (1 year, include sub-domains)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Disables browser features that are not used
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

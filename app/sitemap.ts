/**
 * Sitemap — dynamically generated from all published pages.
 *
 * Registered automatically by Next.js at /sitemap.xml.
 *
 * @module app/sitemap
 */

import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yoursite.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Dynamic published pages
  let pageRoutes: MetadataRoute.Sitemap = [];
  try {
    const { listPages } = await import("@/lib/db/pages");
    // Fetch up to 1000 published pages for sitemap
    const { pages } = await listPages("system", 1000, 0).catch(() => ({
      pages: [],
    }));
    pageRoutes = pages
      .filter((p: { published: boolean }) => p.published)
      .map(
        (p: {
          slug: string;
          updated_at: string;
        }) => ({
          url: `${appUrl}/${p.slug}`,
          lastModified: new Date(p.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      );
  } catch {
    // DB unavailable at build time — static routes only
  }

  return [...staticRoutes, ...pageRoutes];
}

/**
 * Sitemap Generation
 * Creates dynamic sitemap for search engines
 */

import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/db/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yoursite.com';
  const supabase = await createServerSupabaseClient();

  // Fetch published pages for sitemap
  const { data: pages } = await supabase
    .from('pages')
    .select('slug, updated_at')
    .eq('published_at', true)
    .limit(50000); // Sitemap limit

  const pageEntries: MetadataRoute.Sitemap = (pages || []).map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Add main routes
  const mainRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/edit`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  return [...mainRoutes, ...pageEntries];
}

/**
 * Public Page Render — Server Component
 *
 * Renders a published Puck page by slug with:
 * - ISR (revalidate every 60 s)
 * - Full generateMetadata with OpenGraph + JSON-LD structured data
 * - resolveAllData with timeout guard to prevent hanging builds
 * - Fallback render on resolveAllData failure
 *
 * @module app/(frontend)/[slug]/page
 */

import type { Metadata } from "next";
import { Render, resolveAllData } from "@measured/puck";
import { notFound } from "next/navigation";
import { getPageBySlug, countPublishedPages } from "@/lib/db/pages";
import { puckConfig } from "@/lib/puck/config";
import { logger } from "@/lib/utils/logger";

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

/** ISR — regenerate published pages every 60 seconds */
export const revalidate = 60;

/** Dynamic params allowed (slugs created at runtime) */
export const dynamicParams = true;

/**
 * Pre-generate static paths for the first N published pages at build time.
 * The rest are generated on-demand via ISR (dynamicParams = true).
 */
export async function generateStaticParams() {
  try {
    const { pages } = await import("@/lib/db/pages").then((m) =>
      m.listPages("system", 50, 0).catch(() => ({ pages: [] }))
    );
    return pages
      .filter((p: { published: boolean }) => p.published)
      .map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    // If DB is unavailable at build time, fall back to empty (all on-demand)
    return [];
  }
}

/**
 * Generate page-level metadata including Open Graph and Twitter Card.
 * Falls back gracefully when the page is not found.
 */
export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return { title: "Not Found" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yoursite.com";
  const canonicalUrl = `${appUrl}/${slug}`;
  const ogImage = `${appUrl}/api/og?slug=${encodeURIComponent(slug)}`;

  return {
    title: page.title,
    description: page.description ?? undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description ?? "",
      type: "website",
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description ?? "",
      images: [ogImage],
    },
  };
}

/**
 * Resolve Puck data with a timeout to prevent hanging in edge cases.
 */
async function resolveWithTimeout(
  data: Parameters<typeof resolveAllData>[0],
  timeout = 5_000
) {
  return Promise.race([
    resolveAllData(data, puckConfig),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("resolveAllData timed out")), timeout)
    ),
  ]);
}

/** JSON-LD WebPage structured data for SEO */
function WebPageJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description?: string | null;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description: description ?? undefined,
    url,
  };
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.published) {
    return notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yoursite.com";
  let resolvedData = page.data;

  try {
    resolvedData = await resolveWithTimeout(page.data);
  } catch (error) {
    logger.error("resolveAllData failed — using raw data", error, { slug });
  }

  return (
    <>
      <WebPageJsonLd
        name={page.title}
        description={page.description}
        url={`${appUrl}/${slug}`}
      />
      <main
        id="main-content"
        className="min-h-screen bg-white"
        aria-label={`${page.title} page content`}
      >
        <Render config={puckConfig} data={resolvedData} />
      </main>
    </>
  );
}

/**
 * Public Page Render
 * ✅ Server-side resolveAllData for fresh external data
 */

import { Render, resolveAllData } from "@measured/puck";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/db/pages";
import { puckConfig } from "@/lib/puck/config";
import { logger } from "@/lib/utils/logger";

interface PublicPageProps {
  params: { slug: string };
}

export default async function PublicPage({ params }: PublicPageProps) {
  // ✅ STEP 1: Fetch page from database
  const page = await getPageBySlug(params.slug);

  if (!page || !page.published) {
    return notFound();
  }

  try {
    // ✅ STEP 2: Resolve all external data server-side
    // This runs resolveData callbacks in config to fetch fresh CMS data
    const resolvedData = await resolveAllData(page.data, puckConfig);

    return (
      <div className="min-h-screen bg-white">
        {/* ✅ RENDER WITH RESOLVED DATA */}
        <Render config={puckConfig} data={resolvedData} />
      </div>
    );
  } catch (error) {
    logger.error("Error rendering public page", error, { slug: params.slug });
    // Fallback: render with unresolved data
    return (
      <div className="min-h-screen bg-white">
        <Render config={puckConfig} data={page.data} />
      </div>
    );
  }
}

// ✅ METADATA
export async function generateMetadata({ params }: PublicPageProps) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: page.title,
    description: page.description || "Page",
    openGraph: {
      title: page.title,
      description: page.description || "",
      type: "website",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${params.slug}`,
    },
  };
}

// ✅ STATIC GENERATION (for published pages)
export async function generateStaticParams() {
  // TODO: Fetch all published pages and return slugs
  // This enables static site generation for better performance
  return [];
}

// ✅ REVALIDATE (ISR — regenerate every 60 seconds)
export const revalidate = 60;

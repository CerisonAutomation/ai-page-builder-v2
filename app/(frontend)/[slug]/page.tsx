/**
 * Public Page Render
 * ✅ Server-side resolveAllData for fresh external data
 * ✅ Theme tokens injected via ThemeProvider
 */

import { Render, resolveAllData } from "@measured/puck";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/db/pages";
import { puckConfig } from "@/lib/puck/config";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
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
      <ThemeProvider>
        <div className="min-h-screen bg-white">
          {/* ✅ RENDER WITH RESOLVED DATA */}
          <Render config={puckConfig} data={resolvedData} />
        </div>
      </ThemeProvider>
    );
  } catch (error) {
    logger.error("Error rendering public page", error, { slug: params.slug });
    // Fallback: render with unresolved data
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white">
          <Render config={puckConfig} data={page.data} />
        </div>
      </ThemeProvider>
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
  try {
    const { createAdminClient } = await import("@/lib/db/supabase");
    const supabase = createAdminClient();
    const { data: pages } = await supabase
      .from("pages")
      .select("slug")
      .eq("published", true)
      .is("deleted_at", null);

    return (pages ?? []).map((p) => ({ slug: p.slug }));
  } catch {
    // Fail gracefully — ISR will handle individual pages on-demand
    return [];
  }
}

// ✅ REVALIDATE (ISR — regenerate every 60 seconds)
export const revalidate = 60;

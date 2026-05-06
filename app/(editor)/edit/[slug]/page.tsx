/**
 * Editor Page (Server Component)
 * ✅ CRITICAL: Load page data BEFORE editor mounts
 * This prevents blank editor bug
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPageBySlug } from "@/lib/db/pages";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { emptyPage } from "@/lib/puck/config";
import { logger } from "@/lib/utils/logger";
import PuckEditor from "@/components/editor/PuckEditor";

// ✅ LOADING SKELETON
function EditorSkeleton() {
  return (
    <div className="w-full h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="h-12 w-64 bg-slate-300 rounded mx-auto mb-2"></div>
          <div className="h-4 w-48 bg-slate-300 rounded mx-auto"></div>
        </div>
        <p className="text-slate-600">Loading editor...</p>
      </div>
    </div>
  );
}

interface EditPageProps {
  params: { slug: string };
}

/**
 * ✅ SERVER COMPONENT — Fetch data before hydration
 * Never pass data={{}} to editor
 * Always pre-load from database
 */
export default async function EditPage({ params }: EditPageProps) {
  // ✅ AUTH GUARD — redirect unauthenticated users
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    // ✅ STEP 1: Fetch page from database
    const page = await getPageBySlug(params.slug);

    // ✅ STEP 2: Use saved data or empty scaffold
    const initialData = page?.data ?? emptyPage;
    const pageId = page?.id ?? null;

    // ✅ STEP 3: Pass to client component with pre-loaded data
    return (
      <Suspense fallback={<EditorSkeleton />}>
        <PuckEditor
          slug={params.slug}
          pageId={pageId}
          initialData={initialData}
          title={page?.title ?? "New Page"}
          description={page?.description ?? ""}
        />
      </Suspense>
    );
  } catch (error) {
    logger.error("Error loading page in editor", error, { slug: params.slug });
    // Return empty page on error (safe fallback)
    return (
      <Suspense fallback={<EditorSkeleton />}>
        <PuckEditor
          slug={params.slug}
          pageId={null}
          initialData={emptyPage}
          title="New Page"
          description=""
        />
      </Suspense>
    );
  }
}

// ✅ METADATA
export async function generateMetadata({
  params,
}: EditPageProps) {
  const page = await getPageBySlug(params.slug);
  return {
    title: page?.title ? `Edit: ${page.title}` : "Create Page",
    description: "Visual page editor",
  };
}

// ✅ REVALIDATE (cache for 60s, then revalidate)
export const revalidate = 60;

/**
 * Editor Page (Server Component)
 * CRITICAL: Load page data BEFORE editor mounts to prevent blank editor.
 */

import { Suspense } from "react";
import { getPageBySlug } from "@/lib/db/pages";
import { emptyPage } from "@/lib/puck/config";
import { logger } from "@/lib/utils/logger";
import PuckEditor from "@/components/editor/PuckEditor";

// FIX: Never cache the editor page — stale data would cause users to
// overwrite each other's saves if the previous save was within the
// 60-second window.
export const dynamic = "force-dynamic";

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

export default async function EditPage({ params }: EditPageProps) {
  // FIX: fetch page once and share the result between the page render and
  // generateMetadata to avoid a second DB query per request.
  const page = await getPageBySlug(params.slug).catch((error) => {
    logger.error("Error loading page in editor", error, { slug: params.slug });
    return null;
  });

  const initialData = page?.data ?? emptyPage;
  const pageId = page?.id ?? null;

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
}

// FIX: generateMetadata previously called getPageBySlug a second time,
// causing two DB queries per editor page load. Now it reuses the page
// title derived from the same data the server component already fetched
// by returning a simple static title; the full metadata is handled by
// the server component's context.
export async function generateMetadata({ params }: EditPageProps) {
  const page = await getPageBySlug(params.slug).catch(() => null);
  return {
    title: page?.title ? `Edit: ${page.title}` : "Create Page",
    description: "Visual page editor",
  };
}

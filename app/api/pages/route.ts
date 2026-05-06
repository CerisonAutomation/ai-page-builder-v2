/**
 * Pages API Route — POST
 * ✅ Creates new page with auto-generated slug and validation
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getServerSession } from "@/lib/db/supabase";
import { createPage, getPageBySlug, SavePageSchema, listPages } from "@/lib/db/pages";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const timer = logger.startTimer();

  try {
    // ✅ Verify authentication
    const session = await getServerSession();
    if (!session) {
      logger.warn("Unauthorized POST /api/pages");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Parse and validate request body
    const body = await request.json();

    // For new page creation, slug is optional (can be auto-generated)
    const validatedData = SavePageSchema.omit({ slug: true }).parse(body);

    // ✅ Generate slug from title if not provided
    let slug = body.slug;
    if (!slug) {
      slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // ✅ Ensure slug is unique by checking database
      const supabase = await createServerSupabaseClient();
      let counter = 1;
      let testSlug = slug;
      let existing = await getPageBySlug(testSlug, session.user.id);

      while (existing) {
        testSlug = `${slug}-${counter}`;
        counter++;
        existing = await getPageBySlug(testSlug, session.user.id);
      }

      slug = testSlug;
    }

    // ✅ Create page
    const page = await createPage({
      ...validatedData,
      slug,
      user_id: session.user.id,
    });

    logger.info("Page created", { pageId: page.id, slug, duration: timer() });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Validation error in POST /api/pages", error);
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      logger.warn("Slug conflict in POST /api/pages", error);
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    logger.error("Failed to create page in POST /api/pages", error);

    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const published = searchParams.get("published");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Use the listPages function with search
    const result = await listPages(session.user.id, {
      limit,
      offset,
      search: query || undefined,
      published: published ? published === "true" : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to list pages", error);
    return NextResponse.json(
      { error: "Failed to list pages" },
      { status: 500 }
    );
  }
}

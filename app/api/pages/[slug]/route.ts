/**
 * Pages API Route — GET & PUT
 * ✅ Type-safe with Zod validation
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import {
  getPageBySlug,
  updatePage,
  createPage,
} from "@/lib/db/pages";
import { AVAILABLE_BLOCKS } from "@/lib/puck/config";
import { logger } from "@/lib/utils/logger";
import type { Data } from "@measured/puck";

// ✅ VALIDATION SCHEMA
const SavePageSchema = z.object({
    slug: z.string()
      .min(1)
      .max(255)
      .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    data: z.object({
      content: z.array(z.object({
        type: z.string(),
        props: z.record(z.string(), z.unknown()),
        readOnly: z.record(z.string(), z.boolean()).optional(),
      })),
      root: z.object({
        props: z.object({
          title: z.string().min(1),
          description: z.string().optional(),
        }),
      }),
      zones: z.record(z.string(), z.array(z.object({
        type: z.string(),
        props: z.record(z.string(), z.unknown()),
      }))).optional(),
    }) as z.ZodType<Data>,
  });

type SavePageInput = z.infer<typeof SavePageSchema>;

// ✅ GET /api/pages/[slug] — Read page
export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    try {
      const { slug } = await params;
      const page = await getPageBySlug(slug);

      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

      return NextResponse.json(page);
    } catch (error) {
    logger.error("Failed to fetch page", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/pages/[slug] — Update page
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    try {
      const { slug } = await params;
      
      // ✅ Get authenticated user
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // ✅ Parse & validate request
      const body = await req.json();
      const parsed = SavePageSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }

      const { slug: requestSlug, title, description, data } = parsed.data;

      // ✅ Validate slug matches URL
      if (requestSlug !== slug) {
        return NextResponse.json(
          { error: "Slug mismatch" },
          { status: 400 }
        );
      }

      // ✅ Update page (RLS ensures ownership)
      // First get the page to find its ID
      const page = await getPageBySlug(slug, user.id);
      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

      const updated = await updatePage(
        page.id,
        user.id,
        { title, description, data }
      );

      return NextResponse.json(updated);
    } catch (error: unknown) {
      logger.error("Error updating page", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "Page not found") {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/pages/[slug] — Delete page
export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    try {
      const { slug } = await params;
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // ✅ Import after to avoid circular deps
      const { deletePage } = await import("@/lib/db/pages");
      const page = await getPageBySlug(slug, user.id);
      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }
      await deletePage(page.id, user.id);

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("Error deleting page", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}

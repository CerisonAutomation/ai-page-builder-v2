/**
 * Pages API Route — POST (create new page)
 * Handles slug-less creation routed from the editor when pageId is null.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { createPage, getPageBySlug } from "@/lib/db/pages";
import { AVAILABLE_BLOCKS } from "@/lib/puck/config";
import { logger } from "@/lib/utils/logger";
import type { Data } from "@measured/puck";

const CreatePageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  data: z.object({
    content: z.array(
      z.object({
        type: z.enum(AVAILABLE_BLOCKS as [string, ...string[]]),
        props: z.record(z.unknown()),
        readOnly: z.record(z.boolean()).optional(),
      })
    ),
    root: z.object({
      props: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      }),
    }),
    zones: z
      .record(
        z.array(
          z.object({
            type: z.enum(AVAILABLE_BLOCKS as [string, ...string[]]),
            props: z.record(z.unknown()),
          })
        )
      )
      .optional(),
  }) as z.ZodType<Data>,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreatePageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { slug, title, description, data } = parsed.data;

    // Check slug uniqueness
    const existing = await getPageBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 409 }
      );
    }

    const page = await createPage(slug, title, data, user.id);

    logger.info("Page created", { slug, userId: user.id });
    return NextResponse.json(page, { status: 201 });
  } catch (error: unknown) {
    logger.error("Error creating page", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

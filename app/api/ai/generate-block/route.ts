/**
 * Generate Block API Route
 * Auth-protected: requires a valid session before calling Gemini.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { generateBlockFlow } from "@/lib/genkit/flows/generateBlock";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/ai/generate-block
 *
 * Request:
 * {
 *   "prompt": "blue hero section with headline and CTA",
 *   "context": "SaaS landing page"  // optional
 * }
 *
 * Response:
 * {
 *   "componentName": "HeroBlock",
 *   "props": { ... },
 *   "reasoning": "..."
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Auth guard — prevents unauthenticated Gemini quota consumption
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = await generateBlockFlow(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("generate-block failed", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

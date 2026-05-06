/**
 * Generate Page API Route
 * Auth-protected: requires a valid session before calling Gemini.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { generatePageFlow } from "@/lib/genkit/flows/generatePage";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/ai/generate-page
 *
 * Request:
 * {
 *   "description": "SaaS landing page for a project management tool",
 *   "industry": "technology",        // optional
 *   "tone": "professional"           // optional
 * }
 *
 * Response:
 * {
 *   "content": [
 *     { "type": "HeroBlock", "props": {...} },
 *     { "type": "CardGridBlock", "props": {...} },
 *     ...
 *   ],
 *   "root": {
 *     "props": { "title": "...", "description": "..." }
 *   }
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
    const result = await generatePageFlow(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("generate-page failed", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

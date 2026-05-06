/**
 * Generate Page API Route
 * ✅ GenKit appRoute wrapper with authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { appRoute } from "@genkit-ai/next";
import { generatePageFlow } from "@/lib/genkit/flows/generatePage";
import { getServerSession } from "@/lib/db/supabase";
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

const genkitHandler = appRoute(generatePageFlow);

export async function POST(request: NextRequest) {
  try {
    // ✅ SEC-1: Check authentication
    const session = await getServerSession();
    if (!session) {
      logger.warn("Unauthorized request to /api/ai/generate-page");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Generate page request", { userId: session.user.id });
    return await genkitHandler(request);
  } catch (error) {
    logger.error("Generate page error", error);
    return NextResponse.json(
      { error: "Failed to generate page" },
      { status: 500 }
    );
  }
}

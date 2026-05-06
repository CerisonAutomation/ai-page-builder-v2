/**
 * Generate Block API Route
 * ✅ GenKit appRoute wrapper with authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { appRoute } from "@genkit-ai/next";
import { generateBlockFlow } from "@/lib/genkit/flows/generateBlock";
import { getServerSession } from "@/lib/db/supabase";
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

const genkitHandler = appRoute(generateBlockFlow);

export async function POST(request: NextRequest) {
  try {
    // ✅ SEC-1: Check authentication
    const session = await getServerSession();
    if (!session) {
      logger.warn("Unauthorized request to /api/ai/generate-block");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Generate block request", { userId: session.user.id });
    return await genkitHandler(request);
  } catch (error) {
    logger.error("Generate block error", error);
    return NextResponse.json(
      { error: "Failed to generate block" },
      { status: 500 }
    );
  }
}

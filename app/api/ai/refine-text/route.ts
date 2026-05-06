/**
 * Text Refinement API Route
 * ✅ Streams refined text with Gemini using genkit with authentication
 * Supports: make shorter, more engaging, professional tone, fix grammar
 */

import { NextRequest, NextResponse } from "next/server";
import { appRoute } from "@genkit-ai/next";
import { refineTextFlow } from "@/lib/genkit/flows/refineText";
import { getServerSession } from "@/lib/db/supabase";
import { logger } from "@/lib/utils/logger";

const genkitHandler = appRoute(refineTextFlow);

// ✅ NEXT.JS ROUTE HANDLER WITH AUTH
export async function POST(request: NextRequest) {
  try {
    // ✅ SEC-1: Check authentication
    const session = await getServerSession();
    if (!session) {
      logger.warn("Unauthorized request to /api/ai/refine-text");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Refine text request", { userId: session.user.id });
    return await genkitHandler(request);
  } catch (error) {
    logger.error("Refine text error", error);
    return NextResponse.json(
      { error: "Failed to refine text" },
      { status: 500 }
    );
  }
}

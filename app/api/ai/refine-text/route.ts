/**
 * Text Refinement API Route
 * ✅ Streams refined text with Gemini using genkit
 * Supports: make shorter, more engaging, professional tone, fix grammar
 */

import { appRoute } from "@genkit-ai/next";
import { refineTextFlow } from "@/lib/genkit/flows/refineText";

// ✅ NEXT.JS ROUTE HANDLER
export const POST = appRoute(refineTextFlow);

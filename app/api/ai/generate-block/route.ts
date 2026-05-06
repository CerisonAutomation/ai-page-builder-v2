/**
 * Generate Block API Route
 * ✅ GenKit appRoute wrapper
 */

import { appRoute } from "@genkit-ai/next";
import { generateBlockFlow } from "@/lib/genkit/flows/generateBlock";

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
export const POST = appRoute(generateBlockFlow);

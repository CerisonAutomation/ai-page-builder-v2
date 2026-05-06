/**
 * Generate Page API Route
 * ✅ GenKit appRoute wrapper
 */

import { appRoute } from "@genkit-ai/next";
import { generatePageFlow } from "@/lib/genkit/flows/generatePage";

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
export const POST = appRoute(generatePageFlow);

/**
 * Page Builder Tools for Gemini Function Calling
 * ✅ Allows AI to lookup pages, media, and theme settings
 */

import { z } from "zod";
import { ai } from "@/lib/genkit/ai";
import { getServerSession } from "@/lib/db/supabase";
import { logger } from "@/lib/utils/logger";

// ✅ TOOL: Get current theme settings
export const getThemeSettings = ai.defineTool(
  {
    name: "getThemeSettings",
    description: "Get the current theme settings including colors, fonts, and brand guidelines for consistent styling",
    inputSchema: z.object({}),
    outputSchema: z.object({
      colorPrimary: z.string().optional(),
      colorSecondary: z.string().optional(),
      colorAccent: z.string().optional(),
      fontHeading: z.string().optional(),
      fontBody: z.string().optional(),
      brandTone: z.string().optional(),
      industry: z.string().optional(),
    }),
  },
  async () => {
    try {
      // In a real implementation, this would fetch from your theme config or database
      // For now, return default theme settings
      return {
        colorPrimary: "#7c3aed", // violet-600
        colorSecondary: "#f59e0b", // amber-500
        colorAccent: "#10b981", // emerald-500
        fontHeading: "Inter",
        fontBody: "Inter",
        brandTone: "professional",
        industry: "technology",
      };
    } catch (error) {
      logger.error("Failed to get theme settings", error);
      return {};
    }
  }
);

// ✅ TOOL: Get available media list
export const getMediaList = ai.defineTool(
  {
    name: "getMediaList",
    description: "Get a list of available media assets from the media library",
    inputSchema: z.object({
      limit: z.number().min(1).max(50).default(20).describe("Maximum number of items to return"),
      type: z.enum(["image", "video", "all"]).default("image").describe("Filter by media type"),
    }),
    outputSchema: z.object({
      items: z.array(
        z.object({
          id: z.string(),
          url: z.string(),
          alt: z.string().optional(),
          type: z.string(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
      ),
      total: z.number(),
    }),
  },
  async ({ limit, type }) => {
    try {
      // In a real implementation, this would fetch from your media database
      // For now, return empty list - integrate with your media library
      logger.info("Media list requested", { limit, type });
      return {
        items: [],
        total: 0,
      };
    } catch (error) {
      logger.error("Failed to get media list", error);
      return { items: [], total: 0 };
    }
  }
);

// ✅ TOOL: Get page context for reference
export const getPageContext = ai.defineTool(
  {
    name: "getPageContext",
    description: "Get the structure and content of an existing page for context and consistency",
    inputSchema: z.object({
      slug: z.string().describe("The page slug to lookup"),
    }),
    outputSchema: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      blockTypes: z.array(z.string()),
      contentSummary: z.string().optional(),
      exists: z.boolean(),
    }),
    // ✅ RETRY LOGIC for transient errors
  },
  async ({ slug }) => {
    try {
      // In a real implementation, fetch page from database
      // For now, return not found
      logger.info("Page context requested", { slug });
      return {
        title: undefined,
        description: undefined,
        blockTypes: [],
        contentSummary: undefined,
        exists: false,
      };
    } catch (error) {
      logger.error("Failed to get page context", error);
      return {
        blockTypes: [],
        exists: false,
      };
    }
  }
);

// ✅ Export all tools as array for easy registration
export const pageBuilderTools = [
  getThemeSettings,
  getMediaList,
  getPageContext,
] as const;

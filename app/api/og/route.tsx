/**
 * Dynamic OG Image Route — /api/og?slug=<slug>
 *
 * Generates a 1200×630 Open Graph image for any published page.
 * Uses Next.js ImageResponse (based on @vercel/og).
 *
 * @module app/api/og/route
 */

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getPageBySlug } from "@/lib/db/pages";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug") ?? "";

  let title = "AI Page Builder";
  let description = "Create beautiful pages with AI";

  if (slug) {
    const page = await getPageBySlug(slug).catch(() => null);
    if (page) {
      title = page.title;
      description = page.description ?? description;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ✦
          </div>
          <span
            style={{
              color: "#94a3b8",
              fontSize: "18px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            AI Page Builder
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#f8fafc",
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: 1.1,
            margin: "0 0 20px",
            maxWidth: "900px",
          }}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            style={{
              color: "#94a3b8",
              fontSize: "28px",
              fontWeight: 400,
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "800px",
            }}
          >
            {description}
          </p>
        )}

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "999px",
            padding: "8px 20px",
            color: "#a5b4fc",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          Built with AI
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

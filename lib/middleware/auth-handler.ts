/**
 * Authentication Middleware
 * ✅ Verify user session for protected endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/db/supabase";

/**
 * Middleware to check authentication
 * Returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null; // Continue to handler
  } catch (error) {
    console.error("Auth check failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Not authenticated");
    }
    return session.user;
  } catch (error) {
    throw new Error("Unauthorized");
  }
}

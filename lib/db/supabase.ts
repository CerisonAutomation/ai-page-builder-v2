/**
 * Supabase Client Factory
 * ✅ Server-side and client-side client creation with auth
 */

import { createClient } from "@supabase/supabase-js";

// Singleton instances
let serverClient: any = null;
let cachedCookies: any = null;

/**
 * Create server-side Supabase client
 * Uses cookies from Next.js for auth tokens
 */
export async function createServerSupabaseClient() {
  if (!serverClient) {
    // Cookies handled by middleware
    cachedCookies = cookieStore;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    serverClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return serverClient;
}

/**
 * Create client-side Supabase client
 * For use in browser/client components
 */
export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing public Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Get authenticated session from server
 */
export async function getServerSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user from server
 */
export async function getServerUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Create admin Supabase client (for server-side operations with elevated privileges)
 * Uses service role key for unrestricted access
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables for admin client");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

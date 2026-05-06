/**
 * Auth Middleware Helpers
 * ✅ Server-side auth checks for protected routes
 */

import { createServerSupabaseClient } from '@/lib/db/supabase';
import { getUserRole } from './roles';
import { UserRole } from './roles';
import { redirect } from 'next/navigation';

/**
 * Require authentication - redirect if not logged in
 * Use in server components/layouts
 */
export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Require specific role - redirect if not authorized
 * Use in server components/layouts
 */
export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth();
  const supabase = await createServerSupabaseClient();
  const role = await getUserRole(supabase, user.id);

  if (!role || role !== requiredRole) {
    redirect('/unauthorized');
  }

  return { user, role };
}

/**
 * Check if user is authenticated (non-redirecting)
 * Use for conditional rendering
 */
export async function checkAuth() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current user with role
 * Use in server components for user data
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const role = await getUserRole(supabase, user.id);

  return {
    ...user,
    role: role || 'guest' as UserRole,
  };
}

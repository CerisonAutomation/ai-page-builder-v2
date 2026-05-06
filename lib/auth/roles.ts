/**
 * Auth Roles - Type definitions and helper functions
 * ✅ Role-based access control types and utilities
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'owner' | 'guest';

export const ROLES: Record<UserRole, UserRole> = {
  admin: 'admin',
  owner: 'owner',
  guest: 'guest',
};

export const ROLE_HIERARCHY: UserRole[] = ['guest', 'owner', 'admin'];

/**
 * Check if a user has a specific role or higher
 */
export function hasRole(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

  return userLevel >= requiredLevel;
}

/**
 * Get user role from database
 * Server-side function
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return data.role as UserRole;
}

/**
 * Set user role in database
 * Server-side function (admin only)
 */
export async function setUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: UserRole
): Promise<boolean> {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

  return !error;
}

/**
 * Get all users with their roles
 * Server-side function (admin only)
 */
export async function getAllUserRoles(
  supabase: SupabaseClient
): Promise<Array<{ user_id: string; role: UserRole; created_at: string }>> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at');

  if (error || !data) return [];

  return data as Array<{ user_id: string; role: UserRole; created_at: string }>;
}

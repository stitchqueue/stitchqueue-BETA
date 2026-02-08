/**
 * Authentication & Organization Helpers
 * 
 * Functions for getting current user and organization ID.
 * 
 * @module lib/storage/auth
 */

import { supabase } from "../supabase";

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get organization ID for current user
 * Returns null if user not authenticated or no organization
 */
export async function getOrganizationId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  return profile?.organization_id || null;
}

/**
 * Check if current user has an organization
 */
export async function hasOrganization(): Promise<boolean> {
  const orgId = await getOrganizationId();
  return orgId !== null;
}

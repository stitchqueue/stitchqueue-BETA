/**
 * Authentication & Organization Helpers
 * 
 * Functions for getting current user and organization ID.
 * 
 * @module lib/storage/auth
 */

import { supabase } from "../supabase";

// In-memory cache: avoids redundant auth + profile lookups within a session.
// Cleared automatically on sign-out via onAuthStateChange listener.
let cachedOrgId: string | null = null;
let cachePopulated = false;

supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    cachedOrgId = null;
    cachePopulated = false;
  }
});

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
 * Returns null if user not authenticated or no organization.
 * Result is cached in memory so repeated calls within a page load
 * don't re-query auth + profiles every time.
 */
export async function getOrganizationId(): Promise<string | null> {
  if (cachePopulated) return cachedOrgId;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist (new user on first login), return null
  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is expected for new users
      console.error("Error fetching organization ID:", error.message);
    }
    return null;
  }

  cachedOrgId = profile?.organization_id || null;
  cachePopulated = true;
  return cachedOrgId;
}

/**
 * Check if current user has an organization
 */
export async function hasOrganization(): Promise<boolean> {
  const orgId = await getOrganizationId();
  return orgId !== null;
}

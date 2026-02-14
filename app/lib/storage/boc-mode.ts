/**
 * BOC Mode Detection
 *
 * Determines if the user is in "connected mode" — has an active
 * subscription AND archived projects with delivery dates.
 *
 * @module lib/storage/boc-mode
 */

import { supabase } from "../supabase";
import { getCurrentUser } from "./auth";
import { getOrganizationId } from "./auth";

export interface BOCMode {
  isConnected: boolean;
  hasProjects: boolean;
}

/**
 * Check if user qualifies for connected mode.
 */
export async function getBOCMode(): Promise<BOCMode> {
  const user = await getCurrentUser();
  if (!user) return { isConnected: false, hasProjects: false };

  // Check subscription status
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  const isSubscribed =
    !!sub && (sub.status === "active" || sub.status === "trialing");

  // Check for archived projects with a delivery_date
  const orgId = await getOrganizationId();
  if (!orgId) return { isConnected: false, hasProjects: false };

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("stage", "archived")
    .not("delivery_date", "is", null);

  const hasProjects = (count ?? 0) > 0;

  return {
    isConnected: isSubscribed && hasProjects,
    hasProjects,
  };
}

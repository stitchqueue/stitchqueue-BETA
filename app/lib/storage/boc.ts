/**
 * BOC Settings Storage
 *
 * Get and upsert BOC settings per user (not per org).
 *
 * @module lib/storage/boc
 */

import { supabase } from "../supabase";
import type { BOCSettings, OverheadItems, IncidentalsItems } from "../../types";
import { DEFAULT_BOC_SETTINGS } from "../../types";
import { getCurrentUser } from "./auth";

// ── Mappers (inline — BOC is self-contained) ────────────────────────

function mapBOCFromDb(row: Record<string, unknown>): BOCSettings {
  return {
    targetHourlyWage: (row.target_hourly_wage as number) ?? 0,
    experienceLevel: (row.experience_level as BOCSettings["experienceLevel"]) ?? "experienced",
    sphRate: (row.sph_rate as number) ?? 2000,
    monthlyOverhead: (row.monthly_overhead as number) ?? 0,
    overheadItems: (row.overhead_items as OverheadItems) ?? DEFAULT_BOC_SETTINGS.overheadItems,
    incidentalsMinutes: (row.incidentals_minutes as number) ?? 0,
    incidentalsItems: (row.incidentals_items as IncidentalsItems) ?? DEFAULT_BOC_SETTINGS.incidentalsItems,
    projectsPerMonth: (row.projects_per_month as number) ?? 10,
    avgProjectSize: (row.avg_project_size as number) ?? 6000,
  };
}

function mapBOCToDb(settings: BOCSettings) {
  return {
    target_hourly_wage: settings.targetHourlyWage,
    experience_level: settings.experienceLevel,
    sph_rate: settings.sphRate,
    monthly_overhead: settings.monthlyOverhead,
    overhead_items: settings.overheadItems,
    incidentals_minutes: settings.incidentalsMinutes,
    incidentals_items: settings.incidentalsItems,
    projects_per_month: settings.projectsPerMonth,
    avg_project_size: settings.avgProjectSize,
  };
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Get BOC settings for the current user. Returns defaults if no row exists.
 */
export async function getBOCSettings(): Promise<BOCSettings> {
  const user = await getCurrentUser();
  if (!user) return DEFAULT_BOC_SETTINGS;

  const { data, error } = await supabase
    .from("boc_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return DEFAULT_BOC_SETTINGS;
  }

  return mapBOCFromDb(data);
}

/**
 * Save (upsert) BOC settings for the current user.
 */
export async function saveBOCSettings(
  settings: BOCSettings
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const dbRow = {
    user_id: user.id,
    ...mapBOCToDb(settings),
  };

  const { error } = await supabase
    .from("boc_settings")
    .upsert(dbRow, { onConflict: "user_id" });

  if (error) {
    console.error("Error saving BOC settings:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

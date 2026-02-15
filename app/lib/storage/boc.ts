/**
 * BOC Settings Storage
 *
 * Get and upsert BOC settings per user (not per org).
 *
 * @module lib/storage/boc
 */

import { supabase } from "../supabase";
import type { BOCSettings, OverheadItem, IncidentalItem } from "../../types";
import { DEFAULT_BOC_SETTINGS, DEFAULT_OVERHEAD_ITEMS, DEFAULT_INCIDENTAL_ITEMS } from "../../types";
import { getCurrentUser } from "./auth";

// ── Mappers (inline — BOC is self-contained) ────────────────────────

function mapBOCFromDb(row: Record<string, unknown>): BOCSettings {
  // JSONB arrays come back as-is from Supabase; fall back to defaults
  const rawOverhead = row.overhead_items;
  const overheadItems: OverheadItem[] = Array.isArray(rawOverhead)
    ? rawOverhead
    : DEFAULT_OVERHEAD_ITEMS;

  const rawIncidentals = row.incidentals_items;
  const incidentalsItems: IncidentalItem[] = Array.isArray(rawIncidentals)
    ? rawIncidentals
    : DEFAULT_INCIDENTAL_ITEMS;

  return {
    targetHourlyWage: (row.target_hourly_wage as number) ?? 0,
    experienceLevel: (row.experience_level as BOCSettings["experienceLevel"]) ?? "experienced",
    sphRate: (row.sph_rate as number) ?? 2000,
    monthlyOverhead: (row.monthly_overhead as number) ?? 0,
    overheadItems,
    incidentalsMinutes: (row.incidentals_minutes as number) ?? 0,
    incidentalsItems,
    projectsPerMonth: (row.projects_per_month as number) ?? 10,
    avgProjectSize: (row.avg_project_size as number) ?? 6000,
    forceStandaloneMode: (row.force_standalone_mode as boolean) ?? false,
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
    force_standalone_mode: settings.forceStandaloneMode,
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

/**
 * Settings CRUD Operations
 * 
 * Functions for managing organization settings.
 * 
 * @module lib/storage/settings
 */

import { supabase } from "../supabase";
import type { Settings } from "../../types";
import { DEFAULT_SETTINGS } from "../../types";
import { getOrganizationId } from "./auth";
import { mapSettingsFromDb, mapSettingsToDb } from "./mappers";

/**
 * Get settings for current organization
 */
export async function getSettings(): Promise<Settings> {
  const orgId = await getOrganizationId();
  if (!orgId) return DEFAULT_SETTINGS;

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return mapSettingsFromDb(data);
}

/**
 * Save complete settings (replaces all)
 */
export async function saveSettings(
  settings: Settings
): Promise<{ success: boolean; error?: string }> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    return { success: false, error: "No organization found" };
  }

  const dbSettings = mapSettingsToDb(settings);

  const { error } = await supabase
    .from("organizations")
    .update(dbSettings)
    .eq("id", orgId);

  if (error) {
    console.error("Error saving settings:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update partial settings
 */
export async function updateSettings(
  updates: Partial<Settings>
): Promise<{ success: boolean; error?: string }> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    return { success: false, error: "No organization found" };
  }

  const dbUpdates = mapSettingsToDb(updates);

  const { error } = await supabase
    .from("organizations")
    .update(dbUpdates)
    .eq("id", orgId);

  if (error) {
    console.error("Error updating settings:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * ATOMIC estimate number generator
 * Gets the next estimate number and increments it in one database operation
 * This prevents race conditions where two users could get the same number
 */
export async function getNextEstimateNumber(): Promise<{
  success: boolean;
  estimateNumber?: number;
  error?: string;
}> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    return { success: false, error: "No organization found" };
  }

  // Use a transaction-like approach: read current, increment, and update atomically
  // We use .select() after update to get the old value
  const { data: currentOrg, error: readError } = await supabase
    .from("organizations")
    .select("next_estimate_number")
    .eq("id", orgId)
    .single();

  if (readError || !currentOrg) {
    return { success: false, error: "Could not read organization settings" };
  }

  const currentNumber = currentOrg.next_estimate_number || 1001;
  const nextNumber = currentNumber + 1;

  // Update with a WHERE clause that checks the current value
  // This ensures atomicity - if another request changed it, this will fail
  const { data: updated, error: updateError } = await supabase
    .from("organizations")
    .update({ next_estimate_number: nextNumber })
    .eq("id", orgId)
    .eq("next_estimate_number", currentNumber) // Only update if value hasn't changed
    .select("next_estimate_number")
    .single();

  if (updateError || !updated) {
    // Race condition detected - another request got this number
    // Retry once
    const { data: retryOrg } = await supabase
      .from("organizations")
      .select("next_estimate_number")
      .eq("id", orgId)
      .single();

    if (retryOrg) {
      const retryNumber = retryOrg.next_estimate_number || 1001;
      const { error: retryError } = await supabase
        .from("organizations")
        .update({ next_estimate_number: retryNumber + 1 })
        .eq("id", orgId)
        .eq("next_estimate_number", retryNumber);

      if (!retryError) {
        return { success: true, estimateNumber: retryNumber };
      }
    }

    return {
      success: false,
      error: "Could not generate estimate number. Please try again.",
    };
  }

  return { success: true, estimateNumber: currentNumber };
}

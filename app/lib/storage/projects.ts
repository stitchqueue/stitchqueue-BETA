/**
 * Project CRUD Operations
 * 
 * Functions for managing projects in the database.
 * 
 * @module lib/storage/projects
 */

import { supabase } from "../supabase";
import type { Project } from "../../types";
import { getOrganizationId } from "./auth";
import { mapProjectFromDb, mapProjectToDb, mapUpdatesToDb } from "./mappers";

/**
 * Get all projects for current organization
 */
export async function getProjects(): Promise<Project[]> {
  const orgId = await getOrganizationId();
  if (!orgId) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }

  return (data || []).map(mapProjectFromDb);
}

/**
 * Get single project by ID
 */
export async function getProjectById(id: string): Promise<Project | undefined> {
  const orgId = await getOrganizationId();
  if (!orgId) return undefined;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("organization_id", orgId) // SECURITY: Only get if belongs to org
    .single();

  if (error || !data) {
    if (error?.code !== "PGRST116") {
      console.error("Error fetching project:", error?.message);
    }
    return undefined;
  }

  return mapProjectFromDb(data);
}

/**
 * Get projects within a date range
 * Optionally filter by stage
 */
export async function getProjectsByDateRange(
  startDate: string,
  endDate: string,
  stageFilter?: string[]
): Promise<Project[]> {
  const orgId = await getOrganizationId();
  if (!orgId) return [];

  let query = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", orgId)
    .gte("created_at", startDate)
    .lte("created_at", endDate + "T23:59:59.999Z")
    .order("created_at", { ascending: false });

  // Optional stage filtering
  if (stageFilter && stageFilter.length > 0) {
    query = query.in("stage", stageFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching projects by date range:", error.message);
    return [];
  }

  return (data || []).map(mapProjectFromDb);
}

/**
 * Add new project
 */
export async function addProject(
  project: Project
): Promise<{ success: boolean; error?: string }> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    return { success: false, error: "No organization found" };
  }

  const dbProject = mapProjectToDb(project, orgId);

  const { error } = await supabase.from("projects").insert(dbProject);

  if (error) {
    console.error(
      "Error adding project:",
      error.message,
      error.details,
      error.hint
    );
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update existing project
 *
 * Throws on failure so callers' catch blocks fire correctly.
 * Still returns { success: true } on success for backward compat.
 */
export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<{ success: boolean; error?: string }> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    throw new Error("No organization found");
  }

  // SECURITY: Verify project belongs to this organization
  const { data: existingProject } = await supabase
    .from("projects")
    .select("organization_id")
    .eq("id", id)
    .single();

  if (!existingProject || existingProject.organization_id !== orgId) {
    throw new Error("Project not found or access denied");
  }

  const dbUpdates = mapUpdatesToDb(updates);
  dbUpdates.updated_at = new Date().toISOString();

  const { error, data } = await supabase
    .from("projects")
    .update(dbUpdates)
    .eq("id", id)
    .eq("organization_id", orgId) // Extra safety
    .select();

  if (error) {
    console.error("Error updating project:", error.message, error.details, error.hint);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Update failed — no rows affected (possible permissions issue)");
  }

  return { success: true };
}

/**
 * Delete project
 */
export async function deleteProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    return { success: false, error: "No organization found" };
  }

  // SECURITY: Verify project belongs to this organization
  const { data: existingProject } = await supabase
    .from("projects")
    .select("organization_id")
    .eq("id", id)
    .single();

  if (!existingProject || existingProject.organization_id !== orgId) {
    return { success: false, error: "Project not found or access denied" };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId); // Extra safety

  if (error) {
    console.error("Error deleting project:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete ALL projects for the current organization
 * Used by "Clear All Data" in settings
 */
export async function deleteAllProjects(): Promise<{
  success: boolean;
  error?: string;
}> {
  const orgId = await getOrganizationId();
  if (!orgId) {
    return { success: false, error: "No organization found" };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("organization_id", orgId);

  if (error) {
    console.error("Error deleting all projects:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

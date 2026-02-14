/**
 * BOC Performance Data
 *
 * Queries archived projects to compute actual performance metrics.
 *
 * @module lib/storage/boc-performance
 */

import { supabase } from "../supabase";
import { getOrganizationId } from "./auth";

export interface PerformanceData {
  projectCount: number;
  totalRevenue: number;
  totalSqInches: number;
  /** Actual revenue per sq in across all projects in the period */
  actualRatePerSqIn: number;
}

/**
 * Get aggregated performance data from archived projects
 * within a delivered_date range.
 */
export async function getPerformanceData(
  startDate: string,
  endDate: string
): Promise<PerformanceData | null> {
  const orgId = await getOrganizationId();
  if (!orgId) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("invoiced_amount, quilt_width, quilt_length")
    .eq("organization_id", orgId)
    .eq("stage", "archived")
    .not("delivery_date", "is", null)
    .gte("delivery_date", startDate)
    .lte("delivery_date", endDate);

  if (error) {
    console.error("Error fetching performance data:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  let totalRevenue = 0;
  let totalSqInches = 0;

  for (const row of data) {
    totalRevenue += (row.invoiced_amount as number) || 0;
    const w = (row.quilt_width as number) || 0;
    const l = (row.quilt_length as number) || 0;
    totalSqInches += w * l;
  }

  const actualRatePerSqIn = totalSqInches > 0 ? totalRevenue / totalSqInches : 0;

  return {
    projectCount: data.length,
    totalRevenue,
    totalSqInches,
    actualRatePerSqIn,
  };
}

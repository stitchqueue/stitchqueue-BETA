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

// ── Revenue Data ────────────────────────────────────────────────────

export interface RevenueData {
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  pipelineRevenue: number;
}

/**
 * Get revenue summary: this month's paid revenue, last month's,
 * and pipeline value from active projects.
 * Excludes charitable and gift projects from all totals.
 */
export async function getRevenueData(): Promise<RevenueData | null> {
  const orgId = await getOrganizationId();
  if (!orgId) return null;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];

  // This month: archived, paid, paid_date in current month, regular projects only
  const { data: thisMonth, error: e1 } = await supabase
    .from("projects")
    .select("invoiced_amount")
    .eq("organization_id", orgId)
    .eq("stage", "archived")
    .eq("paid", true)
    .gte("paid_date", thisMonthStart)
    .lt("paid_date", nextMonthStart)
    .not("project_type", "in", '("charitable","gift")');

  // Last month: same filters for previous calendar month
  const { data: lastMonth, error: e2 } = await supabase
    .from("projects")
    .select("invoiced_amount")
    .eq("organization_id", orgId)
    .eq("stage", "archived")
    .eq("paid", true)
    .gte("paid_date", lastMonthStart)
    .lt("paid_date", thisMonthStart)
    .not("project_type", "in", '("charitable","gift")');

  // Pipeline: active (non-archived) regular projects
  const { data: pipeline, error: e3 } = await supabase
    .from("projects")
    .select("invoiced_amount, estimate_data")
    .eq("organization_id", orgId)
    .in("stage", ["estimates", "in_progress", "completed"])
    .not("project_type", "in", '("charitable","gift")');

  if (e1) console.error("Revenue this-month query error:", e1.message);
  if (e2) console.error("Revenue last-month query error:", e2.message);
  if (e3) console.error("Revenue pipeline query error:", e3.message);

  const sumInvoiced = (rows: Array<Record<string, unknown>> | null) =>
    (rows || []).reduce((s, r) => s + ((r.invoiced_amount as number) || 0), 0);

  let pipelineRevenue = 0;
  for (const row of pipeline || []) {
    const inv = (row.invoiced_amount as number) || 0;
    if (inv > 0) {
      pipelineRevenue += inv;
    } else {
      // Fallback to estimate total from JSONB
      const ed = row.estimate_data as Record<string, unknown> | null;
      pipelineRevenue += (ed?.total as number) || 0;
    }
  }

  return {
    thisMonthRevenue: sumInvoiced(thisMonth),
    lastMonthRevenue: sumInvoiced(lastMonth),
    pipelineRevenue,
  };
}

/**
 * BOC Donated Quilts Data
 *
 * Queries archived projects with project_type 'gift' or 'charitable'
 * to compute donation summaries.
 *
 * @module lib/storage/boc-donations
 */

import { supabase } from "../supabase";
import { getOrganizationId } from "./auth";

export interface DonationByOrg {
  name: string;
  count: number;
  totalValue: number;
}

export interface DonatedQuiltsData {
  totalProjects: number;
  totalValueDonated: number;
  charitableCount: number;
  charitableValue: number;
  giftCount: number;
  giftValue: number;
  byOrganization: DonationByOrg[];
  /** Total sq inches donated (for hours estimate) */
  totalSqInches: number;
}

/**
 * Get aggregated donation data from archived projects
 * within a delivered_date range.
 */
export async function getDonatedQuiltsData(
  startDate: string,
  endDate: string
): Promise<DonatedQuiltsData | null> {
  const orgId = await getOrganizationId();
  if (!orgId) return null;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "project_type, invoiced_amount, donated_value, quilt_width, quilt_length, client_first_name, client_last_name, delivery_date"
    )
    .eq("organization_id", orgId)
    .eq("stage", "archived")
    .in("project_type", ["gift", "charitable"])
    .not("delivery_date", "is", null)
    .gte("delivery_date", startDate)
    .lte("delivery_date", endDate);

  if (error) {
    console.error("Error fetching donation data:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  let charitableCount = 0;
  let charitableValue = 0;
  let giftCount = 0;
  let giftValue = 0;
  let totalSqInches = 0;
  const orgMap = new Map<string, { count: number; totalValue: number }>();

  for (const row of data) {
    const value =
      (row.donated_value as number) || (row.invoiced_amount as number) || 0;
    const w = (row.quilt_width as number) || 0;
    const l = (row.quilt_length as number) || 0;
    totalSqInches += w * l;

    if (row.project_type === "charitable") {
      charitableCount++;
      charitableValue += value;

      // Group by client name as org name
      const orgName =
        [row.client_first_name, row.client_last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || "Unknown Organization";
      const existing = orgMap.get(orgName) || { count: 0, totalValue: 0 };
      existing.count++;
      existing.totalValue += value;
      orgMap.set(orgName, existing);
    } else {
      giftCount++;
      giftValue += value;
    }
  }

  const byOrganization: DonationByOrg[] = Array.from(orgMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return {
    totalProjects: data.length,
    totalValueDonated: charitableValue + giftValue,
    charitableCount,
    charitableValue,
    giftCount,
    giftValue,
    byOrganization,
    totalSqInches,
  };
}

/** Individual donation record for PDF generation */
export interface DonationRecord {
  clientName: string;
  projectType: string;
  deliveryDate: string;
  value: number;
  sqInches: number;
}

/**
 * Get individual donation records for PDF generation.
 */
export async function getDonationRecords(
  startDate: string,
  endDate: string
): Promise<DonationRecord[]> {
  const orgId = await getOrganizationId();
  if (!orgId) return [];

  const { data, error } = await supabase
    .from("projects")
    .select(
      "project_type, invoiced_amount, donated_value, quilt_width, quilt_length, client_first_name, client_last_name, delivery_date"
    )
    .eq("organization_id", orgId)
    .eq("stage", "archived")
    .eq("project_type", "charitable")
    .not("delivery_date", "is", null)
    .gte("delivery_date", startDate)
    .lte("delivery_date", endDate)
    .order("delivery_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    clientName:
      [row.client_first_name, row.client_last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "Unknown",
    projectType: row.project_type as string,
    deliveryDate: row.delivery_date as string,
    value:
      (row.donated_value as number) || (row.invoiced_amount as number) || 0,
    sqInches:
      ((row.quilt_width as number) || 0) *
      ((row.quilt_length as number) || 0),
  }));
}

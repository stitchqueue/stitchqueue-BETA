/**
 * Revenue Analytics
 * 
 * Functions for calculating revenue metrics and details.
 * 
 * @module lib/storage/reports/revenue
 */

import type { Project } from "../../../types";
import { getProjectsByDateRange } from "../projects";

/**
 * Get revenue analytics for completed projects
 * Includes detail arrays for drill-down views
 */
export async function getRevenueAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  totalRevenue: number;
  quiltingRevenue: number;
  battingRevenue: number;
  bobbinRevenue: number;
  extraChargesRevenue: number;
  donationValue: number;
  projectCount: number;
  averageProjectValue: number;
  // Detail arrays for drill-down
  revenueDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    quiltingAmount: number;
    materialsAmount: number;
    date: string;
  }>;
  quiltingDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    quiltSize: string;
    quiltingType: string;
  }>;
  materialsDetails: Array<{
    projectId: string;
    clientName: string;
    battingAmount: number;
    bobbinAmount: number;
    totalAmount: number;
  }>;
  donationDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    date: string;
  }>;
}> {
  // Get completed projects (Paid/Shipped or Archived with payments)
  const completedProjects = await getProjectsByDateRange(
    startDate,
    endDate,
    ["Paid/Shipped", "Archived"]
  );

  let totalRevenue = 0;
  let quiltingRevenue = 0;
  let battingRevenue = 0;
  let bobbinRevenue = 0;
  let extraChargesRevenue = 0;
  let donationValue = 0;
  let projectCount = 0;

  // Detail arrays
  const revenueDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    quiltingAmount: number;
    materialsAmount: number;
    date: string;
  }> = [];
  const quiltingDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    quiltSize: string;
    quiltingType: string;
  }> = [];
  const materialsDetails: Array<{
    projectId: string;
    clientName: string;
    battingAmount: number;
    bobbinAmount: number;
    totalAmount: number;
  }> = [];
  const donationDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    date: string;
  }> = [];

  completedProjects.forEach((project) => {
    const estimate = project.estimateData;
    if (!estimate?.total) return;

    projectCount++;
    const clientName = `${project.clientFirstName} ${project.clientLastName}`.trim();
    const quiltSize = project.quiltWidth && project.quiltLength 
      ? `${project.quiltWidth}" × ${project.quiltLength}"` 
      : "N/A";

    if (project.isDonation) {
      donationValue += estimate.total;
      donationDetails.push({
        projectId: project.id,
        clientName,
        amount: estimate.total,
        date: project.createdAt,
      });
    } else {
      totalRevenue += estimate.total;
      revenueDetails.push({
        projectId: project.id,
        clientName,
        amount: estimate.total,
        quiltingAmount: estimate.quiltingTotal || 0,
        materialsAmount: (estimate.battingTotal || 0) + (estimate.bobbinTotal || 0),
        date: project.createdAt,
      });
    }

    // Quilting details (both paid and donation)
    if (estimate.quiltingTotal && estimate.quiltingTotal > 0) {
      quiltingDetails.push({
        projectId: project.id,
        clientName,
        amount: estimate.quiltingTotal,
        quiltSize,
        quiltingType: project.quiltingType || "N/A",
      });
    }

    // Materials details (both paid and donation)
    const battingAmt = estimate.battingTotal || 0;
    const bobbinAmt = estimate.bobbinTotal || 0;
    if (battingAmt > 0 || bobbinAmt > 0) {
      materialsDetails.push({
        projectId: project.id,
        clientName,
        battingAmount: battingAmt,
        bobbinAmount: bobbinAmt,
        totalAmount: battingAmt + bobbinAmt,
      });
    }

    quiltingRevenue += estimate.quiltingTotal || 0;
    battingRevenue += estimate.battingTotal || 0;
    bobbinRevenue += estimate.bobbinTotal || 0;
    extraChargesRevenue += estimate.extraChargesTotal || 0;
  });

  return {
    totalRevenue,
    quiltingRevenue,
    battingRevenue,
    bobbinRevenue,
    extraChargesRevenue,
    donationValue,
    projectCount,
    averageProjectValue: projectCount > 0 ? totalRevenue / projectCount : 0,
    revenueDetails,
    quiltingDetails,
    materialsDetails,
    donationDetails,
  };
}

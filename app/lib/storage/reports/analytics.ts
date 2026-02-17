/**
 * Materials & Client Analytics
 * 
 * Functions for tracking materials usage and client data.
 * 
 * @module lib/storage/reports/analytics
 */

import { getProjectsByDateRange, getProjects } from "../projects";

/**
 * Get materials usage analytics
 */
export async function getMaterialsAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  bobbinsSold: number;
  bobbinRevenue: number;
  battingYardsUsed: number;
  battingRevenue: number;
  popularBattingTypes: Array<{ name: string; count: number }>;
  popularBobbinTypes: Array<{ name: string; count: number }>;
}> {
  const projects = await getProjectsByDateRange(
    startDate,
    endDate,
    ["completed", "archived"]
  );

  let bobbinsSold = 0;
  let bobbinRevenue = 0;
  let battingYardsUsed = 0;
  let battingRevenue = 0;
  
  const battingTypeCount = new Map<string, number>();
  const bobbinTypeCount = new Map<string, number>();

  projects.forEach((project) => {
    const estimate = project.estimateData;
    if (!estimate) return;

    // Bobbin analytics
    if (estimate.bobbinCount && estimate.bobbinCount > 0) {
      bobbinsSold += estimate.bobbinCount;
      bobbinRevenue += project.isDonation ? 0 : (estimate.bobbinTotal || 0);
      
      const bobbinType = estimate.bobbinName || project.bobbinChoice || "Unknown";
      bobbinTypeCount.set(bobbinType, (bobbinTypeCount.get(bobbinType) || 0) + estimate.bobbinCount);
    }

    // Batting analytics (if not client supplied)
    if (!project.clientSuppliesBatting && estimate.battingLengthNeeded && estimate.battingLengthNeeded > 0) {
      battingYardsUsed += estimate.battingLengthNeeded / 36; // Convert inches to yards
      battingRevenue += project.isDonation ? 0 : (estimate.battingTotal || 0);
      
      const battingType = project.battingChoice || "Unknown";
      battingTypeCount.set(battingType, (battingTypeCount.get(battingType) || 0) + 1);
    }
  });

  // Convert maps to sorted arrays
  const popularBattingTypes = Array.from(battingTypeCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const popularBobbinTypes = Array.from(bobbinTypeCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    bobbinsSold,
    bobbinRevenue,
    battingYardsUsed,
    battingRevenue,
    popularBattingTypes,
    popularBobbinTypes,
  };
}

/**
 * Get client analysis data
 */
export async function getClientAnalytics(): Promise<{
  topClientsByRevenue: Array<{
    name: string;
    email?: string;
    projectCount: number;
    totalRevenue: number;
    lastProjectDate: string;
  }>;
  repeatClientPercentage: number;
  totalUniqueClients: number;
}> {
  const allProjects = await getProjects();
  const clientMap = new Map<string, {
    name: string;
    email?: string;
    projectCount: number;
    totalRevenue: number;
    lastProjectDate: string;
  }>();

  allProjects.forEach((project) => {
    const clientKey = `${project.clientFirstName} ${project.clientLastName}`.toLowerCase();
    const revenue = project.estimateData?.total || 0;
    
    if (clientMap.has(clientKey)) {
      const existing = clientMap.get(clientKey)!;
      existing.projectCount++;
      existing.totalRevenue += project.isDonation ? 0 : revenue;
      existing.lastProjectDate = project.createdAt > existing.lastProjectDate 
        ? project.createdAt : existing.lastProjectDate;
    } else {
      clientMap.set(clientKey, {
        name: `${project.clientFirstName} ${project.clientLastName}`,
        email: project.clientEmail,
        projectCount: 1,
        totalRevenue: project.isDonation ? 0 : revenue,
        lastProjectDate: project.createdAt,
      });
    }
  });

  const clientData = Array.from(clientMap.values());
  const topClientsByRevenue = clientData
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const repeatClients = clientData.filter(client => client.projectCount > 1).length;
  const repeatClientPercentage = clientData.length > 0 
    ? (repeatClients / clientData.length) * 100 : 0;

  return {
    topClientsByRevenue,
    repeatClientPercentage,
    totalUniqueClients: clientData.length,
  };
}

/**
 * Get tax preparation summary for donations
 */
export async function getTaxSummary(year: number): Promise<{
  totalDonationValue: number;
  materialsDonatedValue: number;
  servicesDonatedValue: number;
  charitableMileage: number;
  charitableMileageValue: number;
  donationCount: number;
}> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  
  const donationProjects = await getProjectsByDateRange(startDate, endDate);
  const donations = donationProjects.filter(p => p.isDonation);

  let totalDonationValue = 0;
  let materialsDonatedValue = 0;
  let servicesDonatedValue = 0;
  let charitableMileage = 0;
  let charitableMileageValue = 0;

  donations.forEach((project) => {
    const estimate = project.estimateData;
    if (!estimate?.total) return;

    totalDonationValue += estimate.total;
    
    // Materials (batting + bobbins) are deductible
    const materialsValue = (estimate.battingTotal || 0) + (estimate.bobbinTotal || 0);
    materialsDonatedValue += materialsValue;
    
    // Services (quilting + binding + extra charges) are not deductible
    servicesDonatedValue += estimate.total - materialsValue;

    // Mileage
    if (estimate.mileage && estimate.mileage > 0) {
      charitableMileage += estimate.mileage;
      charitableMileageValue += estimate.mileageTotal || 0;
    }
  });

  return {
    totalDonationValue,
    materialsDonatedValue,
    servicesDonatedValue,
    charitableMileage,
    charitableMileageValue,
    donationCount: donations.length,
  };
}

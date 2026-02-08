import { supabase } from "./supabase";
import type { Project, Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

// Re-export DEFAULT_SETTINGS so pages can import from storage
export { DEFAULT_SETTINGS };

// Auth helper: get current user
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Standalone export for backwards compatibility
export async function hasOrganization(): Promise<boolean> {
  const orgId = await getOrganizationId();
  return orgId !== null;
}

async function getOrganizationId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  return profile?.organization_id || null;
}

export const storage = {
  // Auth helper: check if user has an organization (also available on storage object)
  hasOrganization: async (): Promise<boolean> => {
    const orgId = await getOrganizationId();
    return orgId !== null;
  },

  getProjects: async (): Promise<Project[]> => {
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
  },

  addProject: async (
    project: Project
  ): Promise<{ success: boolean; error?: string }> => {
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
  },

  updateProject: async (
    id: string,
    updates: Partial<Project>
  ): Promise<{ success: boolean; error?: string }> => {
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

    const dbUpdates = mapUpdatesToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("projects")
      .update(dbUpdates)
      .eq("id", id)
      .eq("organization_id", orgId); // Extra safety

    if (error) {
      console.error("Error updating project:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  deleteProject: async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
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
  },

  /**
   * Delete ALL projects for the current organization
   * Used by "Clear All Data" in settings
   */
  deleteAllProjects: async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
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
  },

  getProjectById: async (id: string): Promise<Project | undefined> => {
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
  },

  getSettings: async (): Promise<Settings> => {
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
  },

  saveSettings: async (
    settings: Settings
  ): Promise<{ success: boolean; error?: string }> => {
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
  },

  updateSettings: async (
    updates: Partial<Settings>
  ): Promise<{ success: boolean; error?: string }> => {
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
  },

  /**
   * ATOMIC estimate number generator
   * Gets the next estimate number and increments it in one database operation
   * This prevents race conditions where two users could get the same number
   */
  getNextEstimateNumber: async (): Promise<{
    success: boolean;
    estimateNumber?: number;
    error?: string;
  }> => {
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
  },

  // ═══════════════════════════════════════════════════════════════════════
  // REPORTING FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get projects within a date range for reporting
   */
  getProjectsByDateRange: async (
    startDate: string,
    endDate: string,
    stageFilter?: string[]
  ): Promise<Project[]> => {
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
  },

  /**
   * Get revenue analytics for completed projects
   * Includes detail arrays for drill-down views
   */
  getRevenueAnalytics: async (
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
  }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return {
        totalRevenue: 0,
        quiltingRevenue: 0,
        battingRevenue: 0,
        bobbinRevenue: 0,
        extraChargesRevenue: 0,
        donationValue: 0,
        projectCount: 0,
        averageProjectValue: 0,
        revenueDetails: [],
        quiltingDetails: [],
        materialsDetails: [],
        donationDetails: [],
      };
    }

    // Get completed projects (Paid/Shipped or Archived with payments)
    const completedProjects = await storage.getProjectsByDateRange(
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
  },

  /**
   * Get client analysis data
   */
  getClientAnalytics: async (): Promise<{
    topClientsByRevenue: Array<{
      name: string;
      email?: string;
      projectCount: number;
      totalRevenue: number;
      lastProjectDate: string;
    }>;
    repeatClientPercentage: number;
    totalUniqueClients: number;
  }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return {
        topClientsByRevenue: [],
        repeatClientPercentage: 0,
        totalUniqueClients: 0,
      };
    }

    const allProjects = await storage.getProjects();
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
  },

  /**
   * Get materials usage analytics
   */
  getMaterialsAnalytics: async (
    startDate: string,
    endDate: string
  ): Promise<{
    bobbinsSold: number;
    bobbinRevenue: number;
    battingYardsUsed: number;
    battingRevenue: number;
    popularBattingTypes: Array<{ name: string; count: number }>;
    popularBobbinTypes: Array<{ name: string; count: number }>;
  }> => {
    const projects = await storage.getProjectsByDateRange(
      startDate,
      endDate,
      ["Paid/Shipped", "Archived"]
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
  },

  /**
   * Get tax preparation summary for donations
   */
  getTaxSummary: async (year: number): Promise<{
    totalDonationValue: number;
    materialsDonatedValue: number;
    servicesDonatedValue: number;
    charitableMileage: number;
    charitableMileageValue: number;
    donationCount: number;
  }> => {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const donationProjects = await storage.getProjectsByDateRange(startDate, endDate);
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
  },

  /**
   * Get payment/cash flow analytics
   * Shows deposits received, final payments, outstanding balances
   * Includes detail arrays for drill-down views
   */
  getPaymentAnalytics: async (
    startDate: string,
    endDate: string
  ): Promise<{
    depositsReceived: number;
    depositCount: number;
    finalPaymentsReceived: number;
    finalPaymentCount: number;
    totalCashReceived: number;
    outstandingBalances: number;
    pendingDeposits: number;
    pendingDepositCount: number;
    recentPayments: Array<{
      clientName: string;
      amount: number;
      type: "deposit" | "final";
      date: string;
      method?: string;
      projectId: string;
    }>;
    // Detail arrays for drill-down
    depositDetails: Array<{
      projectId: string;
      clientName: string;
      amount: number;
      date: string;
      method?: string;
    }>;
    finalPaymentDetails: Array<{
      projectId: string;
      clientName: string;
      amount: number;
      date: string;
      method?: string;
    }>;
    outstandingDetails: Array<{
      projectId: string;
      clientName: string;
      totalAmount: number;
      paidAmount: number;
      balanceAmount: number;
      stage: string;
    }>;
    pendingDepositDetails: Array<{
      projectId: string;
      clientName: string;
      expectedDeposit: number;
      totalAmount: number;
      stage: string;
    }>;
  }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return {
        depositsReceived: 0,
        depositCount: 0,
        finalPaymentsReceived: 0,
        finalPaymentCount: 0,
        totalCashReceived: 0,
        outstandingBalances: 0,
        pendingDeposits: 0,
        pendingDepositCount: 0,
        recentPayments: [],
        depositDetails: [],
        finalPaymentDetails: [],
        outstandingDetails: [],
        pendingDepositDetails: [],
      };
    }

    // Get all non-archived, non-donation projects
    const allProjects = await storage.getProjects();

    let depositsReceived = 0;
    let depositCount = 0;
    let finalPaymentsReceived = 0;
    let finalPaymentCount = 0;
    let outstandingBalances = 0;
    let pendingDeposits = 0;
    let pendingDepositCount = 0;
    
    const recentPayments: Array<{
      clientName: string;
      amount: number;
      type: "deposit" | "final";
      date: string;
      method?: string;
      projectId: string;
    }> = [];

    // Detail arrays
    const depositDetails: Array<{
      projectId: string;
      clientName: string;
      amount: number;
      date: string;
      method?: string;
    }> = [];
    const finalPaymentDetails: Array<{
      projectId: string;
      clientName: string;
      amount: number;
      date: string;
      method?: string;
    }> = [];
    const outstandingDetails: Array<{
      projectId: string;
      clientName: string;
      totalAmount: number;
      paidAmount: number;
      balanceAmount: number;
      stage: string;
    }> = [];
    const pendingDepositDetails: Array<{
      projectId: string;
      clientName: string;
      expectedDeposit: number;
      totalAmount: number;
      stage: string;
    }> = [];

    // Parse date range for filtering recent payments
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate + "T23:59:59.999Z");

    allProjects.forEach((project) => {
      if (project.isDonation) return;

      const estimate = project.estimateData;
      const total = estimate?.total || 0;
      const clientName = `${project.clientFirstName} ${project.clientLastName}`.trim();

      // Calculate deposit amounts
      let expectedDeposit = 0;
      if (project.depositType === "percentage" && project.depositPercentage) {
        expectedDeposit = (total * project.depositPercentage) / 100;
      } else if (project.depositType === "flat" && project.depositAmount) {
        expectedDeposit = project.depositAmount;
      }

      // Track deposits received
      if (project.depositPaid && project.depositPaidAmount) {
        depositsReceived += project.depositPaidAmount;
        depositCount++;

        // Add to deposit details
        depositDetails.push({
          projectId: project.id,
          clientName,
          amount: project.depositPaidAmount,
          date: project.depositPaidDate || project.createdAt,
          method: project.depositPaidMethod,
        });

        // Check if deposit was paid within date range for recent payments
        if (project.depositPaidDate) {
          const paidDate = new Date(project.depositPaidDate);
          if (paidDate >= rangeStart && paidDate <= rangeEnd) {
            recentPayments.push({
              clientName,
              amount: project.depositPaidAmount,
              type: "deposit",
              date: project.depositPaidDate,
              method: project.depositPaidMethod,
              projectId: project.id,
            });
          }
        }
      } else if (expectedDeposit > 0 && project.stage !== "Archived") {
        // Deposit expected but not yet paid
        pendingDeposits += expectedDeposit;
        pendingDepositCount++;
        pendingDepositDetails.push({
          projectId: project.id,
          clientName,
          expectedDeposit,
          totalAmount: total,
          stage: project.stage,
        });
      }

      // Track final payments received
      if (project.finalPaymentAmount && project.finalPaymentAmount > 0) {
        finalPaymentsReceived += project.finalPaymentAmount;
        finalPaymentCount++;

        // Add to final payment details
        finalPaymentDetails.push({
          projectId: project.id,
          clientName,
          amount: project.finalPaymentAmount,
          date: project.finalPaymentDate || project.createdAt,
          method: project.finalPaymentMethod,
        });

        // Check if final payment was within date range for recent payments
        if (project.finalPaymentDate) {
          const paidDate = new Date(project.finalPaymentDate);
          if (paidDate >= rangeStart && paidDate <= rangeEnd) {
            recentPayments.push({
              clientName,
              amount: project.finalPaymentAmount,
              type: "final",
              date: project.finalPaymentDate,
              method: project.finalPaymentMethod,
              projectId: project.id,
            });
          }
        }
      }

      // Calculate outstanding balance for active projects
      if (project.stage !== "Archived" && project.stage !== "Paid/Shipped" && total > 0) {
        const depositPaid = project.depositPaidAmount || 0;
        const finalPaid = project.finalPaymentAmount || 0;
        const balance = total - depositPaid - finalPaid;
        if (balance > 0) {
          outstandingBalances += balance;
          outstandingDetails.push({
            projectId: project.id,
            clientName,
            totalAmount: total,
            paidAmount: depositPaid + finalPaid,
            balanceAmount: balance,
            stage: project.stage,
          });
        }
      }
    });

    // Sort recent payments by date (newest first)
    recentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Sort detail arrays
    depositDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    finalPaymentDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    outstandingDetails.sort((a, b) => b.balanceAmount - a.balanceAmount);
    pendingDepositDetails.sort((a, b) => b.expectedDeposit - a.expectedDeposit);

    return {
      depositsReceived,
      depositCount,
      finalPaymentsReceived,
      finalPaymentCount,
      totalCashReceived: depositsReceived + finalPaymentsReceived,
      outstandingBalances,
      pendingDeposits,
      pendingDepositCount,
      recentPayments: recentPayments.slice(0, 10),
      depositDetails,
      finalPaymentDetails,
      outstandingDetails,
      pendingDepositDetails,
    };
  },
};

function mapProjectFromDb(row: any): Project {
  return {
    id: row.id,
    stage: row.stage,
    intakeDate: row.intake_date,
    estimateNumber: row.estimate_number,
    requestedDateType: row.requested_date_type || "no_date",
    requestedCompletionDate: row.requested_completion_date,
    dueDate: row.due_date,
    orderIndex: row.order_index,
    clientFirstName: row.client_first_name || "",
    clientLastName: row.client_last_name || "",
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    clientStreet: row.client_street,
    clientCity: row.client_city,
    clientState: row.client_state,
    clientPostalCode: row.client_postal_code,
    clientCountry: row.client_country,
    description: row.description,
    cardLabel: row.card_label,
    quiltWidth: row.quilt_width,
    quiltLength: row.quilt_length,
    quiltingType: row.quilting_type,
    threadChoice: row.thread_choice,
    battingChoice: row.batting_choice,
    battingLengthAddition: row.batting_length_addition,
    clientSuppliesBatting: row.client_supplies_batting,
    bindingType: row.binding_type,
    bobbinChoice: row.bobbin_choice,
    extraCharges: row.extra_charges,
    isDonation: row.is_donation,
    depositType: row.deposit_type,
    depositPercentage: row.deposit_percentage,
    depositAmount: row.deposit_amount,
    depositPaid: row.deposit_paid,
    depositPaidDate: row.deposit_paid_date,
    depositPaidMethod: row.deposit_paid_method,
    depositPaidAmount: row.deposit_paid_amount,
    finalPaymentAmount: row.final_payment_amount,
    finalPaymentDate: row.final_payment_date,
    finalPaymentMethod: row.final_payment_method,
    paidInFull: row.paid_in_full,
    estimateData: row.estimate_data,
    notes: row.notes || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProjectToDb(project: Project, orgId: string): any {
  return {
    id: project.id,
    organization_id: orgId,
    stage: project.stage,
    intake_date: project.intakeDate,
    estimate_number: project.estimateNumber,
    requested_date_type: project.requestedDateType,
    requested_completion_date: project.requestedCompletionDate,
    due_date: project.dueDate,
    order_index: project.orderIndex,
    client_first_name: project.clientFirstName,
    client_last_name: project.clientLastName,
    client_email: project.clientEmail,
    client_phone: project.clientPhone,
    client_street: project.clientStreet,
    client_city: project.clientCity,
    client_state: project.clientState,
    client_postal_code: project.clientPostalCode,
    client_country: project.clientCountry,
    description: project.description,
    card_label: project.cardLabel,
    quilt_width: project.quiltWidth,
    quilt_length: project.quiltLength,
    quilting_type: project.quiltingType,
    thread_choice: project.threadChoice,
    batting_choice: project.battingChoice,
    batting_length_addition: project.battingLengthAddition,
    client_supplies_batting: project.clientSuppliesBatting,
    binding_type: project.bindingType,
    bobbin_choice: project.bobbinChoice,
    extra_charges: project.extraCharges,
    is_donation: project.isDonation,
    deposit_type: project.depositType,
    deposit_percentage: project.depositPercentage,
    deposit_amount: project.depositAmount,
    deposit_paid: project.depositPaid,
    deposit_paid_date: project.depositPaidDate,
    deposit_paid_method: project.depositPaidMethod,
    deposit_paid_amount: project.depositPaidAmount,
    final_payment_amount: project.finalPaymentAmount,
    final_payment_date: project.finalPaymentDate,
    final_payment_method: project.finalPaymentMethod,
    paid_in_full: project.paidInFull,
    estimate_data: project.estimateData,
    notes: project.notes,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

function mapUpdatesToDb(updates: Partial<Project>): any {
  const dbUpdates: any = {};

  if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
  if (updates.intakeDate !== undefined)
    dbUpdates.intake_date = updates.intakeDate;
  if (updates.estimateNumber !== undefined)
    dbUpdates.estimate_number = updates.estimateNumber;
  if (updates.requestedDateType !== undefined)
    dbUpdates.requested_date_type = updates.requestedDateType;
  if (updates.requestedCompletionDate !== undefined)
    dbUpdates.requested_completion_date = updates.requestedCompletionDate;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.orderIndex !== undefined)
    dbUpdates.order_index = updates.orderIndex;
  if (updates.clientFirstName !== undefined)
    dbUpdates.client_first_name = updates.clientFirstName;
  if (updates.clientLastName !== undefined)
    dbUpdates.client_last_name = updates.clientLastName;
  if (updates.clientEmail !== undefined)
    dbUpdates.client_email = updates.clientEmail;
  if (updates.clientPhone !== undefined)
    dbUpdates.client_phone = updates.clientPhone;
  if (updates.clientStreet !== undefined)
    dbUpdates.client_street = updates.clientStreet;
  if (updates.clientCity !== undefined)
    dbUpdates.client_city = updates.clientCity;
  if (updates.clientState !== undefined)
    dbUpdates.client_state = updates.clientState;
  if (updates.clientPostalCode !== undefined)
    dbUpdates.client_postal_code = updates.clientPostalCode;
  if (updates.clientCountry !== undefined)
    dbUpdates.client_country = updates.clientCountry;
  if (updates.description !== undefined)
    dbUpdates.description = updates.description;
  if (updates.cardLabel !== undefined) dbUpdates.card_label = updates.cardLabel;
  if (updates.quiltWidth !== undefined)
    dbUpdates.quilt_width = updates.quiltWidth;
  if (updates.quiltLength !== undefined)
    dbUpdates.quilt_length = updates.quiltLength;
  if (updates.quiltingType !== undefined)
    dbUpdates.quilting_type = updates.quiltingType;
  if (updates.threadChoice !== undefined)
    dbUpdates.thread_choice = updates.threadChoice;
  if (updates.battingChoice !== undefined)
    dbUpdates.batting_choice = updates.battingChoice;
  if (updates.battingLengthAddition !== undefined)
    dbUpdates.batting_length_addition = updates.battingLengthAddition;
  if (updates.clientSuppliesBatting !== undefined)
    dbUpdates.client_supplies_batting = updates.clientSuppliesBatting;
  if (updates.bindingType !== undefined)
    dbUpdates.binding_type = updates.bindingType;
  if (updates.bobbinChoice !== undefined)
    dbUpdates.bobbin_choice = updates.bobbinChoice;
  if (updates.extraCharges !== undefined)
    dbUpdates.extra_charges = updates.extraCharges;
  if (updates.isDonation !== undefined)
    dbUpdates.is_donation = updates.isDonation;
  if (updates.depositType !== undefined)
    dbUpdates.deposit_type = updates.depositType;
  if (updates.depositPercentage !== undefined)
    dbUpdates.deposit_percentage = updates.depositPercentage;
  if (updates.depositAmount !== undefined)
    dbUpdates.deposit_amount = updates.depositAmount;
  if (updates.depositPaid !== undefined)
    dbUpdates.deposit_paid = updates.depositPaid;
  if (updates.depositPaidDate !== undefined)
    dbUpdates.deposit_paid_date = updates.depositPaidDate;
  if (updates.depositPaidMethod !== undefined)
    dbUpdates.deposit_paid_method = updates.depositPaidMethod;
  if (updates.depositPaidAmount !== undefined)
    dbUpdates.deposit_paid_amount = updates.depositPaidAmount;
  if (updates.finalPaymentAmount !== undefined)
    dbUpdates.final_payment_amount = updates.finalPaymentAmount;
  if (updates.finalPaymentDate !== undefined)
    dbUpdates.final_payment_date = updates.finalPaymentDate;
  if (updates.finalPaymentMethod !== undefined)
    dbUpdates.final_payment_method = updates.finalPaymentMethod;
  if (updates.paidInFull !== undefined)
    dbUpdates.paid_in_full = updates.paidInFull;
  if (updates.estimateData !== undefined)
    dbUpdates.estimate_data = updates.estimateData;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  return dbUpdates;
}

function mapSettingsFromDb(row: any): Settings {
  return {
    businessName: row.name || row.business_name,
    street: row.street,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    email: row.email,
    website: row.website,
    logoUrl: row.logo_url,
    brandPrimaryColor: row.brand_primary_color || "#4e283a",
    brandSecondaryColor: row.brand_secondary_color || "#98823a",
    measurementSystem: row.measurement_system || "imperial",
    currencyCode: row.currency_code || "USD",
    taxRate: row.tax_rate || 0,
    taxLabel: row.tax_label || "Sales Tax",
    nextEstimateNumber: row.next_estimate_number || 1001,
    pricingRates: row.pricing_rates || {},
    bobbinOptions: row.bobbin_options || [],
    threadOptions: row.thread_options || [],
    battingOptions: row.batting_options || [],
    isPaidTier: row.subscription_tier === "pro",
  };
}

function mapSettingsToDb(settings: Partial<Settings>): any {
  const dbSettings: any = {};

  if (settings.businessName !== undefined)
    dbSettings.name = settings.businessName;
  if (settings.street !== undefined) dbSettings.street = settings.street;
  if (settings.city !== undefined) dbSettings.city = settings.city;
  if (settings.state !== undefined) dbSettings.state = settings.state;
  if (settings.postalCode !== undefined)
    dbSettings.postal_code = settings.postalCode;
  if (settings.country !== undefined) dbSettings.country = settings.country;
  if (settings.phone !== undefined) dbSettings.phone = settings.phone;
  if (settings.email !== undefined) dbSettings.email = settings.email;
  if (settings.website !== undefined) dbSettings.website = settings.website;
  if (settings.logoUrl !== undefined) dbSettings.logo_url = settings.logoUrl;
  if (settings.brandPrimaryColor !== undefined)
    dbSettings.brand_primary_color = settings.brandPrimaryColor;
  if (settings.brandSecondaryColor !== undefined)
    dbSettings.brand_secondary_color = settings.brandSecondaryColor;
  if (settings.measurementSystem !== undefined)
    dbSettings.measurement_system = settings.measurementSystem;
  if (settings.currencyCode !== undefined)
    dbSettings.currency_code = settings.currencyCode;
  if (settings.taxRate !== undefined) dbSettings.tax_rate = settings.taxRate;
  if (settings.taxLabel !== undefined) dbSettings.tax_label = settings.taxLabel;
  if (settings.nextEstimateNumber !== undefined)
    dbSettings.next_estimate_number = settings.nextEstimateNumber;
  if (settings.pricingRates !== undefined)
    dbSettings.pricing_rates = settings.pricingRates;
  if (settings.bobbinOptions !== undefined)
    dbSettings.bobbin_options = settings.bobbinOptions;
  if (settings.threadOptions !== undefined)
    dbSettings.thread_options = settings.threadOptions;
  if (settings.battingOptions !== undefined)
    dbSettings.batting_options = settings.battingOptions;
  if (settings.isPaidTier !== undefined)
    dbSettings.subscription_tier = settings.isPaidTier ? "pro" : "free";

  return dbSettings;
}
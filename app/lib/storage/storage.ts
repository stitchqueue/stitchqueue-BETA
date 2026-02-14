/**
 * Storage Module - Main Orchestrator
 * 
 * Central API for all database operations.
 * Re-exports functions from specialized modules.
 * 
 * @module lib/storage
 */

import { DEFAULT_SETTINGS } from "../../types";

// Re-export DEFAULT_SETTINGS for backwards compatibility
export { DEFAULT_SETTINGS };

// Export auth helpers
export { getCurrentUser, hasOrganization } from "./auth";

// Export project operations
export {
  getProjects,
  getProjectById,
  getProjectsByDateRange,
  addProject,
  updateProject,
  deleteProject,
  deleteAllProjects,
} from "./projects";

// Export settings operations
export {
  getSettings,
  saveSettings,
  updateSettings,
  getNextEstimateNumber,
} from "./settings";

// Export reporting functions
export {
  getRevenueAnalytics,
  getPaymentAnalytics,
  getMaterialsAnalytics,
  getClientAnalytics,
  getTaxSummary,
} from "./reports";

// Export BOC operations
export { getBOCSettings, saveBOCSettings } from "./boc";
export { getBOCMode } from "./boc-mode";
export { getPerformanceData } from "./boc-performance";
export { getDonatedQuiltsData, getDonationRecords } from "./boc-donations";

/**
 * Storage object for backwards compatibility
 * Provides the same API as before, but now delegates to modular functions
 */
export const storage = {
  // Auth
  hasOrganization: async () => {
    const { hasOrganization } = await import("./auth");
    return hasOrganization();
  },

  // Projects
  getProjects: async () => {
    const { getProjects } = await import("./projects");
    return getProjects();
  },

  getProjectById: async (id: string) => {
    const { getProjectById } = await import("./projects");
    return getProjectById(id);
  },

  getProjectsByDateRange: async (
    startDate: string,
    endDate: string,
    stageFilter?: string[]
  ) => {
    const { getProjectsByDateRange } = await import("./projects");
    return getProjectsByDateRange(startDate, endDate, stageFilter);
  },

  addProject: async (project: any) => {
    const { addProject } = await import("./projects");
    return addProject(project);
  },

  updateProject: async (id: string, updates: any) => {
    const { updateProject } = await import("./projects");
    return updateProject(id, updates);
  },

  deleteProject: async (id: string) => {
    const { deleteProject } = await import("./projects");
    return deleteProject(id);
  },

  deleteAllProjects: async () => {
    const { deleteAllProjects } = await import("./projects");
    return deleteAllProjects();
  },

  // Settings
  getSettings: async () => {
    const { getSettings } = await import("./settings");
    return getSettings();
  },

  saveSettings: async (settings: any) => {
    const { saveSettings } = await import("./settings");
    return saveSettings(settings);
  },

  updateSettings: async (updates: any) => {
    const { updateSettings } = await import("./settings");
    return updateSettings(updates);
  },

  getNextEstimateNumber: async () => {
    const { getNextEstimateNumber } = await import("./settings");
    return getNextEstimateNumber();
  },

  // Reports
  getRevenueAnalytics: async (startDate: string, endDate: string) => {
    const { getRevenueAnalytics } = await import("./reports");
    return getRevenueAnalytics(startDate, endDate);
  },

  getPaymentAnalytics: async (startDate: string, endDate: string) => {
    const { getPaymentAnalytics } = await import("./reports");
    return getPaymentAnalytics(startDate, endDate);
  },

  getMaterialsAnalytics: async (startDate: string, endDate: string) => {
    const { getMaterialsAnalytics } = await import("./reports");
    return getMaterialsAnalytics(startDate, endDate);
  },

  getClientAnalytics: async () => {
    const { getClientAnalytics } = await import("./reports");
    return getClientAnalytics();
  },

  getTaxSummary: async (year: number) => {
    const { getTaxSummary } = await import("./reports");
    return getTaxSummary(year);
  },

  // BOC
  getBOCSettings: async () => {
    const { getBOCSettings } = await import("./boc");
    return getBOCSettings();
  },

  saveBOCSettings: async (settings: any) => {
    const { saveBOCSettings } = await import("./boc");
    return saveBOCSettings(settings);
  },
};

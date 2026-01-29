import type { Project, Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const PROJECTS_KEY = "stitchqueue_projects";
const SETTINGS_KEY = "stitchqueue_settings";

export const storage = {
  // Projects
  getProjects: (): Project[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveProjects: (projects: Project[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  addProject: (project: Project) => {
    const projects = storage.getProjects();
    projects.push(project);
    storage.saveProjects(projects);
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    const projects = storage.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      storage.saveProjects(projects);
    }
  },

  deleteProject: (id: string) => {
    const projects = storage.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    storage.saveProjects(filtered);
  },

  getProjectById: (id: string): Project | undefined => {
    const projects = storage.getProjects();
    return projects.find((p) => p.id === id);
  },

  // Settings
  getSettings: (): Settings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;

    // Merge with defaults to handle missing fields
    const saved = JSON.parse(data);
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      pricingRates: {
        ...DEFAULT_SETTINGS.pricingRates,
        ...(saved.pricingRates || {}),
      },
    };
  },

  saveSettings: (settings: Settings) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  updateSettings: (updates: Partial<Settings>) => {
    const settings = storage.getSettings();
    const updated = { ...settings, ...updates };
    storage.saveSettings(updated);
  },
};

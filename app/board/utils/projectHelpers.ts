/**
 * Project Helper Utilities
 * 
 * Helper functions for project display: initials, avatar colors,
 * due date calculations, badges, and formatting.
 * 
 * @module board/utils/projectHelpers
 */

import type { Project } from "../../types";

/**
 * Get initials from first and last name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || "?")[0]}${(lastName || "?")[0]}`.toUpperCase();
}

/**
 * Get a consistent avatar background color based on name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-plum text-white",
    "bg-gold text-white",
    "bg-blue-600 text-white",
    "bg-green-600 text-white",
    "bg-purple-600 text-white",
    "bg-red-500 text-white",
    "bg-teal-600 text-white",
    "bg-orange-500 text-white",
  ];
  const index = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

/**
 * Check if project is due within 7 days
 */
export function isDueThisWeek(project: Project): boolean {
  if (
    !project.requestedCompletionDate ||
    project.requestedDateType !== "specific_date"
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(project.requestedCompletionDate + "T00:00:00");
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0 && diffDays <= 7;
}

/**
 * Check if project is due within 3 days (urgent)
 */
export function isDueSoon(project: Project): boolean {
  if (
    !project.requestedCompletionDate ||
    project.requestedDateType !== "specific_date"
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(project.requestedCompletionDate + "T00:00:00");
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays <= 3;
}

/**
 * Due badge info for a project
 */
export interface DueBadge {
  text: string;
  urgent: boolean;
  isAsap?: boolean;
}

/**
 * Get due badge text and urgency for a project
 */
export function getDueBadge(project: Project): DueBadge | null {
  if (project.requestedDateType === "asap") {
    return { text: "ASAP", urgent: true, isAsap: true };
  }

  if (
    !project.requestedCompletionDate ||
    project.requestedDateType !== "specific_date"
  ) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(project.requestedCompletionDate + "T00:00:00");
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return { text: "Overdue", urgent: true };
  } else if (diffDays === 0) {
    return { text: "Due today", urgent: true };
  } else if (diffDays === 1) {
    return { text: "Due tomorrow", urgent: true };
  } else if (diffDays <= 7) {
    return { text: `Due in ${diffDays} days`, urgent: false };
  }
  return null;
}

/**
 * Check if project is marked as ASAP
 */
export function isAsap(project: Project): boolean {
  return project.requestedDateType === "asap";
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get card styling based on project urgency
 */
export function getCardStyle(project: Project): string {
  if (isAsap(project)) {
    return "border-red-400 bg-red-50 ring-1 ring-red-200";
  }
  if (isDueSoon(project)) {
    return "border-orange-300 bg-orange-50";
  }
  return "border-line";
}

/**
 * Get full client name from project
 */
export function getFullName(project: Project): string {
  return `${project.clientFirstName || ""} ${project.clientLastName || ""}`.trim();
}

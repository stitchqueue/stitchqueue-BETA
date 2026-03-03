import { Project } from "../types";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getTodayDate(): string {
  return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
}

export function getClientFullName(project: Project): string {
  return `${project.clientFirstName} ${project.clientLastName}`.trim();
}

export function generateProjectId(
  firstName: string,
  lastName: string,
  intakeDate: string
): string {
  const name = `${firstName} ${lastName}`.trim();
  return `${name} — ${intakeDate}`;
}

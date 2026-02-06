/**
 * ListView Component
 * 
 * Table view of projects with sortable columns.
 * 
 * @module board/components/ListView
 */

"use client";

import type { Project } from "../../types";
import {
  getInitials,
  getAvatarColor,
  getDueBadge,
  isAsap,
  formatDate,
  getFullName,
} from "../utils";

export type SortField =
  | "clientName"
  | "estimateNumber"
  | "stage"
  | "dueDate"
  | "intakeDate";

export type SortDirection = "asc" | "desc";

interface ListViewProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

/**
 * Table view of projects with sortable columns.
 * Shows estimate #, client, description, stage, due date, intake date, and size.
 */
export default function ListView({
  projects,
  onProjectClick,
  sortField,
  sortDirection,
  onSort,
}: ListViewProps) {
  /**
   * Sortable column header
   */
  const SortHeader = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <th
      className="px-4 py-3 text-left text-xs font-bold text-plum cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-gold">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-line">
            <tr>
              <SortHeader field="estimateNumber" label="Est #" />
              <SortHeader field="clientName" label="Client" />
              <th className="px-4 py-3 text-left text-xs font-bold text-plum">
                Description
              </th>
              <SortHeader field="stage" label="Stage" />
              <SortHeader field="dueDate" label="Due Date" />
              <SortHeader field="intakeDate" label="Intake" />
              <th className="px-4 py-3 text-left text-xs font-bold text-plum">
                Size
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <div className="text-muted font-medium">No projects match this filter</div>
                  <div className="text-sm text-muted mt-1">Try selecting a different stage or clearing filters</div>
                </td>
              </tr>
            ) : (
              projects.map((project, idx) => {
                const fullName = getFullName(project);
                const dueBadge = getDueBadge(project);
                const projectIsAsap = isAsap(project);
                const initials = getInitials(
                  project.clientFirstName || "",
                  project.clientLastName || ""
                );
                const avatarColor = getAvatarColor(fullName);

                return (
                  <tr
                    key={project.id}
                    onClick={() => onProjectClick(project.id)}
                    className={`border-b border-line hover:bg-gray-50 cursor-pointer transition-colors ${
                      projectIsAsap
                        ? "bg-red-50 hover:bg-red-100"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {projectIsAsap && <span title="High Priority">🔥</span>}
                        <span className="text-gold font-bold text-sm">
                          {project.estimateNumber
                            ? `#${project.estimateNumber}`
                            : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center font-bold text-xs flex-shrink-0`}
                        >
                          {initials}
                        </div>
                        <span className="font-medium text-sm">
                          {fullName || "Unnamed"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted truncate block max-w-[200px]">
                        {project.cardLabel || project.description || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-plum/10 text-plum rounded-full text-xs font-medium">
                        {project.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {project.requestedDateType === "specific_date"
                            ? formatDate(project.requestedCompletionDate)
                            : project.requestedDateType === "asap"
                            ? "ASAP"
                            : "—"}
                        </span>
                        {dueBadge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              dueBadge.urgent
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {dueBadge.text}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted">
                        {formatDate(project.intakeDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted">
                        {project.quiltWidth && project.quiltLength
                          ? `${project.quiltWidth}" × ${project.quiltLength}"`
                          : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
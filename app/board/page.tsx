"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { supabase } from "../lib/supabase";
import { STAGES } from "../types";
import type { Project, Stage } from "../types";

// Drag and drop imports
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

type ViewMode = "board" | "list" | "calendar";
type SortField =
  | "clientName"
  | "estimateNumber"
  | "stage"
  | "dueDate"
  | "intakeDate";
type SortDirection = "asc" | "desc";

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || "?")[0]}${(lastName || "?")[0]}`.toUpperCase();
}

function getAvatarColor(name: string): string {
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

function isDueThisWeek(project: Project): boolean {
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

function isDueSoon(project: Project): boolean {
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

function getDueBadge(
  project: Project
): { text: string; urgent: boolean; isAsap?: boolean } | null {
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

function isAsap(project: Project): boolean {
  return project.requestedDateType === "asap";
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Draggable Project Card Component
function DraggableProjectCard({
  project,
  onClick,
  showStage = false,
}: {
  project: Project;
  onClick: () => void;
  showStage?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({ id: project.id });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `card-${project.id}`,
    data: { type: "card", project },
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? ("hidden" as const) : ("visible" as const),
  };

  const initials = getInitials(
    project.clientFirstName || "",
    project.clientLastName || ""
  );
  const fullName = `${project.clientFirstName || ""} ${
    project.clientLastName || ""
  }`.trim();
  const avatarColor = getAvatarColor(fullName);
  const dueSoon = isDueSoon(project);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);

  const [wasDragging, setWasDragging] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    setWasDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startPos.current) {
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > 5 || dy > 5) {
        setWasDragging(true);
      }
    }
  };

  const handleClick = () => {
    if (!wasDragging && !isDragging) {
      onClick();
    }
    startPos.current = null;
  };

  const getCardStyle = () => {
    if (projectIsAsap) {
      return "border-red-400 bg-red-50 ring-1 ring-red-200";
    }
    if (dueSoon) {
      return "border-orange-300 bg-orange-50";
    }
    return "border-line";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full bg-white border rounded-xl p-3 text-left hover:shadow-md transition-shadow cursor-pointer ${getCardStyle()} ${
        isDragging ? "shadow-lg ring-2 ring-plum/30 cursor-grabbing" : ""
      } ${isOver ? "ring-2 ring-plum/50 border-plum" : ""}`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      {...attributes}
      {...listeners}
    >
      {projectIsAsap && (
        <div className="flex items-center gap-1 text-xs font-bold text-red-600 mb-2">
          <span>🔥</span>
          <span>HIGH PRIORITY</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-bold text-sm text-plum truncate">
              {fullName || "Unnamed Client"}
            </div>
            {project.estimateNumber && (
              <div className="text-xs text-gold font-bold flex-shrink-0">
                #{project.estimateNumber}
              </div>
            )}
          </div>
          <div className="text-xs text-muted truncate mt-0.5">
            {project.cardLabel || project.description || "No description"}
          </div>
          {project.quiltWidth && project.quiltLength && (
            <div className="text-xs text-muted mt-1">
              {project.quiltWidth}" × {project.quiltLength}"
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {showStage && (
              <span className="px-2 py-0.5 bg-plum/10 text-plum rounded-full text-xs font-medium">
                {project.stage}
              </span>
            )}
            {dueBadge && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  dueBadge.isAsap
                    ? "bg-red-100 text-red-700"
                    : dueBadge.urgent
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {dueBadge.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Static Project Card for DragOverlay
function ProjectCardOverlay({ project }: { project: Project }) {
  const initials = getInitials(
    project.clientFirstName || "",
    project.clientLastName || ""
  );
  const fullName = `${project.clientFirstName || ""} ${
    project.clientLastName || ""
  }`.trim();
  const avatarColor = getAvatarColor(fullName);
  const dueSoon = isDueSoon(project);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);

  const getCardStyle = () => {
    if (projectIsAsap) {
      return "border-red-400 bg-red-50";
    }
    if (dueSoon) {
      return "border-orange-300 bg-orange-50";
    }
    return "border-line";
  };

  return (
    <div
      className={`w-72 bg-white border rounded-xl p-3 text-left shadow-xl ring-2 ring-plum/30 ${getCardStyle()}`}
    >
      {projectIsAsap && (
        <div className="flex items-center gap-1 text-xs font-bold text-red-600 mb-2">
          <span>🔥</span>
          <span>HIGH PRIORITY</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-bold text-sm text-plum truncate">
              {fullName || "Unnamed Client"}
            </div>
            {project.estimateNumber && (
              <div className="text-xs text-gold font-bold flex-shrink-0">
                #{project.estimateNumber}
              </div>
            )}
          </div>
          <div className="text-xs text-muted truncate mt-0.5">
            {project.cardLabel || project.description || "No description"}
          </div>
          {dueBadge && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  dueBadge.isAsap
                    ? "bg-red-100 text-red-700"
                    : dueBadge.urgent
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {dueBadge.text}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Non-draggable Project Card (for Due This Week view)
function ProjectCard({
  project,
  onClick,
  showStage = false,
}: {
  project: Project;
  onClick: () => void;
  showStage?: boolean;
}) {
  const initials = getInitials(
    project.clientFirstName || "",
    project.clientLastName || ""
  );
  const fullName = `${project.clientFirstName || ""} ${
    project.clientLastName || ""
  }`.trim();
  const avatarColor = getAvatarColor(fullName);
  const dueSoon = isDueSoon(project);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);

  const getCardStyle = () => {
    if (projectIsAsap) {
      return "border-red-400 bg-red-50 ring-1 ring-red-200";
    }
    if (dueSoon) {
      return "border-orange-300 bg-orange-50";
    }
    return "border-line";
  };

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white border rounded-xl p-3 text-left hover:shadow-md transition-shadow ${getCardStyle()}`}
    >
      {projectIsAsap && (
        <div className="flex items-center gap-1 text-xs font-bold text-red-600 mb-2">
          <span>🔥</span>
          <span>HIGH PRIORITY</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-bold text-sm text-plum truncate">
              {fullName || "Unnamed Client"}
            </div>
            {project.estimateNumber && (
              <div className="text-xs text-gold font-bold flex-shrink-0">
                #{project.estimateNumber}
              </div>
            )}
          </div>
          <div className="text-xs text-muted truncate mt-0.5">
            {project.cardLabel || project.description || "No description"}
          </div>
          {project.quiltWidth && project.quiltLength && (
            <div className="text-xs text-muted mt-1">
              {project.quiltWidth}" × {project.quiltLength}"
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {showStage && (
              <span className="px-2 py-0.5 bg-plum/10 text-plum rounded-full text-xs font-medium">
                {project.stage}
              </span>
            )}
            {dueBadge && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  dueBadge.isAsap
                    ? "bg-red-100 text-red-700"
                    : dueBadge.urgent
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {dueBadge.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// Droppable Column Component
function DroppableColumn({
  stage,
  projects,
  onCardClick,
}: {
  stage: Stage;
  projects: Project[];
  onCardClick: (projectId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-gray-50 border rounded-xl p-3 transition-colors min-h-[200px] ${
        isOver ? "border-plum bg-plum/5 ring-2 ring-plum/20" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-plum text-sm">{stage}</h2>
        <span className="px-2 py-0.5 bg-white border border-line rounded-full text-xs font-medium text-muted">
          {projects.length}
        </span>
      </div>

      <div className="space-y-2 min-h-[100px]">
        {projects.length === 0 ? (
          <div
            className={`text-center py-6 text-xs border-2 border-dashed rounded-lg ${
              isOver
                ? "text-plum border-plum/30 bg-plum/5"
                : "text-muted border-gray-200"
            }`}
          >
            {isOver ? "Drop here" : "No projects"}
          </div>
        ) : (
          projects.map((project) => (
            <DraggableProjectCard
              key={project.id}
              project={project}
              onClick={() => onCardClick(project.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// List View Component
function ListView({
  projects,
  onProjectClick,
  sortField,
  sortDirection,
  onSort,
}: {
  projects: Project[];
  onProjectClick: (id: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
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
                <td colSpan={7} className="px-4 py-12 text-center text-muted">
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project, idx) => {
                const fullName = `${project.clientFirstName || ""} ${
                  project.clientLastName || ""
                }`.trim();
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

// Calendar View Component
function CalendarView({
  projects,
  onProjectClick,
  currentMonth,
  onMonthChange,
}: {
  projects: Project[];
  onProjectClick: (id: string) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getProjectsForDay = (day: number): Project[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return projects.filter(
      (p) =>
        p.requestedDateType === "specific_date" &&
        p.requestedCompletionDate === dateStr
    );
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-line bg-gray-50">
        <button
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          ←
        </button>
        <h2 className="text-lg font-bold text-plum">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-line">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-bold text-muted bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayProjects = day ? getProjectsForDay(day) : [];

          return (
            <div
              key={idx}
              className={`min-h-[100px] border-b border-r border-line p-1 ${
                day === null ? "bg-gray-50" : "bg-white"
              }`}
            >
              {day !== null && (
                <>
                  <div
                    className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(day) ? "bg-plum text-white" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayProjects.slice(0, 3).map((project) => {
                      const fullName = `${project.clientFirstName || ""} ${
                        project.clientLastName || ""
                      }`.trim();
                      const dueBadge = getDueBadge(project);

                      return (
                        <button
                          key={project.id}
                          onClick={() => onProjectClick(project.id)}
                          className={`w-full text-left px-1.5 py-1 rounded text-xs truncate ${
                            dueBadge?.urgent
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-plum/10 text-plum hover:bg-plum/20"
                          }`}
                        >
                          {fullName || "Unnamed"}
                        </button>
                      );
                    })}
                    {dayProjects.length > 3 && (
                      <div className="text-xs text-muted px-1">
                        +{dayProjects.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-line bg-gray-50 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-plum/20"></div>
          <span className="text-muted">Project due</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-200"></div>
          <span className="text-muted">Overdue / Due soon</span>
        </div>
      </div>
    </div>
  );
}

function BoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageFilter = searchParams.get("stage");
  const specialFilter = searchParams.get("filter");
  const viewParam = searchParams.get("view") as ViewMode | null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(stageFilter);
  const [showDueThisWeek, setShowDueThisWeek] = useState(
    specialFilter === "due-this-week"
  );
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(viewParam || "board");
  const [sortField, setSortField] = useState<SortField>("estimateNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const savedProjects = await storage.getProjects();
      setProjects(savedProjects);
      setLoading(false);
    };
    loadData();
  }, [router]);

  useEffect(() => {
    setActiveFilter(stageFilter);
    setShowDueThisWeek(specialFilter === "due-this-week");
    if (viewParam) setViewMode(viewParam);
  }, [stageFilter, specialFilter, viewParam]);

  const activeProjects = projects.filter((p) => p.stage !== "Archived");

  const getProjectsForStage = (stage: Stage): Project[] => {
    let filtered = activeProjects.filter((p) => p.stage === stage);

    return filtered.sort((a, b) => {
      if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
        return a.orderIndex - b.orderIndex;
      }
      if (a.orderIndex !== undefined) return -1;
      if (b.orderIndex !== undefined) return 1;

      const numA = a.estimateNumber || 999999;
      const numB = b.estimateNumber || 999999;
      return numA - numB;
    });
  };

  const getDueThisWeekProjects = (): Project[] => {
    return activeProjects.filter(isDueThisWeek).sort((a, b) => {
      const dateA = a.requestedCompletionDate || "";
      const dateB = b.requestedCompletionDate || "";
      return dateA.localeCompare(dateB);
    });
  };

  const getSortedProjects = (): Project[] => {
    let filtered = activeFilter
      ? activeProjects.filter((p) => p.stage === activeFilter)
      : activeProjects;

    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "clientName":
          const nameA = `${a.clientFirstName || ""} ${a.clientLastName || ""}`
            .trim()
            .toLowerCase();
          const nameB = `${b.clientFirstName || ""} ${b.clientLastName || ""}`
            .trim()
            .toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case "estimateNumber":
          comparison =
            (a.estimateNumber || 999999) - (b.estimateNumber || 999999);
          break;
        case "stage":
          comparison = STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage);
          break;
        case "dueDate":
          const dueDateA = a.requestedCompletionDate || "9999-12-31";
          const dueDateB = b.requestedCompletionDate || "9999-12-31";
          comparison = dueDateA.localeCompare(dueDateB);
          break;
        case "intakeDate":
          const intakeA = a.intakeDate || "";
          const intakeB = b.intakeDate || "";
          comparison = intakeA.localeCompare(intakeB);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setActiveFilter(null);
    setShowDueThisWeek(false);
    router.push(`/board${viewMode !== "board" ? `?view=${viewMode}` : ""}`);
  };

  const handleCardClick = (projectId: string) => {
    router.push(`/project/${encodeURIComponent(projectId)}`);
  };

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    const params = new URLSearchParams();
    if (view !== "board") params.set("view", view);
    if (activeFilter) params.set("stage", activeFilter);
    if (showDueThisWeek) params.set("filter", "due-this-week");
    const queryString = params.toString();
    router.push(`/board${queryString ? `?${queryString}` : ""}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (overId.startsWith("card-")) {
      const targetCardId = overId.replace("card-", "");
      const targetProject = projects.find((p) => p.id === targetCardId);

      if (!targetProject || targetCardId === projectId) return;

      const targetStage = targetProject.stage;

      const stageProjects = projects
        .filter((p) => p.stage === targetStage && p.id !== projectId)
        .sort((a, b) => {
          if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
            return a.orderIndex - b.orderIndex;
          }
          if (a.orderIndex !== undefined) return -1;
          if (b.orderIndex !== undefined) return 1;
          const numA = a.estimateNumber || 999999;
          const numB = b.estimateNumber || 999999;
          return numA - numB;
        });

      const targetIndex = stageProjects.findIndex((p) => p.id === targetCardId);

      stageProjects.splice(targetIndex, 0, { ...project, stage: targetStage });

      for (let i = 0; i < stageProjects.length; i++) {
        const p = stageProjects[i];
        if (p.id === projectId) {
          await storage.updateProject(p.id, {
            orderIndex: i,
            stage: targetStage !== project.stage ? targetStage : undefined,
          });
        } else {
          await storage.updateProject(p.id, { orderIndex: i });
        }
      }

      setProjects((prev) => {
        const newProjects = [...prev];
        stageProjects.forEach((p, index) => {
          const idx = newProjects.findIndex((np) => np.id === p.id);
          if (idx !== -1) {
            newProjects[idx] = {
              ...newProjects[idx],
              orderIndex: index,
              ...(p.id === projectId && targetStage !== project.stage
                ? { stage: targetStage }
                : {}),
            };
          }
        });
        return newProjects;
      });
    } else if (STAGES.includes(overId as Stage)) {
      const newStage = overId as Stage;

      if (project.stage === newStage) return;

      await storage.updateProject(projectId, {
        stage: newStage,
        orderIndex: undefined,
      });

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, stage: newStage, orderIndex: undefined }
            : p
        )
      );
    }
  };

  const handleDragCancel = () => {
    setActiveProject(null);
  };

  const stagesToShow = activeFilter
    ? STAGES.filter((s) => s === activeFilter)
    : STAGES.filter((s) => s !== "Archived");

  const dueThisWeekCount = activeProjects.filter(isDueThisWeek).length;
  const dueThisWeekProjects = getDueThisWeekProjects();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-plum">
              {showDueThisWeek ? "Due This Week" : "Project Board"}
            </h1>
            <p className="text-sm text-muted">
              {showDueThisWeek
                ? `${dueThisWeekCount} project${
                    dueThisWeekCount !== 1 ? "s" : ""
                  } due within 7 days`
                : `${activeProjects.length} active project${
                    activeProjects.length !== 1 ? "s" : ""
                  }${
                    dueThisWeekCount > 0
                      ? ` • ${dueThisWeekCount} due this week`
                      : ""
                  }`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/calculator")}
              className="px-4 py-2 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
            >
              + New Estimate
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
            >
              Home
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleViewChange("board")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-white text-plum shadow-sm"
                  : "text-muted hover:text-plum"
              }`}
            >
              📋 Board
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-plum shadow-sm"
                  : "text-muted hover:text-plum"
              }`}
            >
              📝 List
            </button>
            <button
              onClick={() => handleViewChange("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-plum shadow-sm"
                  : "text-muted hover:text-plum"
              }`}
            >
              📅 Calendar
            </button>
          </div>
        </div>

        {viewMode !== "calendar" && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted">Filter:</span>

            {STAGES.filter((s) => s !== "Archived").map((stage) => {
              const count = activeProjects.filter(
                (p) => p.stage === stage
              ).length;
              const isActive = activeFilter === stage && !showDueThisWeek;
              return (
                <button
                  key={stage}
                  onClick={() => {
                    if (isActive) {
                      setActiveFilter(null);
                      router.push(
                        `/board${
                          viewMode !== "board" ? `?view=${viewMode}` : ""
                        }`
                      );
                    } else {
                      setActiveFilter(stage);
                      setShowDueThisWeek(false);
                      const params = new URLSearchParams();
                      params.set("stage", stage);
                      if (viewMode !== "board") params.set("view", viewMode);
                      router.push(`/board?${params.toString()}`);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-plum text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {stage} ({count})
                </button>
              );
            })}

            <button
              onClick={() => {
                if (showDueThisWeek) {
                  setShowDueThisWeek(false);
                  router.push(
                    `/board${viewMode !== "board" ? `?view=${viewMode}` : ""}`
                  );
                } else {
                  setShowDueThisWeek(true);
                  setActiveFilter(null);
                  const params = new URLSearchParams();
                  params.set("filter", "due-this-week");
                  if (viewMode !== "board") params.set("view", viewMode);
                  router.push(`/board?${params.toString()}`);
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                showDueThisWeek
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              Due This Week ({dueThisWeekCount})
            </button>

            {(activeFilter || showDueThisWeek) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-xs text-muted hover:text-plum underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {viewMode === "board" &&
          !showDueThisWeek &&
          activeProjects.length > 0 && (
            <div className="text-xs text-muted mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Drag cards to change stage or reorder within a column</span>
            </div>
          )}

        {showDueThisWeek && viewMode !== "calendar" ? (
          <div className="bg-white border border-line rounded-xl p-4">
            {dueThisWeekProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-plum mb-2">
                  All caught up!
                </h2>
                <p className="text-muted">No projects due this week</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueThisWeekProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleCardClick(project.id)}
                    showStage={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : viewMode === "list" ? (
          <ListView
            projects={getSortedProjects()}
            onProjectClick={handleCardClick}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        ) : viewMode === "calendar" ? (
          <CalendarView
            projects={activeProjects}
            onProjectClick={handleCardClick}
            currentMonth={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stagesToShow.map((stage) => {
                const stageProjects = getProjectsForStage(stage as Stage);
                return (
                  <DroppableColumn
                    key={stage}
                    stage={stage as Stage}
                    projects={stageProjects}
                    onCardClick={handleCardClick}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeProject ? (
                <ProjectCardOverlay project={activeProject} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {viewMode === "board" &&
          !showDueThisWeek &&
          activeProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-bold text-plum mb-2">
                No projects yet
              </h2>
              <p className="text-muted mb-4">
                Create your first estimate to get started
              </p>
              <button
                onClick={() => router.push("/calculator")}
                className="px-6 py-3 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
              >
                + New Estimate
              </button>
            </div>
          )}
      </main>
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted">Loading board...</div>
        </div>
      }
    >
      <BoardContent />
    </Suspense>
  );
}

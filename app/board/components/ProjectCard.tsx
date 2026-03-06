/**
 * ProjectCard Components
 *
 * v4.0: Updated for 3-stage workflow with checklist display
 *
 * Three variants of the project card:
 * - DraggableProjectCard: For kanban board with drag-and-drop
 * - ProjectCard: Static card for Due This Week view
 * - ProjectCardOverlay: Floating card shown during drag
 *
 * @module board/components/ProjectCard
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Project } from "../../types";
import {
  getInitials,
  getAvatarColor,
  isDueSoon,
  isAsap,
  getDueBadge,
  getCardStyle,
  getFullName,
} from "../utils";

// ─────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS - v4.0 Checklist Support
// ─────────────────────────────────────────────────────────────────────

/**
 * Calculate checklist completion for Stage 3 (Completed) projects
 */
function getChecklistProgress(project: Project): {
  completed: number;
  total: number;
  color: "red" | "amber" | "green";
} {
  if (project.stage !== "Completed") {
    return { completed: 0, total: 0, color: "green" };
  }

  const projectType = project.projectType || "regular";
  let completed = 0;
  let total = 0;

  if (projectType === "regular") {
    // Regular: Invoiced, Paid, Delivered
    total = 3;
    if (project.invoiced) completed++;
    if (project.paid) completed++;
    if (project.delivered) completed++;
  } else if (projectType === "gift") {
    // Gift: Gift Invoice, Delivered
    total = 2;
    if (project.invoiced) completed++;
    if (project.delivered) completed++;
  } else if (projectType === "charitable") {
    // Charitable: Donation Invoice, Delivered
    total = 2;
    if (project.invoiced) completed++;
    if (project.delivered) completed++;
  }

  // Determine color
  let color: "red" | "amber" | "green";
  if (completed === 0) {
    color = "red";
  } else if (completed === total) {
    color = "green";
  } else {
    color = "amber";
  }

  return { completed, total, color };
}

/**
 * Format date for display (e.g., "Jan 15")
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format currency amount
 */
function formatCurrency(amount?: number, currencyCode = "USD"): string {
  if (!amount) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get project type badge emoji and label
 */
function getProjectTypeBadge(projectType?: string): {
  emoji: string;
  label: string;
} | null {
  if (projectType === "gift") {
    return { emoji: "🎁", label: "GIFT" };
  }
  if (projectType === "charitable") {
    return { emoji: "❤️", label: "DONATION" };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// CARD CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────

/**
 * Render Stage 1 (Estimates) specific content
 */
function EstimatesStageContent({ project }: { project: Project }) {
  if (project.approvalStatus) {
    return (
      <div className="flex items-center gap-1 text-xs mt-2">
        <span className="text-green-600">✓</span>
        <span className="text-green-600 font-medium">
          Approved {project.approvalDate ? `• ${formatDate(project.approvalDate)}` : ""}
        </span>
      </div>
    );
  } else if (project.approvalStatus === false) {
    return (
      <div className="text-xs text-gray-500 mt-2">
        ○ Pending approval
      </div>
    );
  }
  return null;
}

/**
 * Render Stage 3 (Completed) checklist content
 */
function CompletedStageContent({ project, currencyCode = "USD" }: { project: Project; currencyCode?: string }) {
  const projectType = project.projectType || "regular";

  if (projectType === "regular") {
    // Calculate balance
    const balance =
      (project.invoicedAmount || 0) -
      (project.depositPaidAmount || 0) -
      (project.paidAmount || 0);

    return (
      <div className="mt-2 space-y-1">
        <div className="text-xs flex items-center gap-1 min-w-0">
          <span className={`flex-shrink-0 ${project.invoiced ? "text-green-600" : "text-gray-400"}`}>
            {project.invoiced ? "✓" : "○"}
          </span>
          <span className={`truncate ${project.invoiced ? "text-gray-700" : "text-gray-500"}`}>
            Job Summary
            {project.invoiced && project.invoicedAmount
              ? ` ${formatCurrency(project.invoicedAmount, currencyCode)}`
              : ""}
            {project.invoiced && project.invoicedDate
              ? ` • ${formatDate(project.invoicedDate)}`
              : ""}
          </span>
        </div>
        <div className="text-xs flex items-center gap-1 min-w-0">
          <span className={`flex-shrink-0 ${project.paid ? "text-green-600" : "text-gray-400"}`}>
            {project.paid ? "✓" : "○"}
          </span>
          <span className={`truncate ${project.paid ? "text-gray-700" : "text-gray-500"}`}>
            Paid
            {project.paid && project.paidAmount
              ? ` ${formatCurrency(project.paidAmount, currencyCode)}`
              : ""}
            {project.paid && project.paidDate
              ? ` • ${formatDate(project.paidDate)}`
              : ""}
          </span>
        </div>
        <div className="text-xs flex items-center gap-1 min-w-0">
          <span className={`flex-shrink-0 ${project.delivered ? "text-green-600" : "text-gray-400"}`}>
            {project.delivered ? "✓" : "○"}
          </span>
          <span className={`truncate ${project.delivered ? "text-gray-700" : "text-gray-500"}`}>
            Delivered
            {project.delivered && project.deliveryMethod
              ? ` (${project.deliveryMethod})`
              : ""}
            {project.delivered && project.deliveryDate
              ? ` • ${formatDate(project.deliveryDate)}`
              : ""}
          </span>
        </div>
        {balance > 0 && (
          <div className="text-xs text-orange-600 font-medium mt-1">
            Balance: {formatCurrency(balance, currencyCode)}
          </div>
        )}
      </div>
    );
  } else if (projectType === "gift") {
    return (
      <div className="mt-2 space-y-1">
        <div className="text-xs flex items-center gap-1">
          <span className={project.invoiced ? "text-green-600" : "text-gray-400"}>
            {project.invoiced ? "✓" : "○"}
          </span>
          <span className={project.invoiced ? "text-gray-700" : "text-gray-500"}>
            Gift Summary
            {project.invoiced && project.invoicedDate
              ? ` • ${formatDate(project.invoicedDate)}`
              : ""}
          </span>
        </div>
        <div className="text-xs flex items-center gap-1">
          <span className={project.delivered ? "text-green-600" : "text-gray-400"}>
            {project.delivered ? "✓" : "○"}
          </span>
          <span className={project.delivered ? "text-gray-700" : "text-gray-500"}>
            Delivered
            {project.delivered && project.deliveryMethod
              ? ` (${project.deliveryMethod})`
              : ""}
            {project.delivered && project.deliveryDate
              ? ` • ${formatDate(project.deliveryDate)}`
              : ""}
          </span>
        </div>
      </div>
    );
  } else if (projectType === "charitable") {
    return (
      <div className="mt-2 space-y-1">
        <div className="text-xs flex items-center gap-1">
          <span className={project.invoiced ? "text-green-600" : "text-gray-400"}>
            {project.invoiced ? "✓" : "○"}
          </span>
          <span className={project.invoiced ? "text-gray-700" : "text-gray-500"}>
            Donation Receipt
            {project.invoiced && project.invoicedDate
              ? ` • ${formatDate(project.invoicedDate)}`
              : ""}
          </span>
        </div>
        <div className="text-xs flex items-center gap-1">
          <span className={project.delivered ? "text-green-600" : "text-gray-400"}>
            {project.delivered ? "✓" : "○"}
          </span>
          <span className={project.delivered ? "text-gray-700" : "text-gray-500"}>
            Delivered
            {project.delivered && project.deliveryDate
              ? ` • ${formatDate(project.deliveryDate)}`
              : ""}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────
// DRAGGABLE PROJECT CARD
// ─────────────────────────────────────────────────────────────────────

interface DraggableProjectCardProps {
  project: Project;
  onClick: () => void;
  showStage?: boolean;
  currencyCode?: string;
}

/**
 * Draggable project card for the kanban board.
 * Supports both drag-and-drop and click navigation.
 */
export function DraggableProjectCard({
  project,
  onClick,
  showStage = false,
  currencyCode = "USD",
}: DraggableProjectCardProps) {
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

  // Track desktop vs mobile for drag handle behavior
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? ("hidden" as const) : ("visible" as const),
    ...(isDesktop ? { touchAction: "none" as const } : {}),
  };

  const initials = getInitials(
    project.clientFirstName || "",
    project.clientLastName || ""
  );
  const fullName = getFullName(project);
  const avatarColor = getAvatarColor(fullName);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);
  const cardStyle = getCardStyle(project);
  const checklistProgress = getChecklistProgress(project);
  const projectTypeBadge = getProjectTypeBadge(project.projectType);

  // Get left border color for Stage 3 (Completed) cards
  let leftBorderClass = "";
  if (project.stage === "Completed") {
    if (checklistProgress.color === "red") {
      leftBorderClass = "border-l-4 border-l-red-500";
    } else if (checklistProgress.color === "amber") {
      leftBorderClass = "border-l-4 border-l-orange-400";
    } else if (checklistProgress.color === "green") {
      leftBorderClass = "border-l-4 border-l-green-500";
    }
  }

  // Track drag to prevent click navigation after drag.
  // dnd-kit's {...listeners} overrides any custom onPointerDown, so we
  // rely on isDragging from useDraggable as the source of truth.
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      hasDraggedRef.current = true;
    } else if (hasDraggedRef.current) {
      // Reset after a short delay so the post-drag click event is caught
      const timer = setTimeout(() => {
        hasDraggedRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  const handleClick = () => {
    if (hasDraggedRef.current || isDragging) {
      return;
    }
    onClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full bg-white border rounded-xl p-3 text-left hover:shadow-md transition-shadow cursor-pointer overflow-hidden ${cardStyle} ${leftBorderClass} ${
        isDragging ? "shadow-lg ring-2 ring-plum/60 cursor-grabbing" : ""
      } ${isOver ? "ring-2 ring-plum/50 border-plum" : ""}`}
      onClick={handleClick}
      {...attributes}
      {...(isDesktop ? listeners : {})}
    >
      {/* Mobile drag handle */}
      <div
        className="md:hidden -mx-3 -mt-3 mb-2 flex items-center justify-center py-1.5 bg-[#4e283a]/10 rounded-t-xl cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        {...listeners}
      >
        <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor" className="text-[#4e283a]/40">
          <circle cx="4" cy="2" r="1.5"/><circle cx="10" cy="2" r="1.5"/><circle cx="16" cy="2" r="1.5"/>
          <circle cx="4" cy="6" r="1.5"/><circle cx="10" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/>
          <circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/>
        </svg>
      </div>

      {/* Project Type Badge (Gift/Donation) */}
      {projectTypeBadge && (
        <div className="absolute top-2 right-2 flex items-center gap-1 max-w-[6rem] overflow-hidden">
          <span className="text-xs flex-shrink-0">{projectTypeBadge.emoji}</span>
          <span className="text-xs font-bold text-gray-600 truncate">{projectTypeBadge.label}</span>
        </div>
      )}

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
            <div className="text-xs text-muted mt-1 truncate">
              {project.quiltWidth}&quot; × {project.quiltLength}&quot;
            </div>
          )}

          {/* Stage-specific content */}
          {project.stage === "Estimates" && <EstimatesStageContent project={project} />}
          {project.stage === "Completed" && <CompletedStageContent project={project} currencyCode={currencyCode} />}

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

// ─────────────────────────────────────────────────────────────────────
// STATIC PROJECT CARD (for Due This Week view)
// ─────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  showStage?: boolean;
  currencyCode?: string;
}

/**
 * Static (non-draggable) project card.
 * Used in Due This Week view and other non-board contexts.
 */
export function ProjectCard({
  project,
  onClick,
  showStage = false,
  currencyCode = "USD",
}: ProjectCardProps) {
  const initials = getInitials(
    project.clientFirstName || "",
    project.clientLastName || ""
  );
  const fullName = getFullName(project);
  const avatarColor = getAvatarColor(fullName);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);
  const cardStyle = getCardStyle(project);
  const checklistProgress = getChecklistProgress(project);
  const projectTypeBadge = getProjectTypeBadge(project.projectType);

  // Get left border color for Stage 3 (Completed) cards
  let leftBorderClass = "";
  if (project.stage === "Completed") {
    if (checklistProgress.color === "red") {
      leftBorderClass = "border-l-4 border-l-red-500";
    } else if (checklistProgress.color === "amber") {
      leftBorderClass = "border-l-4 border-l-orange-400";
    } else if (checklistProgress.color === "green") {
      leftBorderClass = "border-l-4 border-l-green-500";
    }
  }

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white border rounded-xl p-3 text-left hover:shadow-md transition-shadow relative overflow-hidden ${cardStyle} ${leftBorderClass}`}
    >
      {/* Project Type Badge (Gift/Donation) */}
      {projectTypeBadge && (
        <div className="absolute top-2 right-2 flex items-center gap-1 max-w-[6rem] overflow-hidden">
          <span className="text-xs flex-shrink-0">{projectTypeBadge.emoji}</span>
          <span className="text-xs font-bold text-gray-600 truncate">{projectTypeBadge.label}</span>
        </div>
      )}

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
            <div className="text-xs text-muted mt-1 truncate">
              {project.quiltWidth}&quot; × {project.quiltLength}&quot;
            </div>
          )}

          {/* Stage-specific content */}
          {project.stage === "Estimates" && <EstimatesStageContent project={project} />}
          {project.stage === "Completed" && <CompletedStageContent project={project} currencyCode={currencyCode} />}

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

// ─────────────────────────────────────────────────────────────────────
// PROJECT CARD OVERLAY (shown during drag)
// ─────────────────────────────────────────────────────────────────────

interface ProjectCardOverlayProps {
  project: Project;
  currencyCode?: string;
}

/**
 * Floating card shown during drag operations.
 * Simplified version without interaction handlers.
 */
export function ProjectCardOverlay({ project, currencyCode = "USD" }: ProjectCardOverlayProps) {
  const initials = getInitials(
    project.clientFirstName || "",
    project.clientLastName || ""
  );
  const fullName = getFullName(project);
  const avatarColor = getAvatarColor(fullName);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);
  const checklistProgress = getChecklistProgress(project);
  const projectTypeBadge = getProjectTypeBadge(project.projectType);

  const getOverlayStyle = () => {
    if (projectIsAsap) {
      return "border-red-400 bg-red-50";
    }
    if (isDueSoon(project)) {
      return "border-orange-300 bg-orange-50";
    }
    return "border-line";
  };

  // Get left border color for Stage 3 (Completed) cards
  let leftBorderClass = "";
  if (project.stage === "Completed") {
    if (checklistProgress.color === "red") {
      leftBorderClass = "border-l-4 border-l-red-500";
    } else if (checklistProgress.color === "amber") {
      leftBorderClass = "border-l-4 border-l-orange-400";
    } else if (checklistProgress.color === "green") {
      leftBorderClass = "border-l-4 border-l-green-500";
    }
  }

  return (
    <div
      className={`w-72 bg-white border rounded-xl p-3 text-left shadow-xl ring-2 ring-plum/30 relative overflow-hidden ${getOverlayStyle()} ${leftBorderClass}`}
    >
      {/* Project Type Badge (Gift/Donation) */}
      {projectTypeBadge && (
        <div className="absolute top-2 right-2 flex items-center gap-1 max-w-[6rem] overflow-hidden">
          <span className="text-xs flex-shrink-0">{projectTypeBadge.emoji}</span>
          <span className="text-xs font-bold text-gray-600 truncate">{projectTypeBadge.label}</span>
        </div>
      )}

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

          {/* Stage-specific content */}
          {project.stage === "Estimates" && <EstimatesStageContent project={project} />}
          {project.stage === "Completed" && <CompletedStageContent project={project} currencyCode={currencyCode} />}

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

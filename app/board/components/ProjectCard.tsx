/**
 * ProjectCard Components
 * 
 * Three variants of the project card:
 * - DraggableProjectCard: For kanban board with drag-and-drop
 * - ProjectCard: Static card for Due This Week view
 * - ProjectCardOverlay: Floating card shown during drag
 * 
 * @module board/components/ProjectCard
 */

"use client";

import { useState, useRef } from "react";
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
// DRAGGABLE PROJECT CARD
// ─────────────────────────────────────────────────────────────────────

interface DraggableProjectCardProps {
  project: Project;
  onClick: () => void;
  showStage?: boolean;
}

/**
 * Draggable project card for the kanban board.
 * Supports both drag-and-drop and click navigation.
 */
export function DraggableProjectCard({
  project,
  onClick,
  showStage = false,
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
  const fullName = getFullName(project);
  const avatarColor = getAvatarColor(fullName);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);
  const cardStyle = getCardStyle(project);

  // Track drag vs click
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full bg-white border rounded-xl p-3 text-left hover:shadow-md transition-shadow cursor-pointer ${cardStyle} ${
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
              {project.quiltWidth}&quot; × {project.quiltLength}&quot;
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

// ─────────────────────────────────────────────────────────────────────
// STATIC PROJECT CARD (for Due This Week view)
// ─────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  showStage?: boolean;
}

/**
 * Static (non-draggable) project card.
 * Used in Due This Week view and other non-board contexts.
 */
export function ProjectCard({
  project,
  onClick,
  showStage = false,
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

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white border rounded-xl p-3 text-left hover:shadow-md transition-shadow ${cardStyle}`}
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
              {project.quiltWidth}&quot; × {project.quiltLength}&quot;
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

// ─────────────────────────────────────────────────────────────────────
// PROJECT CARD OVERLAY (shown during drag)
// ─────────────────────────────────────────────────────────────────────

interface ProjectCardOverlayProps {
  project: Project;
}

/**
 * Floating card shown during drag operations.
 * Simplified version without interaction handlers.
 */
export function ProjectCardOverlay({ project }: ProjectCardOverlayProps) {
  const initials = getInitials(
    project.clientFirstName || "",
    project.clientLastName || ""
  );
  const fullName = getFullName(project);
  const avatarColor = getAvatarColor(fullName);
  const projectIsAsap = isAsap(project);
  const dueBadge = getDueBadge(project);

  const getOverlayStyle = () => {
    if (projectIsAsap) {
      return "border-red-400 bg-red-50";
    }
    if (isDueSoon(project)) {
      return "border-orange-300 bg-orange-50";
    }
    return "border-line";
  };

  return (
    <div
      className={`w-72 bg-white border rounded-xl p-3 text-left shadow-xl ring-2 ring-plum/30 ${getOverlayStyle()}`}
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

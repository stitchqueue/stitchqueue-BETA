/**
 * DroppableColumn Component
 *
 * v4.0: Added stage tooltips for 3-stage workflow
 *
 * A kanban column that accepts dropped project cards.
 *
 * @module board/components/DroppableColumn
 */

"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Project, Stage } from "../../types";
import { DraggableProjectCard } from "./ProjectCard";

interface DroppableColumnProps {
  stage: Stage;
  projects: Project[];
  onCardClick: (projectId: string) => void;
  stageConfig?: { label: string; tooltip: string };
}

/**
 * Kanban column with drop zone for project cards.
 * Shows stage name, project count, tooltip, and empty state.
 */
export default function DroppableColumn({
  stage,
  projects,
  onCardClick,
  stageConfig,
}: DroppableColumnProps) {
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
      {/* Column Header */}
      <div className="mb-3">
        <div
          className="flex items-center justify-between"
          title={stageConfig?.tooltip}
        >
          <h2 className="font-bold text-plum text-sm">{stage}</h2>
          <span className="px-2 py-0.5 bg-white border border-line rounded-full text-xs font-medium text-muted">
            {projects.length}
          </span>
        </div>
        {/* Mobile tooltip - visible on small screens */}
        {stageConfig?.tooltip && (
          <div className="sm:hidden text-xs text-gray-500 mt-1">
            {stageConfig.tooltip}
          </div>
        )}
      </div>

      {/* Cards */}
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

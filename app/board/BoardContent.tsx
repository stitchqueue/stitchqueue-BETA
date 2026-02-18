/**
 * BoardContent Component
 *
 * v4.0: Updated for 3-stage workflow (Estimates → In Progress → Completed)
 *
 * Main orchestrator for the project board. Manages all state,
 * handles drag-and-drop, filtering, sorting, and view switching.
 *
 * @module board/BoardContent
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import { storage } from "../lib/storage";
import { supabase } from "../lib/supabase";
import TrialBanner from "../components/TrialBanner";
import { STAGES } from "../types";
import type { Project, Stage } from "../types";

// Drag and drop
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import type { CollisionDetection } from "@dnd-kit/core";

// Components
import {
  ProjectCard,
  ProjectCardOverlay,
  DroppableColumn,
  ListView,
  CalendarView,
} from "./components";
import type { SortField, SortDirection } from "./components";

// Utilities
import { isDueThisWeek } from "./utils";

type ViewMode = "board" | "list" | "calendar";

/**
 * Custom collision detection: uses pointerWithin so the column the
 * pointer is actually inside always wins, then prefers card droppables
 * (for reordering) over column droppables (for stage moves).
 * Falls back to closestCenter when the pointer isn't inside any droppable.
 */
const columnAwareCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    // If pointer is over a card, use it (for reordering within/across columns)
    const cardHit = pointerCollisions.find(
      (c) => typeof c.id === "string" && (c.id as string).startsWith("card-")
    );
    if (cardHit) return [cardHit];

    // Otherwise use the column (for dropping into empty area)
    return [pointerCollisions[0]];
  }

  // Pointer isn't inside any droppable — fall back to closest center
  return closestCenter(args);
};

/**
 * Stage configuration for v4.0 3-stage workflow
 * Maps stage names to display information and hover tooltips
 */
const STAGE_CONFIG: Record<Stage, { label: string; tooltip: string }> = {
  Estimates: {
    label: "Estimates",
    tooltip: "Generate quotes and track approvals",
  },
  "In Progress": {
    label: "In Progress",
    tooltip: "Active quilting projects",
  },
  Completed: {
    label: "Completed",
    tooltip: "Projects ready for invoicing and delivery",
  },
  Archived: {
    label: "Archived",
    tooltip: "Archived Projects",
  },
};

/**
 * Main board content with all state management.
 * Wrapped in Suspense by the page component.
 */
export default function BoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL params
  const stageFilter = searchParams.get("stage");
  const specialFilter = searchParams.get("filter");
  const viewParam = searchParams.get("view") as ViewMode | null;

  // ─────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(stageFilter);
  const [showDueThisWeek, setShowDueThisWeek] = useState(
    specialFilter === "due-this-week"
  );
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(viewParam || "board");
  const [sortField, setSortField] = useState<SortField>("estimateNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [stageError, setStageError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // DRAG SENSORS
  // ─────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────
  // DATA LOADING
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const savedProjects = await storage.getProjects();
        setProjects(savedProjects || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading board data:", err);
        setError(err instanceof Error ? err.message : "Failed to load projects");
        setProjects([]);
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  // Sync state with URL params
  useEffect(() => {
    setActiveFilter(stageFilter);
    setShowDueThisWeek(specialFilter === "due-this-week");
    if (viewParam) setViewMode(viewParam);
  }, [stageFilter, specialFilter, viewParam]);

  // ─────────────────────────────────────────────────────────────────────
  // DERIVED DATA
  // ─────────────────────────────────────────────────────────────────────
  const activeProjects = (projects || []).filter((p) => p.stage !== "Archived");
  const dueThisWeekCount = activeProjects.filter(isDueThisWeek).length;

  /**
   * Get projects for a specific stage, sorted by order index or estimate number
   */
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

  /**
   * Get projects due this week, sorted by date
   */
  const getDueThisWeekProjects = (): Project[] => {
    return activeProjects.filter(isDueThisWeek).sort((a, b) => {
      const dateA = a.requestedCompletionDate || "";
      const dateB = b.requestedCompletionDate || "";
      return dateA.localeCompare(dateB);
    });
  };

  /**
   * Get sorted projects for list view
   */
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

  const stagesToShow = activeFilter
    ? STAGES.filter((s) => s === activeFilter)
    : STAGES.filter((s) => s !== "Archived");

  const dueThisWeekProjects = getDueThisWeekProjects();

  // ─────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────
  // DRAG HANDLERS
  // ─────────────────────────────────────────────────────────────────────

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
    setStageError(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Snapshot for revert on failure
    const previousProjects = [...projects];

    try {
      // Dropped on another card (reorder within column or move to new column)
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

        // Update UI immediately so the card moves before the DB call
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

        // Auto-approve when dragging from Estimates to In Progress
        const autoApprove =
          project.stage === "Estimates" && targetStage === "In Progress";

        if (autoApprove) {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === projectId
                ? { ...p, approvalStatus: true, approvalDate: new Date().toISOString().split("T")[0] }
                : p
            )
          );
        }

        // Persist to database
        for (let i = 0; i < stageProjects.length; i++) {
          const p = stageProjects[i];
          if (p.id === projectId) {
            await storage.updateProject(p.id, {
              orderIndex: i,
              stage: targetStage !== project.stage ? targetStage : undefined,
              ...(autoApprove && {
                approvalStatus: true,
                approvalDate: new Date().toISOString().split("T")[0],
              }),
            });
          } else {
            await storage.updateProject(p.id, { orderIndex: i });
          }
        }
      } else if (STAGES.includes(overId as Stage)) {
        // Dropped on empty column
        const newStage = overId as Stage;

        if (project.stage === newStage) return;

        // Auto-approve when dragging from Estimates to In Progress
        const autoApprove =
          project.stage === "Estimates" && newStage === "In Progress";

        // Update UI immediately
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  stage: newStage,
                  orderIndex: undefined,
                  ...(autoApprove && {
                    approvalStatus: true,
                    approvalDate: new Date().toISOString().split("T")[0],
                  }),
                }
              : p
          )
        );

        // Persist to database
        await storage.updateProject(projectId, {
          stage: newStage,
          orderIndex: undefined,
          ...(autoApprove && {
            approvalStatus: true,
            approvalDate: new Date().toISOString().split("T")[0],
          }),
        });
      }
    } catch (err) {
      console.error("Error updating project stage:", err);
      // Revert optimistic UI update
      setProjects(previousProjects);
      const message = err instanceof Error ? err.message : "Failed to move project";
      setStageError(message);
      // Auto-clear error after 8 seconds
      setTimeout(() => setStageError(null), 8000);
    }
  };

  const handleDragCancel = () => {
    setActiveProject(null);
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum mx-auto mb-4"></div>
          <div className="text-muted">Loading board...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white border border-red-300 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Board</h2>
            <p className="text-muted mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <TrialBanner />
        {/* Page Header */}
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

        {/* View Toggle */}
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

        {/* Filters (not shown for calendar) */}
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

        {/* Stage update error */}
        {stageError && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-4 flex items-start gap-3">
            <span className="text-red-600 text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <div className="font-bold text-red-700 text-sm">Failed to move project</div>
              <div className="text-red-600 text-xs mt-1">{stageError}</div>
            </div>
            <button
              onClick={() => setStageError(null)}
              className="text-red-400 hover:text-red-600 text-lg flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* Drag hint */}
        {viewMode === "board" &&
          !showDueThisWeek &&
          activeProjects.length > 0 && (
            <div className="text-xs text-muted mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Drag cards to change stage or reorder within a column</span>
            </div>
          )}

        {/* ─────────────────────────────────────────────────────────────────
            VIEW CONTENT
            ───────────────────────────────────────────────────────────────── */}

        {showDueThisWeek && viewMode !== "calendar" ? (
          /* Due This Week View */
          <div className="bg-white border border-line rounded-xl p-4">
            {dueThisWeekProjects.length === 0 ? (
              <EmptyState
                icon="🎉"
                title="All caught up!"
                message="No projects due this week. Time to enjoy a cup of tea — or maybe start a new quilt?"
                actionLabel="View All Projects"
                onAction={clearFilters}
              />
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
          /* List View */
          activeProjects.length === 0 ? (
            <div className="bg-white border border-line rounded-xl">
              <EmptyState
                icon="📝"
                title="No projects yet"
                message="Your project list is as empty as a brand new bolt of fabric. Let's change that!"
                actionLabel="+ New Estimate"
                actionHref="/calculator"
              />
            </div>
          ) : (
            <ListView
              projects={getSortedProjects()}
              onProjectClick={handleCardClick}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )
        ) : viewMode === "calendar" ? (
          /* Calendar View */
          <CalendarView
            projects={activeProjects}
            onProjectClick={handleCardClick}
            currentMonth={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
        ) : (
          /* Kanban Board View */
          activeProjects.length === 0 ? (
            <div className="bg-white border border-line rounded-xl">
              <EmptyState
                icon="🧵"
                title="Welcome to your board!"
                message="Start by creating your first estimate using the Calculator. Projects flow through Estimates, In Progress, and Completed stages."
                actionLabel="Go to Calculator"
                actionHref="/calculator"
              />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={columnAwareCollision}
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
                      stageConfig={STAGE_CONFIG[stage as Stage]}
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
          )
        )}
      </main>
    </div>
  );
}
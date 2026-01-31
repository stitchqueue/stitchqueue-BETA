"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { STAGES } from "../types";
import type { Project, Stage } from "../types";

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
): { text: string; urgent: boolean } | null {
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
  const dueBadge = getDueBadge(project);

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white border rounded-xl p-3 text-left hover:shadow-md transition-shadow ${
        dueSoon ? "border-orange-300 bg-orange-50" : "border-line"
      }`}
    >
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
                  dueBadge.urgent
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

function BoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageFilter = searchParams.get("stage");
  const specialFilter = searchParams.get("filter");

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(stageFilter);
  const [showDueThisWeek, setShowDueThisWeek] = useState(
    specialFilter === "due-this-week"
  );

  useEffect(() => {
    const savedProjects = storage.getProjects();
    setProjects(savedProjects);
  }, []);

  useEffect(() => {
    setActiveFilter(stageFilter);
    setShowDueThisWeek(specialFilter === "due-this-week");
  }, [stageFilter, specialFilter]);

  const activeProjects = projects.filter((p) => p.stage !== "Archived");

  const getProjectsForStage = (stage: Stage): Project[] => {
    let filtered = activeProjects.filter((p) => p.stage === stage);

    // Sort by intake date (FIFO)
    return filtered.sort((a, b) => {
      const dateA = a.intakeDate || "";
      const dateB = b.intakeDate || "";
      return dateA.localeCompare(dateB);
    });
  };

  const getDueThisWeekProjects = (): Project[] => {
    return activeProjects.filter(isDueThisWeek).sort((a, b) => {
      // Sort by due date (soonest first)
      const dateA = a.requestedCompletionDate || "";
      const dateB = b.requestedCompletionDate || "";
      return dateA.localeCompare(dateB);
    });
  };

  const clearFilters = () => {
    setActiveFilter(null);
    setShowDueThisWeek(false);
    router.push("/board");
  };

  const stagesToShow = activeFilter
    ? STAGES.filter((s) => s === activeFilter)
    : STAGES;

  const dueThisWeekCount = activeProjects.filter(isDueThisWeek).length;
  const dueThisWeekProjects = getDueThisWeekProjects();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
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

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-muted">Filter:</span>

          {/* Stage Filters */}
          {STAGES.map((stage) => {
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
                    router.push("/board");
                  } else {
                    setActiveFilter(stage);
                    setShowDueThisWeek(false);
                    router.push(`/board?stage=${encodeURIComponent(stage)}`);
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

          {/* Due This Week Filter */}
          <button
            onClick={() => {
              if (showDueThisWeek) {
                setShowDueThisWeek(false);
                router.push("/board");
              } else {
                setShowDueThisWeek(true);
                setActiveFilter(null);
                router.push("/board?filter=due-this-week");
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

          {/* Clear Filters */}
          {(activeFilter || showDueThisWeek) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-xs text-muted hover:text-plum underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Due This Week View - Flat List */}
        {showDueThisWeek ? (
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
                    onClick={() =>
                      router.push(`/project/${encodeURIComponent(project.id)}`)
                    }
                    showStage={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Kanban Board View */
          <>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stagesToShow.map((stage) => {
                const stageProjects = getProjectsForStage(stage as Stage);
                return (
                  <div
                    key={stage}
                    className="flex-shrink-0 w-72 bg-gray-50 border border-line rounded-xl p-3"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-bold text-plum text-sm">{stage}</h2>
                      <span className="px-2 py-0.5 bg-white border border-line rounded-full text-xs font-medium text-muted">
                        {stageProjects.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2">
                      {stageProjects.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted">
                          No projects
                        </div>
                      ) : (
                        stageProjects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() =>
                              router.push(
                                `/project/${encodeURIComponent(project.id)}`
                              )
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {activeProjects.length === 0 && (
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
          </>
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

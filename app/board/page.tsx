"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { STAGES } from "../types";
import type { Project, Stage } from "../types";

export default function BoardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(storage.getProjects());
  }, []);

  const getProjectsByStage = (stage: Stage) => {
    return projects.filter((p) => p.stage === stage);
  };

  const getClientFullName = (project: Project) => {
    return `${project.clientFirstName} ${project.clientLastName}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDisplayDate = (project: Project) => {
    if (project.requestedDateType === "asap") return "ASAP";
    if (project.requestedDateType === "no_date") return "TBD";
    if (project.requestedCompletionDate)
      return formatDate(project.requestedCompletionDate);
    return "TBD";
  };

  const openProject = (projectId: string) => {
    router.push(`/project/${encodeURIComponent(projectId)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-plum">Project Board</h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/intake")}
              className="px-4 py-2 bg-plum text-white rounded-xl hover:bg-plum/90"
            >
              + New Project
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
            >
              Home
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageProjects = getProjectsByStage(stage);

            return (
              <div
                key={stage}
                className="min-w-[280px] bg-white/60 border border-line rounded-card p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-plum text-sm">{stage}</h3>
                  <span className="px-2 py-1 bg-gray-100 border border-line rounded-full text-xs font-bold">
                    {stageProjects.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageProjects.length === 0 ? (
                    <p className="text-xs text-muted text-center py-4">
                      No projects
                    </p>
                  ) : (
                    stageProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => openProject(project.id)}
                        className={`bg-white border rounded-card p-3 cursor-pointer hover:shadow-md transition-shadow ${
                          project.requestedDateType === "asap"
                            ? "border-due shadow-due/20"
                            : "border-line"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-bold text-sm">
                            {getClientFullName(project)}
                          </div>
                          <div
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              project.requestedDateType === "asap"
                                ? "bg-due/10 border-due/30 text-due font-bold"
                                : "bg-gray-50 border-line text-muted"
                            }`}
                          >
                            {getDisplayDate(project)}
                          </div>
                        </div>

                        {project.cardLabel && (
                          <p className="text-xs text-muted mb-2">
                            {project.cardLabel}
                          </p>
                        )}

                        <div className="flex gap-2 text-xs">
                          {project.quiltWidth && project.quiltLength && (
                            <span className="px-2 py-0.5 bg-gray-50 border border-line rounded-full">
                              {project.quiltWidth}×{project.quiltLength}"
                            </span>
                          )}
                          {project.quiltingType && (
                            <span className="px-2 py-0.5 bg-gray-50 border border-line rounded-full">
                              {project.quiltingType}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted mb-4">
              No projects yet. Create your first one!
            </p>
            <button
              onClick={() => router.push("/intake")}
              className="px-6 py-3 bg-plum text-white rounded-xl hover:bg-plum/90"
            >
              + New Project
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

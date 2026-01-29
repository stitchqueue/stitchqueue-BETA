"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import type { Project } from "../types";

export default function ArchivePage() {
  const router = useRouter();
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadArchivedProjects();
  }, []);

  const loadArchivedProjects = () => {
    const allProjects = storage.getProjects();
    const archived = allProjects
      .filter((p) => p.stage === "Archived")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    setArchivedProjects(archived);
  };

  const getClientFullName = (project: Project) => {
    return `${project.clientFirstName} ${project.clientLastName}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredProjects = archivedProjects.filter((project) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const clientName = getClientFullName(project).toLowerCase();
    const description = (project.description || "").toLowerCase();
    const email = (project.clientEmail || "").toLowerCase();

    return (
      clientName.includes(query) ||
      description.includes(query) ||
      email.includes(query)
    );
  });

  const unarchiveProject = (projectId: string) => {
    if (!confirm("Move this project back to Paid/Shipped stage?")) return;

    storage.updateProject(projectId, { stage: "Paid/Shipped" });
    loadArchivedProjects();
  };

  const deleteProject = (projectId: string, clientName: string) => {
    if (
      !confirm(
        `Permanently delete project for ${clientName}? This cannot be undone.`
      )
    )
      return;

    storage.deleteProject(projectId);
    loadArchivedProjects();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-plum">Archive</h2>
            <p className="text-sm text-muted mt-1">
              {archivedProjects.length} archived project
              {archivedProjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/board")}
            className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
          >
            Back to Board
          </button>
        </div>

        <div className="bg-white border border-line rounded-card p-4 mb-6">
          <input
            type="text"
            placeholder="Search by client name, email, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-line rounded-xl"
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white border border-line rounded-card p-12 text-center">
            {archivedProjects.length === 0 ? (
              <>
                <p className="text-muted mb-4">No archived projects yet.</p>
                <p className="text-sm text-muted">
                  Projects move to the archive when they reach the final stage.
                </p>
              </>
            ) : (
              <p className="text-muted">No projects match "{searchQuery}"</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-line rounded-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/project/${encodeURIComponent(project.id)}`
                          )
                        }
                        className="text-xl font-bold text-plum hover:underline text-left"
                      >
                        {getClientFullName(project)}
                      </button>
                    </div>

                    {project.description && (
                      <p className="text-sm text-muted mb-3">
                        {project.description}
                      </p>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted">Intake:</span>{" "}
                        <span className="font-medium">
                          {formatDate(project.intakeDate)}
                        </span>
                      </div>
                      {project.quiltWidth && project.quiltLength && (
                        <div>
                          <span className="text-muted">Size:</span>{" "}
                          <span className="font-medium">
                            {project.quiltWidth} × {project.quiltLength}"
                          </span>
                        </div>
                      )}
                      {project.estimateData && (
                        <div>
                          <span className="text-muted">Total:</span>{" "}
                          <span className="font-medium font-bold text-plum">
                            ${project.estimateData.total.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {project.clientEmail && (
                      <div className="text-sm text-muted mt-2">
                        {project.clientEmail}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/project/${encodeURIComponent(project.id)}`
                        )
                      }
                      className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50 text-sm whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => unarchiveProject(project.id)}
                      className="px-4 py-2 border border-gold/30 text-gold rounded-xl hover:bg-gold/10 text-sm whitespace-nowrap"
                    >
                      Unarchive
                    </button>
                    <button
                      onClick={() =>
                        deleteProject(project.id, getClientFullName(project))
                      }
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 text-sm whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

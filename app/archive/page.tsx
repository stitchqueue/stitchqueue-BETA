"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import { storage } from "../lib/storage";
import type { Project } from "../types";

export default function ArchivePage() {
  const router = useRouter();
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check authentication first
        const hasOrg = await storage.hasOrganization();
        if (!hasOrg) {
          router.push("/");
          return;
        }
        setIsAuthenticated(true);
        await loadArchivedProjects();
      } catch (error) {
        console.error("Error initializing archive page:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const loadArchivedProjects = async () => {
    try {
      const allProjects = await storage.getProjects();
      const archived = allProjects
        .filter((p) => p.stage === "Archived")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      setArchivedProjects(archived);
    } catch (error) {
      console.error("Error loading archived projects:", error);
    }
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

  const unarchiveProject = async (projectId: string) => {
    if (!confirm("Move this project back to Paid/Shipped stage?")) return;

    setActionInProgress(projectId);
    try {
      await storage.updateProject(projectId, { stage: "Paid/Shipped" });
      await loadArchivedProjects();
    } catch (error) {
      console.error("Error unarchiving project:", error);
      alert("Failed to unarchive project. Please try again.");
    } finally {
      setActionInProgress(null);
    }
  };

  const deleteProject = async (projectId: string, clientName: string) => {
    if (
      !confirm(
        `Permanently delete project for ${clientName}? This cannot be undone.`
      )
    )
      return;

    setActionInProgress(projectId);
    try {
      await storage.deleteProject(projectId);
      await loadArchivedProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum mx-auto mb-4"></div>
          <div className="text-muted">Loading archive...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Redirecting...</div>
      </div>
    );
  }

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

        {/* Only show search if there are archived projects */}
        {archivedProjects.length > 0 && (
          <div className="bg-white border border-line rounded-card p-4 mb-6">
            <input
              type="text"
              placeholder="Search by client name, email, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-line rounded-xl"
            />
          </div>
        )}

        {archivedProjects.length === 0 ? (
          /* Empty archive - no projects at all */
          <div className="bg-white border border-line rounded-card">
            <EmptyState
              icon="📦"
              title="Archive is empty"
              message="Completed projects appear here after all checklist items are checked. Finish a project in the Completed stage to archive it."
              actionLabel="View Board"
              actionHref="/board"
            />
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Has archived projects but search found nothing */
          <div className="bg-white border border-line rounded-card">
            <EmptyState
              icon="🔍"
              title="No matches found"
              message={`We searched every quilt in the archive, but couldn't find anything matching "${searchQuery}".`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const isActionInProgress = actionInProgress === project.id;

              return (
                <div
                  key={project.id}
                  className={`bg-white border border-line rounded-card p-6 hover:shadow-md transition-shadow ${
                    isActionInProgress ? "opacity-50" : ""
                  }`}
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
                          disabled={isActionInProgress}
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
                        disabled={isActionInProgress}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => unarchiveProject(project.id)}
                        className={`px-4 py-2 border border-gold/30 text-gold rounded-xl hover:bg-gold/10 text-sm whitespace-nowrap ${
                          isActionInProgress ? "cursor-not-allowed" : ""
                        }`}
                        disabled={isActionInProgress}
                      >
                        {isActionInProgress ? "Processing..." : "Unarchive"}
                      </button>
                      <button
                        onClick={() =>
                          deleteProject(project.id, getClientFullName(project))
                        }
                        className={`px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 text-sm whitespace-nowrap ${
                          isActionInProgress ? "cursor-not-allowed" : ""
                        }`}
                        disabled={isActionInProgress}
                      >
                        {isActionInProgress ? "Processing..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
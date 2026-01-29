"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import { storage } from "./lib/storage";
import type { Project } from "./types";

const QUOTES = [
  "Every stitch tells a story",
  "Quilting: where math meets art",
  "Life is like a quilt — piece it together one block at a time",
  "Behind every quilter is a huge pile of fabric",
  "A quilt is a blanket of love",
  "Keep calm and quilt on",
  "Blessed are the piecemakers",
  "Quilting forever, housework whenever",
  "I quilt so I don't unravel",
  "Sewing mends the soul",
  "Thread by thread, we create something beautiful",
];

export default function Home() {
  const router = useRouter();
  const [quote, setQuote] = useState("");
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    loadRecentProjects();
  }, []);

  const loadRecentProjects = () => {
    const allProjects = storage.getProjects();
    // Get 5 most recent projects (by updatedAt)
    const sorted = allProjects
      .filter((p) => p.stage !== "Archived")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
    setRecentProjects(sorted);
  };

  const getClientFullName = (project: Project) => {
    return `${project.clientFirstName} ${project.clientLastName}`;
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-plum mb-2">
            {quote || "Every stitch tells a story"}
          </h2>
          <p className="text-muted">What would you like to do?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <button
            onClick={() => router.push("/intake")}
            className="bg-white border border-line rounded-card p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-plum mb-2">New Project</h3>
            <p className="text-sm text-muted">Start with intake form</p>
          </button>

          <button
            onClick={() => router.push("/calculator")}
            className="bg-white border border-line rounded-card p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-3">🧮</div>
            <h3 className="font-bold text-plum mb-2">Calculator</h3>
            <p className="text-sm text-muted">Create estimate</p>
          </button>

          <button
            onClick={() => router.push("/board")}
            className="bg-white border border-line rounded-card p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-plum mb-2">Board</h3>
            <p className="text-sm text-muted">View kanban</p>
          </button>

          <button
            onClick={() => router.push("/settings")}
            className="bg-white border border-line rounded-card p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="font-bold text-plum mb-2">Settings</h3>
            <p className="text-sm text-muted">Configure app</p>
          </button>
        </div>

        <div className="bg-white border border-line rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-plum">Recent Projects</h3>
            {recentProjects.length > 0 && (
              <button
                onClick={() => router.push("/board")}
                className="text-sm text-plum hover:underline"
              >
                View All →
              </button>
            )}
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-muted text-sm">
              No projects yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() =>
                    router.push(`/project/${encodeURIComponent(project.id)}`)
                  }
                  className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-shadow ${
                    project.requestedDateType === "asap"
                      ? "border-due bg-due/5"
                      : "border-line hover:border-plum/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-bold">
                          {getClientFullName(project)}
                        </div>
                        <span className="px-2 py-0.5 bg-plum/10 border border-plum/20 rounded-full text-xs font-bold text-plum">
                          {project.stage}
                        </span>
                      </div>
                      {project.cardLabel && (
                        <div className="text-sm text-muted mb-2">
                          {project.cardLabel}
                        </div>
                      )}
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-gray-100 border border-line rounded-full">
                          Due: {getDisplayDate(project)}
                        </span>
                        {project.quiltWidth && project.quiltLength && (
                          <span className="px-2 py-0.5 bg-gray-100 border border-line rounded-full">
                            {project.quiltWidth}×{project.quiltLength}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

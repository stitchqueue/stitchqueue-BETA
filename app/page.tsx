"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import { storage } from "./lib/storage";
import type { Project, Settings } from "./types";
import { STAGES } from "./types";

const QUOTES = [
  "Every stitch tells a story.",
  "Quilting: where math meets art.",
  "Keep calm and quilt on.",
  "Blessed are the piecemakers.",
  "A quilt is a blanket of love.",
  "Life is better with quilts.",
  "Quilters never cut corners... well, actually we do!",
  "Behind every quilter is a huge fabric stash.",
  "Quilting is my therapy.",
  "Eat, sleep, quilt, repeat.",
  "Home is where the quilt is.",
  "Piecing it all together, one block at a time.",
  "Quilters make warm friends.",
  "In a world full of trends, quilting is timeless.",
  "My quilts are my hugs you can keep.",
];

const STAGE_CONFIG = [
  { stage: "Intake", icon: "📥", color: "bg-blue-100 text-blue-700" },
  { stage: "Estimate", icon: "📝", color: "bg-amber-100 text-amber-700" },
  { stage: "In Progress", icon: "🧵", color: "bg-purple-100 text-purple-700" },
  { stage: "Invoiced", icon: "📄", color: "bg-green-100 text-green-700" },
  {
    stage: "Paid/Shipped",
    icon: "✅",
    color: "bg-emerald-100 text-emerald-700",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

export default function HomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );

  useEffect(() => {
    const savedSettings = storage.getSettings();
    const savedProjects = storage.getProjects();
    setSettings(savedSettings);
    setProjects(savedProjects);
  }, []);

  const activeProjects = projects.filter((p) => p.stage !== "Archived");
  const dueThisWeekCount = activeProjects.filter(isDueThisWeek).length;

  const getStageCounts = () => {
    const counts: Record<string, number> = {};
    STAGES.forEach((stage) => {
      counts[stage] = activeProjects.filter((p) => p.stage === stage).length;
    });
    return counts;
  };

  const stageCounts = getStageCounts();

  const recentProjects = activeProjects
    .sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || "";
      const dateB = b.updatedAt || b.createdAt || "";
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  const businessName = settings?.businessName || "Quilter";

  const toggleTier = (tier: "free" | "pro") => {
    if (!settings) return;
    const updated = { ...settings, isPaidTier: tier === "pro" };
    storage.saveSettings(updated);
    setSettings(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Greeting Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-plum">
            {getGreeting()}, {businessName}
          </h1>
          <p className="text-muted text-sm mt-1 italic">"{quote}"</p>
          <p className="text-muted text-sm mt-2">
            You have {activeProjects.length} active project
            {activeProjects.length !== 1 ? "s" : ""}
            {dueThisWeekCount > 0 && ` and ${dueThisWeekCount} due this week`}
          </p>
        </div>

        {/* Stage Statistics */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {STAGE_CONFIG.map(({ stage, icon, color }) => (
            <button
              key={stage}
              onClick={() =>
                router.push(`/board?stage=${encodeURIComponent(stage)}`)
              }
              className={`${color} rounded-xl p-3 text-center hover:opacity-80 transition-opacity`}
            >
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-2xl font-bold">
                {stageCounts[stage] || 0}
              </div>
              <div className="text-xs font-medium truncate">{stage}</div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => router.push("/calculator")}
            className="bg-plum text-white rounded-xl p-4 text-center hover:bg-plum/90 transition-colors"
          >
            <div className="text-xl mb-1">➕</div>
            <div className="font-bold text-sm">New Estimate</div>
          </button>

          <button
            onClick={() => router.push("/board?filter=due-this-week")}
            className="bg-orange-100 text-orange-700 border-2 border-orange-300 rounded-xl p-4 text-center hover:bg-orange-200 transition-colors"
          >
            <div className="text-xl mb-1">⏰</div>
            <div className="text-2xl font-bold">{dueThisWeekCount}</div>
            <div className="font-bold text-xs">Due This Week</div>
          </button>

          <button
            onClick={() => router.push("/board")}
            className="bg-gold text-white rounded-xl p-4 text-center hover:bg-gold/90 transition-colors"
          >
            <div className="text-xl mb-1">📋</div>
            <div className="font-bold text-sm">View Board</div>
          </button>
        </div>

        {/* Recent Projects */}
        <div className="bg-white border border-line rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-plum">Recent Projects</h2>
            <button
              onClick={() => router.push("/board")}
              className="text-sm text-gold font-medium hover:underline"
            >
              View all →
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <div className="text-3xl mb-2">📭</div>
              <p>No projects yet. Create your first estimate!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => {
                const fullName = `${project.clientFirstName || ""} ${
                  project.clientLastName || ""
                }`.trim();
                const initials = getInitials(
                  project.clientFirstName || "",
                  project.clientLastName || ""
                );
                const avatarColor = getAvatarColor(fullName);
                const dueBadge = getDueBadge(project);

                return (
                  <button
                    key={project.id}
                    onClick={() =>
                      router.push(`/project/${encodeURIComponent(project.id)}`)
                    }
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-plum truncate">
                        {fullName || "Unnamed Client"}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {project.description || "No description"}
                        {project.quiltWidth &&
                          project.quiltLength &&
                          ` • ${project.quiltWidth}" × ${project.quiltLength}"`}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
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
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {project.stage}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mode Toggle - Fixed Bottom Right */}
      <div className="fixed bottom-4 right-4 bg-white border border-line rounded-xl shadow-lg p-2 flex gap-1">
        <button
          onClick={() => toggleTier("free")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            !settings?.isPaidTier
              ? "bg-plum text-white"
              : "text-muted hover:bg-gray-100"
          }`}
        >
          FREE
        </button>
        <button
          onClick={() => toggleTier("pro")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            settings?.isPaidTier
              ? "bg-gold text-white"
              : "text-muted hover:bg-gray-100"
          }`}
        >
          PRO
        </button>
      </div>
    </div>
  );
}

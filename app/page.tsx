"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "./components/Header";
import Toast from "./components/Toast";
import { storage } from "./lib/storage";
import { supabase } from "./lib/supabase";
import { getRevenueData, type RevenueData } from "./lib/storage/boc-performance";
import type { User } from "@supabase/supabase-js";
import type { Project, Settings } from "./types";

const QUOTES = [
  "Quilters never cut corners... well, actually we do!",
  "Life is like a quilt - pieced together with love.",
  "Behind every quilter is a huge pile of fabric.",
  "Quilting: because therapy is expensive.",
  "A quilt is a blanket of love.",
  "Measure twice, cut once, swear a little.",
  "Sew much fabric, sew little time!",
  "Keep calm and quilt on.",
  "I quilt so I don't unravel.",
  "Blessed are the piecemakers.",
];

const STAGE_CONFIG = [
  { stage: "Estimates", icon: "📥", color: "bg-blue-100 text-blue-700" },
  { stage: "In Progress", icon: "🧵", color: "bg-orange-100 text-orange-700" },
  { stage: "Completed", icon: "✅", color: "bg-green-100 text-green-700" },
];

const ZERO_REVENUE_MESSAGES = [
  "No revenue yet this month — maybe your clients are paying in fabric?",
  "Zero dollars in — you must be on a well-deserved vacation!",
  "Looks like you're giving it all away this month. Your clients love you.",
  "No paid projects yet — go make yourself a coffee, it'll pick up!",
  "All your quilts must be gifts this month. So generous!",
  "Your invoices are probably just lost in the mail. Obviously.",
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
  if (project.requestedDateType === "asap") {
    return { text: "ASAP", urgent: true };
  }
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

  if (diffDays < 0) return { text: "Overdue", urgent: true };
  if (diffDays === 0) return { text: "Due today", urgent: true };
  if (diffDays === 1) return { text: "Due tomorrow", urgent: true };
  if (diffDays <= 7) return { text: `Due in ${diffDays} days`, urgent: false };
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

function isAsap(project: Project): boolean {
  return project.requestedDateType === "asap";
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [quote, setQuote] = useState("");
  const [showWelcomeBackToast, setShowWelcomeBackToast] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [zeroRevenueMsg, setZeroRevenueMsg] = useState("");

  // Handle random messages client-side to avoid hydration mismatch (Bug #9 fix)
  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setZeroRevenueMsg(ZERO_REVENUE_MESSAGES[Math.floor(Math.random() * ZERO_REVENUE_MESSAGES.length)]);
  }, []);

  // Check if user came from 404 page
  useEffect(() => {
    if (searchParams.get('from') === '404') {
      setShowWelcomeBackToast(true);
      // Clear the query parameter from URL without triggering navigation
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  // Extract revenue fetch so it can be called on visibility change
  async function fetchRevenue() {
    try {
      const revenue = await getRevenueData();
      setRevenueData(revenue);
    } catch {
      // Silently fail — revenue is non-critical
    }
  }

  useEffect(() => {
    async function checkAuthAndLoadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const [savedProjects, savedSettings, revenue] = await Promise.all([
        storage.getProjects(),
        storage.getSettings(),
        getRevenueData().catch(() => null),
      ]);

      setProjects(savedProjects);
      setSettings(savedSettings);
      setRevenueData(revenue);
      setLoading(false);
    }

    checkAuthAndLoadData().catch((error) => {
      console.error("Error loading dashboard data:", error);
      setLoadError(true);
      setLoading(false);
    });
  }, [router]);

  // Refetch revenue when tab becomes visible again (QA-053)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchRevenue();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#4e283a",
              marginBottom: "8px",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "#666", marginBottom: "24px", lineHeight: "1.5" }}>
            We had trouble loading your data. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4e283a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.stage !== "Archived");
  const dueThisWeekCount = activeProjects.filter(isDueThisWeek).length;
  const asapCount = activeProjects.filter(isAsap).length;

  const getStageCount = (stage: string) => {
    return activeProjects.filter((p) => p.stage === stage).length;
  };

  const recentProjects = activeProjects
    .sort((a, b) => {
      const dateA = a.createdAt || "";
      const dateB = b.createdAt || "";
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  const businessName = settings?.businessName || "Quilter";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Welcome back toast from 404 */}
      {showWelcomeBackToast && (
        <Toast
          message="Whew, glad we made it back safe & sound!"
          type="success"
          duration={6000}
          onClose={() => setShowWelcomeBackToast(false)}
          icon={<span className="text-lg">🧵</span>}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-plum">
            {getGreeting()}, {businessName}
          </h1>
          {quote && <p className="text-muted italic mt-1">"{quote}"</p>}
          <p className="text-sm text-muted mt-2">
            You have {activeProjects.length} active project
            {activeProjects.length !== 1 ? "s" : ""}
            {dueThisWeekCount > 0 && ` and ${dueThisWeekCount} due this week`}
            {asapCount > 0 && ` • ${asapCount} high priority`}
          </p>
        </div>

        {/* Revenue summary — always visible */}
        {revenueData ? (() => {
          const diff = revenueData.thisMonthRevenue - revenueData.lastMonthRevenue;
          const diffAbs = Math.abs(diff);
          const fmtCurrency = (n: number) =>
            "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          return (
            <div className="bg-white border-l-4 border-plum/40 rounded-xl p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earned this month */}
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                    Earned This Month
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#98823a" }}>
                    {fmtCurrency(revenueData.thisMonthRevenue)}
                  </p>
                  <div className="mt-1">
                    {diff > 0 ? (
                      <p className="text-sm text-green-700">
                        &uarr; {fmtCurrency(diffAbs)} more than last month
                      </p>
                    ) : diff < 0 ? (
                      <p className="text-sm text-red-600">
                        &darr; {fmtCurrency(diffAbs)} less than last month
                      </p>
                    ) : (
                      <p className="text-sm text-muted">Same as last month</p>
                    )}
                  </div>
                </div>
                {/* In pipeline */}
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                    In Pipeline
                  </p>
                  <p className="text-2xl font-bold text-plum/60">
                    {fmtCurrency(revenueData.pipelineRevenue)}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    estimates + in progress + awaiting payment
                  </p>
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="bg-white border-l-4 border-plum/40 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-sm text-muted italic">{zeroRevenueMsg}</p>
          </div>
        )}

        {/* Stage stat boxes — 3-stage workflow */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {STAGE_CONFIG.map(({ stage, icon, color }) => (
            <button
              key={stage}
              onClick={() =>
                router.push(`/board?stage=${encodeURIComponent(stage)}`)
              }
              className={`${color} rounded-xl p-3 sm:p-4 text-center hover:opacity-90 transition-opacity min-w-0`}
            >
              <div className="text-xl sm:text-2xl mb-1">{icon}</div>
              <div className="text-xl sm:text-2xl font-bold">{getStageCount(stage)}</div>
              <div className="text-[10px] sm:text-xs font-medium leading-tight truncate">{stage}</div>
            </button>
          ))}
        </div>

        {/* FIXED: Action buttons - stack on mobile, 3-col on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => router.push("/calculator")}
            className="bg-plum text-white rounded-xl p-4 sm:p-6 text-center hover:bg-plum/90 transition-colors flex sm:block items-center justify-center gap-3 focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2"
          >
            <div className="text-2xl sm:mb-2">➕</div>
            <div className="font-bold">New Estimate</div>
          </button>

          <button
            onClick={() => router.push("/board?filter=due-this-week")}
            className="bg-orange-100 text-orange-700 border-2 border-orange-200 rounded-xl p-4 sm:p-6 text-center hover:bg-orange-200 transition-colors flex sm:block items-center justify-center gap-3 focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2"
          >
            <div className="text-2xl sm:mb-2">⏰</div>
            <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
              <span className="text-2xl font-bold">{dueThisWeekCount}</span>
              <span className="font-medium text-sm">Due This Week</span>
            </div>
          </button>

          <button
            onClick={() => router.push("/board")}
            className="bg-gold text-white rounded-xl p-4 sm:p-6 text-center hover:bg-gold/90 transition-colors flex sm:block items-center justify-center gap-3 focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2"
          >
            <div className="text-2xl sm:mb-2">📋</div>
            <div className="font-bold">View Board</div>
          </button>
        </div>

        <div className="bg-white border border-line rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-plum">Recent Projects</h2>
            <button
              onClick={() => router.push("/board")}
              className="text-sm text-gold hover:underline"
            >
              View all →
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <div className="text-4xl mb-2">📋</div>
              <p>No projects yet</p>
              <button
                onClick={() => router.push("/calculator")}
                className="mt-4 px-4 py-2 bg-plum text-white rounded-xl font-bold hover:bg-plum/90"
              >
                Create your first estimate
              </button>
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
                const projectIsAsap = isAsap(project);

                return (
                  <button
                    key={project.id}
                    onClick={() =>
                      router.push(`/project/${encodeURIComponent(project.id)}`)
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                      projectIsAsap ? "bg-red-50 border border-red-200" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm flex-shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {projectIsAsap && (
                          <span className="text-red-500">🔥</span>
                        )}
                        <div className="font-bold text-sm text-plum truncate">
                          {fullName || "Unnamed Client"}
                        </div>
                      </div>
                      <div className="text-xs text-muted truncate">
                        {project.cardLabel ||
                          project.description ||
                          "No description"}
                        {project.quiltWidth && project.quiltLength && (
                          <span>
                            {" "}
                            • {project.quiltWidth}" × {project.quiltLength}"
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {projectIsAsap && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          ASAP
                        </span>
                      )}
                      {dueBadge && !projectIsAsap && (
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
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
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
    </div>
  );
}
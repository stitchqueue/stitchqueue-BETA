"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../components/Header";
import { storage } from "../../lib/storage";
import { STAGES } from "../../types";
import type { Project, Stage } from "../../types";

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function isAsap(project: Project): boolean {
  return project.requestedDateType === "asap";
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = decodeURIComponent(params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        // Check authentication first
        const hasOrg = await storage.hasOrganization();
        if (!hasOrg) {
          router.push("/");
          return;
        }
        setIsAuthenticated(true);

        // Load project
        const savedProject = await storage.getProjectById(projectId);
        setProject(savedProject || null);
      } catch (error) {
        console.error("Error loading project:", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum mx-auto mb-4"></div>
          <div className="text-muted">Loading project...</div>
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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-plum mb-2">
              Project Not Found
            </h1>
            <p className="text-muted mb-4">
              The project you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/board")}
              className="px-6 py-3 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
            >
              Back to Board
            </button>
          </div>
        </main>
      </div>
    );
  }

  const fullName = `${project.clientFirstName || ""} ${
    project.clientLastName || ""
  }`.trim();

  const projectIsAsap = isAsap(project);

  const currentStageIndex = STAGES.indexOf(project.stage as Stage);

  // Check if project has estimate data
  const hasEstimate = project.estimateData && project.estimateData.total > 0;
  const estimate = project.estimateData;

  const handleStageChange = async (newStage: Stage) => {
    if (updating) return;
    setUpdating(true);
    try {
      await storage.updateProject(project.id, { stage: newStage });
      setProject({ ...project, stage: newStage });
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAdvanceStage = async () => {
    if (currentStageIndex < STAGES.length - 1) {
      const newStage = STAGES[currentStageIndex + 1];
      await handleStageChange(newStage);
    }
  };

  const handleArchive = async () => {
    if (confirm("Archive this project? It will be moved to the archive.")) {
      setUpdating(true);
      try {
        await storage.updateProject(project.id, { stage: "Archived" as Stage });
        router.push("/board");
      } catch (error) {
        console.error("Error archiving project:", error);
        alert("Failed to archive project. Please try again.");
        setUpdating(false);
      }
    }
  };

  const getCompletionDateDisplay = () => {
    if (project.requestedDateType === "asap") {
      return "ASAP";
    } else if (
      project.requestedDateType === "specific_date" &&
      project.requestedCompletionDate
    ) {
      return formatDate(project.requestedCompletionDate);
    }
    return "Not set";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-plum">
                {fullName || "Unnamed Client"}
              </h1>
              {project.estimateNumber && (
                <span className="px-3 py-1 bg-gray-100 border border-line rounded-full text-sm font-bold text-gold">
                  #{project.estimateNumber}
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-1">
              Intake: {formatDate(project.intakeDate)}
            </p>
          </div>
          <button
            onClick={() => router.push("/board")}
            className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
          >
            Back to Board
          </button>
        </div>

        {/* ASAP / HIGH PRIORITY Banner */}
        {projectIsAsap && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="font-bold text-red-700">HIGH PRIORITY</div>
              <div className="text-sm text-red-600">
                This project was marked as ASAP by the client
              </div>
            </div>
          </div>
        )}

        {/* Project Info Card */}
        <div className="bg-white border border-line rounded-xl p-6 mb-6">
          {/* Stage */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Stage:</span>
              <span className="px-4 py-2 bg-gray-100 border border-line rounded-xl font-bold">
                {project.stage}
              </span>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/calculator?projectId=${encodeURIComponent(project.id)}`
                )
              }
              className="px-4 py-2 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
            >
              Estimate →
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div>
              <h2 className="font-bold text-plum mb-3">Client Information</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted">Name:</span>{" "}
                  <span className="font-medium">{fullName || "—"}</span>
                </div>
                <div>
                  <span className="text-muted">Email:</span>{" "}
                  <span className="font-medium">
                    {project.clientEmail || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Phone:</span>{" "}
                  <span className="font-medium">
                    {project.clientPhone || "—"}
                  </span>
                </div>
                {(project.clientStreet ||
                  project.clientCity ||
                  project.clientState) && (
                  <div>
                    <span className="text-muted">Address:</span>{" "}
                    <span className="font-medium">
                      {[
                        project.clientStreet,
                        project.clientCity,
                        project.clientState,
                        project.clientPostalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h2 className="font-bold text-plum mb-3">Project Details</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted">Intake Date:</span>{" "}
                  <span className="font-medium">
                    {formatDate(project.intakeDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted">Completion Date:</span>{" "}
                  <span
                    className={`font-medium ${
                      projectIsAsap ? "text-red-600 font-bold" : ""
                    }`}
                  >
                    {getCompletionDateDisplay()}
                  </span>
                  {projectIsAsap && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      🔥 ASAP
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted">Quilt Size:</span>{" "}
                  <span className="font-medium">
                    {project.quiltWidth && project.quiltLength
                      ? `${project.quiltWidth} × ${project.quiltLength} inches`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {(project.description || project.cardLabel) && (
            <div className="mt-6 pt-6 border-t border-line">
              <h2 className="font-bold text-plum mb-2">Description</h2>
              <p className="text-sm">
                {project.description || project.cardLabel}
              </p>
            </div>
          )}
        </div>

        {/* Estimate Summary (if estimate exists) */}
        {hasEstimate && estimate && (
          <div className="bg-white border border-line rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-plum flex items-center gap-2">
                Estimate{" "}
                {project.estimateNumber && (
                  <span className="text-gold">#{project.estimateNumber}</span>
                )}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    router.push(`/invoice/${encodeURIComponent(project.id)}`)
                  }
                  className="px-4 py-2 bg-gold text-white rounded-xl font-bold hover:bg-gold/90 transition-colors"
                >
                  View Invoice
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/calculator?projectId=${encodeURIComponent(project.id)}`
                    )
                  }
                  className="px-4 py-2 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
                >
                  Edit Estimate
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {estimate.quiltingTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Quilting ({estimate.quiltArea?.toLocaleString() || 0} sq in × ${estimate.quiltingRate || 0})
                  </span>
                  <span>{formatCurrency(estimate.quiltingTotal)}</span>
                </div>
              )}
              {estimate.threadCost > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>Thread</span>
                  <span>{formatCurrency(estimate.threadCost)}</span>
                </div>
              )}
              {estimate.battingTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Batting ({estimate.battingLengthNeeded?.toFixed(0) || 0}" length)
                  </span>
                  <span>{formatCurrency(estimate.battingTotal)}</span>
                </div>
              )}
              {estimate.clientSuppliesBatting && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>Batting (Client Supplied)</span>
                  <span>$0.00</span>
                </div>
              )}
              {estimate.bindingTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Binding ({estimate.bindingPerimeter?.toFixed(0) || 0}" × ${estimate.bindingRatePerInch || 0}/in)
                  </span>
                  <span>{formatCurrency(estimate.bindingTotal)}</span>
                </div>
              )}
              {estimate.bobbinTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Bobbins ({estimate.bobbinCount || 0} × ${estimate.bobbinPrice || 0})
                  </span>
                  <span>{formatCurrency(estimate.bobbinTotal)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-line pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
              </div>
              {estimate.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tax ({estimate.taxRate || 0}%)</span>
                  <span className="font-medium">{formatCurrency(estimate.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 font-bold text-lg border-t border-line">
                <span>Total</span>
                <span className="text-plum">{formatCurrency(estimate.total)}</span>
              </div>
            </div>

            {/* Deposit Info */}
            {project.depositAmount && project.depositAmount > 0 && (
              <div className="mt-4 p-3 bg-gold/10 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gold">
                    Deposit {project.depositPaid ? "(Paid)" : "Due"}
                  </span>
                  <span className="font-bold text-gold">
                    {formatCurrency(project.depositAmount)}
                  </span>
                </div>
                {project.depositPaid && project.depositPaidDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">
                      Paid on {formatDate(project.depositPaidDate)}
                      {project.depositPaidMethod && ` via ${project.depositPaidMethod}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Balance Due</span>
                  <span className="font-bold">
                    {formatCurrency(estimate.total - (project.depositPaid ? (project.depositPaidAmount || project.depositAmount || 0) : 0))}
                  </span>
                </div>
              </div>
            )}

            {estimate.createdAt && (
              <div className="text-xs text-muted mt-4">
                Estimate created:{" "}
                {new Date(estimate.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        )}

        {/* Stage Actions */}
        <div className="bg-white border border-line rounded-xl p-6">
          <h2 className="font-bold text-plum mb-4">Stage Actions</h2>

          <div className="flex flex-wrap gap-3">
            {/* Stage buttons */}
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                disabled={project.stage === stage || updating}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  project.stage === stage
                    ? "bg-plum text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {stage}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-line">
            {currentStageIndex < STAGES.length - 1 && (
              <button
                onClick={handleAdvanceStage}
                disabled={updating}
                className={`px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors ${
                  updating ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Updating...
                  </span>
                ) : (
                  `Advance to ${STAGES[currentStageIndex + 1]} →`
                )}
              </button>
            )}
            <button
              onClick={handleArchive}
              disabled={updating}
              className={`px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors ${
                updating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Archive Project
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../components/Header";
import { storage } from "../../lib/storage";
import { STAGES } from "../../types";
import type { Project, Stage, Settings } from "../../types";

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
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Payment recording state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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

        // Load project and settings
        const [savedProject, savedSettings] = await Promise.all([
          storage.getProjectById(projectId),
          storage.getSettings(),
        ]);
        setProject(savedProject || null);
        setSettings(savedSettings);

        // Pre-fill payment amount with balance due
        if (savedProject?.estimateData?.total) {
          const depositPaid = savedProject.depositPaid
            ? savedProject.depositPaidAmount || savedProject.depositAmount || 0
            : 0;
          const balanceDue = savedProject.estimateData.total - depositPaid;
          setPaymentAmount(balanceDue.toFixed(2));
        }
      } catch (error) {
        console.error("Error loading project:", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, router]);

  const handlePrint = () => {
    window.print();
  };

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

  // Calculate balance due
  const getBalanceDue = (): number => {
    if (!estimate?.total) return 0;
    const depositPaid = project.depositPaid
      ? project.depositPaidAmount || project.depositAmount || 0
      : 0;
    const finalPaid = project.paidInFull ? project.finalPaymentAmount || 0 : 0;
    return estimate.total - depositPaid - finalPaid;
  };

  const balanceDue = getBalanceDue();

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

  const handleRecordDeposit = async () => {
    if (!project.depositAmount || project.depositAmount <= 0) {
      alert("No deposit amount set for this project.");
      return;
    }

    setUpdating(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await storage.updateProject(project.id, {
        depositPaid: true,
        depositPaidDate: today,
        depositPaidMethod: paymentMethod,
        depositPaidAmount: project.depositAmount,
      });
      setProject({
        ...project,
        depositPaid: true,
        depositPaidDate: today,
        depositPaidMethod: paymentMethod,
        depositPaidAmount: project.depositAmount,
      });
      alert("Deposit recorded successfully!");
    } catch (error) {
      console.error("Error recording deposit:", error);
      alert("Failed to record deposit. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRecordFinalPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setUpdating(true);
    try {
      const isPaidInFull = amount >= balanceDue - 0.01; // Allow for rounding
      await storage.updateProject(project.id, {
        finalPaymentAmount: amount,
        finalPaymentDate: paymentDate,
        finalPaymentMethod: paymentMethod,
        paidInFull: isPaidInFull,
        // Automatically advance to Paid/Shipped if paid in full
        ...(isPaidInFull && project.stage === "Invoiced"
          ? { stage: "Paid/Shipped" as Stage }
          : {}),
      });
      setProject({
        ...project,
        finalPaymentAmount: amount,
        finalPaymentDate: paymentDate,
        finalPaymentMethod: paymentMethod,
        paidInFull: isPaidInFull,
        ...(isPaidInFull && project.stage === "Invoiced"
          ? { stage: "Paid/Shipped" as Stage }
          : {}),
      });
      setShowPaymentForm(false);
      alert(
        isPaidInFull
          ? "Payment recorded! Project marked as Paid/Shipped."
          : "Partial payment recorded."
      );
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleClearFinalPayment = async () => {
    if (!confirm("Clear the final payment record?")) return;

    setUpdating(true);
    try {
      await storage.updateProject(project.id, {
        finalPaymentAmount: undefined,
        finalPaymentDate: undefined,
        finalPaymentMethod: undefined,
        paidInFull: false,
      });
      setProject({
        ...project,
        finalPaymentAmount: undefined,
        finalPaymentDate: undefined,
        finalPaymentMethod: undefined,
        paidInFull: false,
      });
      // Reset the payment amount field
      if (estimate?.total) {
        const depositPaid = project.depositPaid
          ? project.depositPaidAmount || project.depositAmount || 0
          : 0;
        setPaymentAmount((estimate.total - depositPaid).toFixed(2));
      }
    } catch (error) {
      console.error("Error clearing payment:", error);
      alert("Failed to clear payment. Please try again.");
    } finally {
      setUpdating(false);
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
    <div className="min-h-screen bg-background print:bg-white print:min-h-0">
      {/* Header - hidden when printing */}
      <div className="print:hidden">
        <Header />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 print:px-0 print:py-0 print:max-w-none">
        {/* Print Header - only visible when printing */}
        <div className="hidden print:block mb-6 pb-4 border-b-2 border-plum">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-plum">
                {settings?.businessName || "StitchQueue"}
              </h1>
              <p className="text-xs text-gray-600">
                {[settings?.phone, settings?.email].filter(Boolean).join(" • ")}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-plum">PROJECT DETAILS</h2>
              {project.estimateNumber && (
                <p className="text-sm text-gold font-bold">
                  Estimate #{project.estimateNumber}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Printed: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Header - hidden when printing */}
        <div className="flex items-start justify-between mb-6 print:hidden">
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
              {project.paidInFull && (
                <span className="px-3 py-1 bg-green-100 border border-green-300 rounded-full text-sm font-bold text-green-700">
                  ✓ PAID
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-1">
              Intake: {formatDate(project.intakeDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50 transition-colors"
              title="Print project details"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => router.push("/board")}
              className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
            >
              Back to Board
            </button>
          </div>
        </div>

        {/* Print-only client name header */}
        <div className="hidden print:block mb-4">
          <h2 className="text-xl font-bold text-plum">{fullName || "Unnamed Client"}</h2>
          {project.paidInFull && (
            <span className="text-green-700 font-bold">✓ PAID IN FULL</span>
          )}
        </div>

        {/* ASAP / HIGH PRIORITY Banner */}
        {projectIsAsap && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 print:bg-transparent print:border-red-300">
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
        <div className="bg-white border border-line rounded-xl p-6 mb-6 print:border-gray-300 print:p-4">
          {/* Stage - hidden when printing */}
          <div className="flex items-center justify-between mb-6 print:hidden">
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

          {/* Print-only stage display */}
          <div className="hidden print:block mb-4">
            <span className="text-sm text-muted">Stage: </span>
            <span className="font-bold">{project.stage}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 print:gap-4">
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
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium print:bg-transparent print:border print:border-red-300">
                      🔥 ASAP
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted">Quilt Size:</span>{" "}
                  <span className="font-medium">
                    {project.quiltWidth && project.quiltLength
                      ? `${project.quiltWidth}" × ${project.quiltLength}"`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {(project.description || project.cardLabel) && (
            <div className="mt-6 pt-6 border-t border-line print:mt-4 print:pt-4">
              <h2 className="font-bold text-plum mb-2">Description</h2>
              <p className="text-sm">
                {project.description || project.cardLabel}
              </p>
            </div>
          )}
        </div>

        {/* Estimate Summary (if estimate exists) */}
        {hasEstimate && estimate && (
          <div className="bg-white border border-line rounded-xl p-6 mb-6 print:border-gray-300 print:p-4">
            <div className="flex items-center justify-between mb-4 print:mb-3">
              <h2 className="font-bold text-plum flex items-center gap-2">
                Estimate{" "}
                {project.estimateNumber && (
                  <span className="text-gold">#{project.estimateNumber}</span>
                )}
              </h2>
              {/* Buttons hidden when printing */}
              <div className="flex gap-2 print:hidden">
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
              {estimate.quiltingTotal && estimate.quiltingTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Quilting ({estimate.quiltArea?.toLocaleString() || 0} sq in
                    × ${estimate.quiltingRate || 0})
                  </span>
                  <span>{formatCurrency(estimate.quiltingTotal)}</span>
                </div>
              )}
              {estimate.threadCost && estimate.threadCost > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>Thread</span>
                  <span>{formatCurrency(estimate.threadCost)}</span>
                </div>
              )}
              {estimate.battingTotal && estimate.battingTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Batting ({estimate.battingLengthNeeded?.toFixed(0) || 0}"
                    length)
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
              {estimate.bindingTotal && estimate.bindingTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Binding ({estimate.bindingPerimeter?.toFixed(0) || 0}" × $
                    {estimate.bindingRatePerInch || 0}/in)
                  </span>
                  <span>{formatCurrency(estimate.bindingTotal)}</span>
                </div>
              )}
              {estimate.bobbinTotal && estimate.bobbinTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-line">
                  <span>
                    Bobbins ({estimate.bobbinCount || 0} × $
                    {estimate.bobbinPrice || 0})
                  </span>
                  <span>{formatCurrency(estimate.bobbinTotal)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-line pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(estimate.subtotal)}
                </span>
              </div>
              {estimate.taxAmount && estimate.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">
                    Tax ({estimate.taxRate || 0}%)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(estimate.taxAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 font-bold text-lg border-t border-line">
                <span>Total</span>
                <span className="text-plum">
                  {formatCurrency(estimate.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary Card */}
        {hasEstimate && estimate && (
          <div className="bg-white border border-line rounded-xl p-6 mb-6 print:border-gray-300 print:p-4">
            <h2 className="font-bold text-plum mb-4">Payment Summary</h2>

            <div className="space-y-3">
              {/* Invoice Total */}
              <div className="flex justify-between text-sm py-2 border-b border-line">
                <span className="text-muted">Invoice Total</span>
                <span className="font-bold">
                  {formatCurrency(estimate.total)}
                </span>
              </div>

              {/* Deposit Section */}
              {project.depositAmount && project.depositAmount > 0 && (
                <div className="p-3 bg-gold/10 rounded-xl space-y-2 print:bg-transparent print:border print:border-gold/30">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gold">Deposit</span>
                    <span className="font-bold text-gold">
                      {formatCurrency(project.depositAmount)}
                    </span>
                  </div>
                  {project.depositPaid ? (
                    <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded print:bg-transparent">
                      ✓ Paid on {formatDate(project.depositPaidDate)}
                      {project.depositPaidMethod &&
                        ` via ${project.depositPaidMethod}`}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between print:hidden">
                      <span className="text-xs text-orange-600">
                        Not yet received
                      </span>
                      <button
                        onClick={handleRecordDeposit}
                        disabled={updating}
                        className="px-3 py-1 bg-gold text-white rounded-lg text-xs font-bold hover:bg-gold/90 transition-colors disabled:opacity-50"
                      >
                        Record Deposit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Final Payment Section */}
              {project.finalPaymentAmount && project.finalPaymentAmount > 0 ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-2 print:bg-transparent">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-green-700">
                      Final Payment
                    </span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(project.finalPaymentAmount)}
                    </span>
                  </div>
                  <div className="text-xs text-green-700">
                    ✓ Paid on {formatDate(project.finalPaymentDate)}
                    {project.finalPaymentMethod &&
                      ` via ${project.finalPaymentMethod}`}
                  </div>
                  {/* Clear button hidden when printing */}
                  <button
                    onClick={handleClearFinalPayment}
                    disabled={updating}
                    className="text-xs text-red-600 hover:text-red-800 underline print:hidden"
                  >
                    Clear payment
                  </button>
                </div>
              ) : (
                /* Record Payment Form/Button - hidden when printing */
                !project.paidInFull &&
                balanceDue > 0 && (
                  <div className="p-3 bg-gray-50 rounded-xl print:hidden">
                    {showPaymentForm ? (
                      <div className="space-y-3">
                        <div className="font-bold text-sm text-plum">
                          Record Final Payment
                        </div>
                        <div>
                          <label className="block text-xs text-muted mb-1">
                            Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-full pl-7 pr-3 py-2 border border-line rounded-lg text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-muted mb-1">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 border border-line rounded-lg text-sm"
                          >
                            <option value="Cash">Cash</option>
                            <option value="Check">Check</option>
                            <option value="Venmo">Venmo</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Zelle">Zelle</option>
                            <option value="Square">Square</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted mb-1">
                            Payment Date
                          </label>
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full px-3 py-2 border border-line rounded-lg text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRecordFinalPayment}
                            disabled={updating}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {updating ? "Saving..." : "Save Payment"}
                          </button>
                          <button
                            onClick={() => setShowPaymentForm(false)}
                            className="px-4 py-2 border border-line rounded-lg text-sm hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowPaymentForm(true)}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                      >
                        💵 Record Final Payment
                      </button>
                    )}
                  </div>
                )
              )}

              {/* Balance Due */}
              <div
                className={`flex justify-between py-3 font-bold text-lg border-t border-line ${
                  balanceDue <= 0 ? "text-green-700" : "text-plum"
                }`}
              >
                <span>Balance Due</span>
                <span>
                  {balanceDue <= 0
                    ? "✓ PAID IN FULL"
                    : formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stage Actions - hidden when printing */}
        <div className="bg-white border border-line rounded-xl p-6 print:hidden">
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

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Printed from StitchQueue • {settings?.businessName || ""}</p>
        </div>
      </main>
    </div>
  );
}
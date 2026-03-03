"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Toast from "../../components/Toast";
import Header from "../../components/Header";
import PhotoUpload from "../../components/PhotoUpload";
import PhotoGallery from "../../components/PhotoGallery";
import { storage } from "../../lib/storage";
import { getOrganizationId } from "../../lib/storage/auth";
import { FeatureGate } from "../../lib/featureFlags";
import SubscriptionGate from "../../components/SubscriptionGate";
import { STAGES } from "../../types";
import type { Project, Stage, Settings } from "../../types";
import { getTodayDate } from "../../lib/utils";

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
  return (
    <SubscriptionGate>
      <ProjectDetailContent />
    </SubscriptionGate>
  );
}

function ProjectDetailContent() {
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
    getTodayDate()
  );

  // Email sending state
  const [showEstimateConfirm, setShowEstimateConfirm] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Approval state
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
  const [pendingApprovalValue, setPendingApprovalValue] = useState(false);
  const [approvingProject, setApprovingProject] = useState(false);

  // Completion checklist state
  const [showChecklistConfirm, setShowChecklistConfirm] = useState(false);
  const [pendingChecklistItem, setPendingChecklistItem] = useState<'invoiced' | 'paid' | 'delivered' | null>(null);
  const [pendingChecklistValue, setPendingChecklistValue] = useState(false);
  const [updatingChecklist, setUpdatingChecklist] = useState(false);
  const [checklistInputs, setChecklistInputs] = useState({
    invoicedAmount: '',
    invoicedDate: getTodayDate(),
    paidAmount: '',
    paidDate: getTodayDate(),
    deliveryMethod: 'pickup' as 'pickup' | 'shipped' | 'mailed',
    deliveryDate: getTodayDate(),
  });
  const [validationErrors, setValidationErrors] = useState({
    invoicedAmount: '',
    invoicedDate: '',
    paidAmount: '',
    paidDate: '',
    deliveryMethod: '',
    deliveryDate: '',
  });

  // Notes state
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Photo state
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [photoGalleryKey, setPhotoGalleryKey] = useState(0);

  // Set document title for PDF naming
  useEffect(() => {
    if (project?.estimateNumber) {
      document.title = `StitchQueue Job #${project.estimateNumber}`;
    } else if (project) {
      const name = `${project.clientFirstName || ""} ${project.clientLastName || ""}`.trim();
      document.title = name ? `StitchQueue - ${name}` : "StitchQueue Project";
    }
    return () => {
      document.title = "StitchQueue";
    };
  }, [project?.estimateNumber, project?.clientFirstName, project?.clientLastName]);

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

        // Load project, settings, and organization ID
        const [savedProject, savedSettings, orgId] = await Promise.all([
          storage.getProjectById(projectId),
          storage.getSettings(),
          getOrganizationId(),
        ]);
        setProject(savedProject || null);
        setSettings(savedSettings);
        setOrganizationId(orgId);
        setNotesValue(savedProject?.projectNotes || "");

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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleSendEstimate = async () => {
    if (!project?.clientEmail) {
      showToast("Client email address is required to send estimate", "error");
      return;
    }

    setSendingEmail(true);
    setShowEstimateConfirm(false);

    try {
      const response = await fetch('/api/send-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send estimate');
      }

      const updatedProject = await storage.getProjectById(projectId);
      setProject(updatedProject || null);

      showToast(`Estimate sent to ${project.clientEmail}!`, "success");
    } catch (error) {
      console.error('Error sending estimate:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to send estimate',
        "error"
      );
    } finally {
      setSendingEmail(false);
    }
  };

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
  const hasEstimate = project.estimateData && (project.estimateData.total ?? 0) > 0;
  const estimate = project.estimateData;

  // Effective project type: prefer projectType, fall back to invoiceType, default to regular
  const effectiveProjectType = project.projectType || project.invoiceType || 'regular';

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
      // Auto-approve when moving from Estimates to In Progress
      const autoApprove =
        project.stage === "Estimates" && newStage === "In Progress";
      const today = getTodayDate();

      const updates: Partial<Project> = {
        stage: newStage,
        ...(autoApprove && {
          approvalStatus: true,
          approvalDate: today,
        }),
      };

      await storage.updateProject(project.id, updates);
      setProject({ ...project, ...updates });
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
      const today = getTodayDate();
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
      });
      setProject({
        ...project,
        finalPaymentAmount: amount,
        finalPaymentDate: paymentDate,
        finalPaymentMethod: paymentMethod,
        paidInFull: isPaidInFull,
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

  const handleApprovalChange = (checked: boolean) => {
    setPendingApprovalValue(checked);
    setShowApprovalConfirm(true);
  };

  const handleConfirmApproval = async () => {
    setShowApprovalConfirm(false);
    setApprovingProject(true);

    try {
      const today = getTodayDate();
      const updates: Partial<Project> = {
        approvalStatus: pendingApprovalValue,
        approvalDate: pendingApprovalValue ? today : undefined,
      };

      // Auto-advance to In Progress when approving
      if (pendingApprovalValue && project.stage === "Estimates") {
        updates.stage = "In Progress" as Stage;
      }

      // Move back to Estimates when removing approval from any stage
      if (!pendingApprovalValue && project.stage !== "Estimates" && project.approvalStatus) {
        updates.stage = "Estimates" as Stage;
      }

      await storage.updateProject(project.id, updates);

      setProject({
        ...project,
        ...updates,
      });

      if (pendingApprovalValue) {
        showToast("Estimate approved! Moved to In Progress.", "success");
      } else {
        showToast("Approval removed. Moved back to Estimates.", "info");
      }
    } catch (error) {
      console.error("Error updating approval:", error);
      showToast("Failed to update approval status. Please try again.", "error");
    } finally {
      setApprovingProject(false);
    }
  };

  // Checklist handlers
  const handleChecklistChange = (item: 'invoiced' | 'paid' | 'delivered', checked: boolean) => {
    setPendingChecklistItem(item);
    setPendingChecklistValue(checked);

    // Clear validation errors
    setValidationErrors({
      invoicedAmount: '',
      invoicedDate: '',
      paidAmount: '',
      paidDate: '',
      deliveryMethod: '',
      deliveryDate: '',
    });

    // Pre-fill amounts from estimate if checking invoiced (regular projects only)
    if (item === 'invoiced' && checked && estimate?.total && effectiveProjectType === 'regular') {
      setChecklistInputs(prev => ({
        ...prev,
        invoicedAmount: estimate.total!.toFixed(2),
      }));
    }

    // Pre-fill paid amount with remaining balance when checking paid (regular projects only)
    if (item === 'paid' && checked && effectiveProjectType === 'regular') {
      const invoicedAmt = project.invoicedAmount || estimate?.total || 0;
      const depositAmt = project.depositPaidAmount || 0;
      const remainingBalance = invoicedAmt - depositAmt;
      if (remainingBalance > 0) {
        setChecklistInputs(prev => ({
          ...prev,
          paidAmount: remainingBalance.toFixed(2),
        }));
      }
    }

    setShowChecklistConfirm(true);
  };

  const handleConfirmChecklist = async () => {
    if (!pendingChecklistItem) return;

    // Validate inputs
    if (pendingChecklistValue && !validateChecklistInputs()) {
      showToast("Please correct the errors before submitting.", "error");
      return;
    }

    setShowChecklistConfirm(false);
    setUpdatingChecklist(true);

    try {
      const updates: Partial<Project> = {};

      if (pendingChecklistItem === 'invoiced') {
        updates.invoiced = pendingChecklistValue;
        if (pendingChecklistValue) {
          // Use estimate total as source of truth for regular projects
          if (effectiveProjectType === 'regular') {
            updates.invoicedAmount = estimate?.total || 0;
          }
          updates.invoicedDate = checklistInputs.invoicedDate;
        } else {
          updates.invoicedAmount = undefined;
          updates.invoicedDate = undefined;
        }
      } else if (pendingChecklistItem === 'paid') {
        updates.paid = pendingChecklistValue;
        if (pendingChecklistValue) {
          updates.paidAmount = parseFloat(checklistInputs.paidAmount);
          updates.paidDate = checklistInputs.paidDate;
        } else {
          updates.paidAmount = undefined;
          updates.paidDate = undefined;
        }
      } else if (pendingChecklistItem === 'delivered') {
        updates.delivered = pendingChecklistValue;
        if (pendingChecklistValue) {
          // Charitable projects only need date; regular and gift include delivery method
          if (effectiveProjectType !== 'charitable') {
            updates.deliveryMethod = checklistInputs.deliveryMethod;
          }
          updates.deliveryDate = checklistInputs.deliveryDate;
        } else {
          updates.deliveryMethod = undefined;
          updates.deliveryDate = undefined;
        }
      }

      // Calculate balance remaining for regular projects only
      if (effectiveProjectType === 'regular') {
        const invoicedAmt = pendingChecklistItem === 'invoiced'
          ? (pendingChecklistValue ? (estimate?.total || 0) : 0)
          : project.invoicedAmount || 0;
        const paidAmt = pendingChecklistItem === 'paid'
          ? (pendingChecklistValue ? parseFloat(checklistInputs.paidAmount) : 0)
          : project.paidAmount || 0;
        const depositAmt = project.depositPaidAmount || 0;

        updates.balanceRemaining = invoicedAmt - depositAmt - paidAmt;
      }

      await storage.updateProject(project.id, updates);

      setProject({
        ...project,
        ...updates,
      });

      const itemName = pendingChecklistItem === 'invoiced' ? 'Job Summary' : pendingChecklistItem.charAt(0).toUpperCase() + pendingChecklistItem.slice(1);
      if (pendingChecklistValue) {
        showToast(`${itemName} status updated!`, "success");
      } else {
        showToast(`${itemName} status removed.`, "info");
      }
    } catch (error) {
      console.error("Error updating checklist:", error);
      showToast("Failed to update checklist. Please try again.", "error");
    } finally {
      setUpdatingChecklist(false);
      setPendingChecklistItem(null);
    }
  };

  const handleArchiveComplete = async () => {
    if (!confirm("Archive this project? Completed projects are moved to Archive for record-keeping.")) return;

    setUpdating(true);
    try {
      await storage.updateProject(project.id, { stage: "Archived" as Stage });
      showToast("Project archived successfully!", "success");
      setTimeout(() => {
        router.push("/board");
      }, 1000);
    } catch (error) {
      console.error("Error archiving project:", error);
      showToast("Failed to archive project. Please try again.", "error");
      setUpdating(false);
    }
  };

  const handleNotesSave = async () => {
    if (notesValue === (project.projectNotes || "")) return;
    setSavingNotes(true);
    try {
      await storage.updateProject(project.id, { projectNotes: notesValue });
      setProject({ ...project, projectNotes: notesValue });
      showToast("Notes saved", "success");
    } catch (error) {
      console.error("Error saving notes:", error);
      showToast("Failed to save notes. Please try again.", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  // Check if all checklist items are complete
  const isChecklistComplete = (): boolean => {
    if (project.stage !== "Completed") return false;

    if (effectiveProjectType === 'regular') {
      return !!(project.invoiced && project.paid && project.delivered);
    } else if (effectiveProjectType === 'gift') {
      return !!(project.invoiced && project.delivered);
    } else if (effectiveProjectType === 'charitable') {
      return !!(project.invoiced && project.delivered);
    }

    return false;
  };

  // Validation helpers
  const validateAmount = (value: string, fieldName: string): string => {
    if (!value || value.trim() === '') {
      return 'Amount is required';
    }
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      return 'Please enter a valid number';
    }
    if (amount <= 0) {
      return 'Amount must be greater than $0';
    }
    // Check for max 2 decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      return 'Amount can have at most 2 decimal places';
    }
    // Additional validation for paid amount
    if (fieldName === 'paidAmount' && project.invoicedAmount) {
      const maxPaid = project.invoicedAmount - (project.depositPaidAmount || 0);
      if (amount > maxPaid) {
        return `Amount cannot exceed remaining balance (${formatCurrency(maxPaid)})`;
      }
    }
    return '';
  };

  const validateDate = (value: string): string => {
    if (!value || value.trim() === '') {
      return 'Date is required';
    }
    const selectedDate = new Date(value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return 'Date cannot be in the future';
    }
    return '';
  };

  const validateDeliveryMethod = (value: string): string => {
    if (!value || !['pickup', 'shipped', 'mailed'].includes(value)) {
      return 'Delivery method is required';
    }
    return '';
  };

  const validateChecklistInputs = (): boolean => {
    if (!pendingChecklistItem || !pendingChecklistValue) return true;

    const errors = { ...validationErrors };
    let hasErrors = false;

    if (pendingChecklistItem === 'invoiced') {
      // Amount is auto-set from estimate total, only validate date
      errors.invoicedDate = validateDate(checklistInputs.invoicedDate);
      hasErrors = !!(errors.invoicedDate);
    } else if (pendingChecklistItem === 'paid') {
      errors.paidAmount = validateAmount(checklistInputs.paidAmount, 'paidAmount');
      errors.paidDate = validateDate(checklistInputs.paidDate);
      hasErrors = !!(errors.paidAmount || errors.paidDate);
    } else if (pendingChecklistItem === 'delivered') {
      // Only validate delivery method for regular and gift; charitable just needs date
      if (effectiveProjectType !== 'charitable') {
        errors.deliveryMethod = validateDeliveryMethod(checklistInputs.deliveryMethod);
      }
      errors.deliveryDate = validateDate(checklistInputs.deliveryDate);
      hasErrors = !!(errors.deliveryMethod || errors.deliveryDate);
    }

    setValidationErrors(errors);
    return !hasErrors;
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
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal - Send Estimate */}
      {showEstimateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-plum mb-3">Send Estimate Email</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send estimate #{project.estimateNumber} to <strong>{project.clientEmail}</strong>?
            </p>
            <p className="text-xs text-gray-500 mb-6">
              The client will receive a professional email with full pricing details and a PDF attachment. 
              They can approve, request changes, or decline.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSendEstimate}
                disabled={sendingEmail}
                className="flex-1 px-4 py-3 bg-gold text-white rounded-xl font-bold hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {sendingEmail ? "Sending..." : "Send Estimate"}
              </button>
              <button
                onClick={() => setShowEstimateConfirm(false)}
                disabled={sendingEmail}
                className="px-4 py-3 border border-line rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Approval Status */}
      {showApprovalConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-plum mb-3">
              {pendingApprovalValue ? "Mark Estimate as Approved?" : "Remove Approval?"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {pendingApprovalValue
                ? "This will move the project to In Progress stage."
                : "This will move the project back to Estimates stage."}
            </p>
            {pendingApprovalValue && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <div className="text-sm text-green-700">
                    <div className="font-medium">Project will advance automatically</div>
                    <div className="text-xs mt-1">Estimates → In Progress</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmApproval}
                disabled={approvingProject}
                className="flex-1 px-4 py-3 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors disabled:opacity-50"
              >
                {approvingProject ? "Updating..." : pendingApprovalValue ? "Approve" : "Remove Approval"}
              </button>
              <button
                onClick={() => setShowApprovalConfirm(false)}
                disabled={approvingProject}
                className="px-4 py-3 border border-line rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Checklist Item */}
      {showChecklistConfirm && pendingChecklistItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-plum mb-3">
              {(() => {
                const itemLabel = pendingChecklistItem === 'invoiced'
                  ? effectiveProjectType === 'gift' ? 'Gift Summary Created'
                    : effectiveProjectType === 'charitable' ? 'Donation Receipt Generated'
                    : 'Job Summary Created'
                  : pendingChecklistItem!.charAt(0).toUpperCase() + pendingChecklistItem!.slice(1);
                return pendingChecklistValue
                  ? `Mark as ${itemLabel}?`
                  : `Remove ${itemLabel} status?`;
              })()}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {pendingChecklistValue
                ? "This will update the project status."
                : "The associated data will be cleared."}
            </p>

            {/* Input fields when checking */}
            {pendingChecklistValue && (
              <div className="space-y-3 mb-4">
                {pendingChecklistItem === 'invoiced' && (
                  <>
                    {/* Read-only amount display for regular projects */}
                    {effectiveProjectType === 'regular' && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Job Summary Amount</label>
                        <div className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-gray-50 font-medium text-gray-700">
                          {formatCurrency(estimate?.total || 0)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Auto-calculated from estimate total</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Date *</label>
                      <input
                        type="date"
                        value={checklistInputs.invoicedDate}
                        max={getTodayDate()}
                        onChange={(e) => {
                          setChecklistInputs(prev => ({ ...prev, invoicedDate: e.target.value }));
                          setValidationErrors(prev => ({ ...prev, invoicedDate: '' }));
                        }}
                        onBlur={(e) => {
                          const error = validateDate(e.target.value);
                          setValidationErrors(prev => ({ ...prev, invoicedDate: error }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          validationErrors.invoicedDate
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-line focus:ring-plum'
                        }`}
                      />
                      {validationErrors.invoicedDate && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.invoicedDate}</p>
                      )}
                    </div>
                  </>
                )}

                {pendingChecklistItem === 'paid' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={checklistInputs.paidAmount}
                        onChange={(e) => {
                          setChecklistInputs(prev => ({ ...prev, paidAmount: e.target.value }));
                          setValidationErrors(prev => ({ ...prev, paidAmount: '' }));
                        }}
                        onBlur={(e) => {
                          const error = validateAmount(e.target.value, 'paidAmount');
                          setValidationErrors(prev => ({ ...prev, paidAmount: error }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          validationErrors.paidAmount
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-line focus:ring-plum'
                        }`}
                        placeholder="0.00"
                      />
                      {validationErrors.paidAmount && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.paidAmount}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Date *</label>
                      <input
                        type="date"
                        value={checklistInputs.paidDate}
                        max={getTodayDate()}
                        onChange={(e) => {
                          setChecklistInputs(prev => ({ ...prev, paidDate: e.target.value }));
                          setValidationErrors(prev => ({ ...prev, paidDate: '' }));
                        }}
                        onBlur={(e) => {
                          const error = validateDate(e.target.value);
                          setValidationErrors(prev => ({ ...prev, paidDate: error }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          validationErrors.paidDate
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-line focus:ring-plum'
                        }`}
                      />
                      {validationErrors.paidDate && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.paidDate}</p>
                      )}
                    </div>
                  </>
                )}

                {pendingChecklistItem === 'delivered' && (
                  <>
                    {/* Delivery method for regular and gift projects only */}
                    {effectiveProjectType !== 'charitable' && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Delivery Method *</label>
                        <select
                          value={checklistInputs.deliveryMethod}
                          onChange={(e) => {
                            setChecklistInputs(prev => ({
                              ...prev,
                              deliveryMethod: e.target.value as 'pickup' | 'shipped' | 'mailed'
                            }));
                            setValidationErrors(prev => ({ ...prev, deliveryMethod: '' }));
                          }}
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            validationErrors.deliveryMethod
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-line focus:ring-plum'
                          }`}
                        >
                          <option value="pickup">Pickup</option>
                          <option value="shipped">Shipped</option>
                          <option value="mailed">Mailed</option>
                        </select>
                        {validationErrors.deliveryMethod && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.deliveryMethod}</p>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Date *</label>
                      <input
                        type="date"
                        value={checklistInputs.deliveryDate}
                        max={getTodayDate()}
                        onChange={(e) => {
                          setChecklistInputs(prev => ({ ...prev, deliveryDate: e.target.value }));
                          setValidationErrors(prev => ({ ...prev, deliveryDate: '' }));
                        }}
                        onBlur={(e) => {
                          const error = validateDate(e.target.value);
                          setValidationErrors(prev => ({ ...prev, deliveryDate: error }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                          validationErrors.deliveryDate
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-line focus:ring-plum'
                        }`}
                      />
                      {validationErrors.deliveryDate && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.deliveryDate}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirmChecklist}
                disabled={updatingChecklist}
                className="flex-1 px-4 py-3 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors disabled:opacity-50"
              >
                {updatingChecklist ? "Updating..." : "Confirm"}
              </button>
              <button
                onClick={() => {
                  setShowChecklistConfirm(false);
                  setPendingChecklistItem(null);
                }}
                disabled={updatingChecklist}
                className="px-4 py-3 border border-line rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - hidden when printing */}
      <div className="print:hidden">
        <Header />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 print:px-0 print:py-0 print:max-w-none">
        {/* Print Header - only visible when printing */}
        <div className="hidden print:block mb-4 pb-2 border-b-2 border-plum">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold text-plum">
                {settings?.businessName || "StitchQueue"}
              </h1>
              <p className="text-xs text-gray-600">
                {[settings?.phone, settings?.email].filter(Boolean).join(" • ")}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold text-plum">PROJECT DETAILS</h2>
              {project.estimateNumber && (
                <p className="text-sm text-gold font-bold">
                  Estimate #{project.estimateNumber}
                </p>
              )}
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
            {/* Send Estimate Button */}
            {hasEstimate && (
              <button
                onClick={() => {
                  if (!project.clientEmail) {
                    showToast("Please add a client email address before sending", "error");
                    return;
                  }
                  setShowEstimateConfirm(true);
                }}
                disabled={sendingEmail}
                className={`px-4 py-2 border rounded-xl font-bold transition-colors ${
                  project.clientEmail
                    ? 'border-gold bg-gold text-white hover:bg-gold/90'
                    : 'border-gold/50 bg-gold/20 text-gold hover:bg-gold/30'
                }`}
                title={!project.clientEmail ? "Add client email first" : "Send estimate email"}
              >
                📧 Estimate
              </button>
            )}
            {/* View Job Summary Button */}
            {hasEstimate && (
              <button
                onClick={() => router.push(`/invoice/${encodeURIComponent(project.id)}`)}
                className="px-4 py-2 border border-plum bg-plum/10 text-plum rounded-xl font-bold hover:bg-plum/20 transition-colors"
                title="View job summary"
              >
                📄 Job Summary
              </button>
            )}
            <button
              onClick={() => router.push("/board")}
              className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
            >
              Back to Board
            </button>
          </div>
        </div>

        {/* Print-only client name header */}
        <div className="hidden print:block mb-2">
          <h2 className="text-lg font-bold text-plum">{fullName || "Unnamed Client"}</h2>
          {project.paidInFull && (
            <span className="text-green-700 font-bold text-sm">✓ PAID IN FULL</span>
          )}
        </div>

        {/* ASAP / HIGH PRIORITY Banner */}
        {projectIsAsap && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 print:bg-transparent print:border-red-300 print:p-2 print:mb-3">
            <span className="text-2xl print:text-xl">🔥</span>
            <div>
              <div className="font-bold text-red-700 print:text-sm">HIGH PRIORITY - ASAP</div>
            </div>
          </div>
        )}

        {/* Project Info Card */}
        <div className="bg-white border border-line rounded-xl p-6 mb-6 print:border-gray-300 print:p-3 print:mb-3">
          {/* Stage - hidden when printing */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Stage:</span>
              <span className="px-4 py-2 bg-gray-100 border border-line rounded-xl font-bold">
                {project.stage}
              </span>
            </div>
            {project.stage !== "Completed" && project.stage !== "Archived" && (
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
            )}
          </div>

          {/* Print-only stage display */}
          <div className="hidden print:block mb-4">
            <span className="text-sm text-muted">Stage: </span>
            <span className="font-bold">{project.stage}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 print:gap-3">
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
            <div className="mt-6 pt-6 border-t border-line print:mt-3 print:pt-3">
              <h2 className="font-bold text-plum mb-2 print:mb-1 print:text-sm">Description</h2>
              <p className="text-sm print:text-xs">
                {project.description || project.cardLabel}
              </p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white border border-line rounded-xl p-6 mb-6 print:border-gray-300 print:p-3 print:mb-3">
          <h2 className="font-bold text-plum mb-3">Notes</h2>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={handleNotesSave}
            disabled={savingNotes}
            placeholder="Add internal notes, client preferences, or project updates..."
            className="w-full min-h-[150px] px-4 py-3 border border-line rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-plum focus:border-plum disabled:opacity-50 print:border-gray-300"
          />
        </div>

        {/* Estimate Summary (if estimate exists) */}
        {hasEstimate && estimate && (
          <div className="bg-white border border-line rounded-xl p-6 mb-6 print:border-gray-300 print:p-3 print:mb-3">
            <div className="flex items-center justify-between mb-4 print:mb-2">
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

            <div className="space-y-0 text-sm">
              {(estimate.quiltingTotal ?? 0) > 0 && (
                <div className="flex justify-between py-1 border-b border-line">
                  <span>
                    Quilting ({(estimate.quiltArea || 0).toLocaleString()} sq in × ${estimate.quiltingRate}/sq in)
                  </span>
                  <span>{formatCurrency(estimate.quiltingTotal)}</span>
                </div>
              )}
              {(estimate.threadCost ?? 0) > 0 && (
                <div className="flex justify-between py-1 border-b border-line">
                  <span>Thread</span>
                  <span>{formatCurrency(estimate.threadCost)}</span>
                </div>
              )}
              {(estimate.battingTotal ?? 0) > 0 && (
                <div className="flex justify-between py-1 border-b border-line">
                  <span>
                    Batting ({Math.round(estimate.battingLengthNeeded || 0)}" length)
                  </span>
                  <span>{formatCurrency(estimate.battingTotal)}</span>
                </div>
              )}
              {estimate.clientSuppliesBatting && (
                <div className="flex justify-between py-1 border-b border-line">
                  <span>Batting (Client Supplied)</span>
                  <span>$0.00</span>
                </div>
              )}
              {(estimate.bindingTotal ?? 0) > 0 && (
                <div className="flex justify-between py-1 border-b border-line">
                  <span>
                    Binding ({Math.round(estimate.bindingPerimeter || 0)}" × ${estimate.bindingRatePerInch}/in)
                  </span>
                  <span>{formatCurrency(estimate.bindingTotal)}</span>
                </div>
              )}
              {(estimate.bobbinTotal ?? 0) > 0 && (
                <div className="flex justify-between py-1 border-b border-line">
                  <span>
                    Bobbins ({estimate.bobbinCount} × ${estimate.bobbinPrice})
                  </span>
                  <span>{formatCurrency(estimate.bobbinTotal)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-line pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
              </div>
              {/* v4.0 DEPRECATED - Tax display hidden by ENABLE_TAX_SYSTEM flag */}
              <FeatureGate flag="ENABLE_TAX_SYSTEM">
                {(estimate.taxAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tax ({estimate.taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(estimate.taxAmount)}</span>
                  </div>
                )}
              </FeatureGate>
              <div className="flex justify-between py-1 font-bold text-base border-t border-line">
                <span>Total</span>
                <span className="text-plum">{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* v5.1 DEPRECATED - Payment Summary hidden by ENABLE_DETAILED_PAYMENTS flag */}
        {/* Payment tracking is now handled by the Completion Checklist */}
        <FeatureGate flag="ENABLE_DETAILED_PAYMENTS">
        {hasEstimate && estimate && (
          <div className="bg-white border border-line rounded-xl p-6 mb-6 print:border-gray-300 print:p-3 print:mb-2">
            <h2 className="font-bold text-plum mb-3 print:mb-2 print:text-sm">Payment Summary</h2>

            <div className="space-y-2 print:space-y-1">
              {/* Invoice Total */}
              <div className="flex justify-between text-sm py-1 border-b border-line">
                <span className="text-muted">Invoice Total</span>
                <span className="font-bold">{formatCurrency(estimate.total)}</span>
              </div>

              {/* Deposit Section */}
              {project.depositAmount && project.depositAmount > 0 && (
                <div className="p-2 bg-gold/10 rounded-lg space-y-1 print:bg-transparent print:border print:border-gold/30 print:p-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gold">Deposit</span>
                    <span className="font-bold text-gold">{formatCurrency(project.depositAmount)}</span>
                  </div>
                  {project.depositPaid ? (
                    <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded print:bg-transparent print:p-0">
                      ✓ Paid on {formatDate(project.depositPaidDate)}{project.depositPaidMethod && ` via ${project.depositPaidMethod}`}
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
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg space-y-1 print:bg-transparent print:p-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-green-700">Final Payment</span>
                    <span className="font-bold text-green-700">{formatCurrency(project.finalPaymentAmount)}</span>
                  </div>
                  <div className="text-xs text-green-700">
                    ✓ Paid on {formatDate(project.finalPaymentDate)}{project.finalPaymentMethod && ` via ${project.finalPaymentMethod}`}
                  </div>
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
                className={`flex justify-between py-2 font-bold text-base border-t border-line print:py-1 ${
                  balanceDue <= 0 ? "text-green-700" : "text-plum"
                }`}
              >
                <span>Balance Due</span>
                <span>{balanceDue <= 0 ? "✓ PAID IN FULL" : formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>
        )}
        </FeatureGate>

        {/* Approval Section - Visible in all stages (except Archived) */}
        {project.stage !== "Archived" && (
          <div className="bg-white border border-line rounded-xl p-6 mb-6 print:hidden">
            <h2 className="font-bold text-plum mb-4">Estimate Approval</h2>

            <div className="space-y-4">
              {/* Approval Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={project.approvalStatus || false}
                  onChange={(e) => handleApprovalChange(e.target.checked)}
                  disabled={approvingProject}
                  className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                    Mark as Approved
                  </span>
                  {approvingProject && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-plum"></div>
                      <span className="text-xs text-gray-500">Updating...</span>
                    </div>
                  )}
                </div>
              </label>

              {/* Approval Status Display */}
              {project.approvalStatus && project.approvalDate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <div className="flex-1">
                      <div className="font-medium text-green-700">
                        Approved on {formatDate(project.approvalDate)}
                      </div>
                      {project.stage !== "Estimates" && (
                        <div className="text-xs text-green-600 mt-1">
                          Uncheck to move back to Estimates for re-approval
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box - When Not Approved */}
              {!project.approvalStatus && project.stage === "Estimates" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 text-xl">ℹ️</span>
                    <div className="text-sm text-blue-700">
                      <div className="font-medium">Ready to start work?</div>
                      <div className="text-xs mt-1">
                        Check the box above to approve this estimate and automatically move it to &quot;In Progress&quot;
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Checklist - Only for Completed Stage */}
        {project.stage === "Completed" && (
          <div className="bg-white border border-line rounded-xl p-6 mb-6 print:hidden">
            <h2 className="font-bold text-plum mb-4">Completion Checklist</h2>

            {/* All Complete Banner */}
            {isChecklistComplete() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-2xl">✓</span>
                    <div>
                      <div className="font-bold text-green-700">All tasks complete!</div>
                      <div className="text-sm text-green-600">Ready to archive this project.</div>
                    </div>
                  </div>
                  <button
                    onClick={handleArchiveComplete}
                    disabled={updating}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Archiving..." : "Archive Project"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* REGULAR PROJECT CHECKLIST */}
              {effectiveProjectType === 'regular' && (
                <>
                  {/* Job Summary Created */}
                  <div className="border border-line rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={project.invoiced || false}
                        onChange={(e) => handleChecklistChange('invoiced', e.target.checked)}
                        disabled={updatingChecklist}
                        className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                          Job Summary Created
                        </div>
                        {project.invoiced && (
                          <div className="text-sm text-green-700 mt-1">
                            {formatCurrency(project.invoicedAmount)} • {formatDate(project.invoicedDate)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Paid */}
                  <div className="border border-line rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={project.paid || false}
                        onChange={(e) => handleChecklistChange('paid', e.target.checked)}
                        disabled={updatingChecklist}
                        className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                          Paid
                        </div>
                        {project.paid && (
                          <div className="text-sm text-green-700 mt-1">
                            {formatCurrency(project.paidAmount)} • {formatDate(project.paidDate)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Delivered */}
                  <div className="border border-line rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={project.delivered || false}
                        onChange={(e) => handleChecklistChange('delivered', e.target.checked)}
                        disabled={updatingChecklist}
                        className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                          Delivered
                        </div>
                        {project.delivered && (
                          <div className="text-sm text-green-700 mt-1">
                            {project.deliveryMethod?.charAt(0).toUpperCase() + (project.deliveryMethod?.slice(1) || '')} • {formatDate(project.deliveryDate)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Balance Remaining */}
                  {project.invoiced && (
                    <div className={`p-4 rounded-lg border-2 ${
                      (project.balanceRemaining || 0) > 0
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-green-50 border-green-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Balance Remaining:</span>
                        <span className={`font-bold text-lg ${
                          (project.balanceRemaining || 0) > 0
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}>
                          {(project.balanceRemaining || 0) <= 0
                            ? '✓ PAID IN FULL'
                            : formatCurrency(project.balanceRemaining)}
                        </span>
                      </div>
                      {(project.balanceRemaining || 0) > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          Job Summary: {formatCurrency(project.invoicedAmount)} - Deposit: {formatCurrency(project.depositPaidAmount || 0)} - Paid: {formatCurrency(project.paidAmount || 0)}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* GIFT PROJECT CHECKLIST */}
              {effectiveProjectType === 'gift' && (
                <>
                  {/* Gift Summary */}
                  <div className="border border-line rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={project.invoiced || false}
                        onChange={(e) => handleChecklistChange('invoiced', e.target.checked)}
                        disabled={updatingChecklist}
                        className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                          Gift Summary Created
                        </div>
                        {project.invoiced && (
                          <div className="text-sm text-green-700 mt-1">
                            {formatDate(project.invoicedDate)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Delivered */}
                  <div className="border border-line rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={project.delivered || false}
                        onChange={(e) => handleChecklistChange('delivered', e.target.checked)}
                        disabled={updatingChecklist}
                        className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                          Delivered
                        </div>
                        {project.delivered && (
                          <div className="text-sm text-green-700 mt-1">
                            {project.deliveryMethod?.charAt(0).toUpperCase() + (project.deliveryMethod?.slice(1) || '')} • {formatDate(project.deliveryDate)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </>
              )}

              {/* CHARITABLE PROJECT CHECKLIST */}
              {effectiveProjectType === 'charitable' && (
                <>
                  {/* Donation Invoice */}
                  <div className="border border-line rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={project.invoiced || false}
                        onChange={(e) => handleChecklistChange('invoiced', e.target.checked)}
                        disabled={updatingChecklist}
                        className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                          Donation Receipt Generated
                        </div>
                        {project.invoiced && (
                          <div className="text-sm text-green-700 mt-1">
                            {formatDate(project.invoicedDate)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Delivered */}
                  <div className="border border-line rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={project.delivered || false}
                        onChange={(e) => handleChecklistChange('delivered', e.target.checked)}
                        disabled={updatingChecklist}
                        className="mt-1 w-5 h-5 text-plum border-gray-300 rounded focus:ring-plum focus:ring-2 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-plum transition-colors">
                          Delivered
                        </div>
                        {project.delivered && (
                          <div className="text-sm text-green-700 mt-1">
                            {formatDate(project.deliveryDate)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Photos Section */}
        {organizationId && (
          <div className="bg-white border border-line rounded-xl p-6 no-print print:hidden print:!hidden">
            <h2 className="font-bold text-plum mb-4">
              Photos {photoCount > 0 && <span className="text-sm font-normal text-muted">({photoCount})</span>}
            </h2>

            {/* Photo Gallery */}
            <PhotoGallery
              key={photoGalleryKey}
              projectId={projectId}
              organizationId={organizationId}
              onPhotoCountChange={setPhotoCount}
              editable={project.stage !== 'Archived'}
            />

            {/* Photo Upload (hidden for archived projects) */}
            {project.stage !== 'Archived' && (
              <div className={photoCount > 0 ? "mt-4" : ""}>
                <PhotoUpload
                  projectId={projectId}
                  organizationId={organizationId}
                  existingPhotoCount={photoCount}
                  onUploadComplete={() => setPhotoGalleryKey((k) => k + 1)}
                />
              </div>
            )}
          </div>
        )}

        {/* Stage Actions - completely hidden when printing */}
        <div className="bg-white border border-line rounded-xl p-6 no-print print:hidden print:!hidden">
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
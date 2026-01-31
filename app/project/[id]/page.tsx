"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import { storage } from "../../lib/storage";
import { generateId } from "../../lib/utils";
import { STAGES } from "../../types";
import type { Project, Stage, Note } from "../../types";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositPaidDate, setDepositPaidDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [depositPaidMethod, setDepositPaidMethod] = useState("Cash");
  const [depositPaidAmount, setDepositPaidAmount] = useState("");

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = () => {
    const proj = storage.getProjectById(decodeURIComponent(projectId));
    setProject(proj || null);
    if (proj?.depositAmount) {
      setDepositPaidAmount(proj.depositAmount.toFixed(2));
    }
  };

  const moveToStage = (newStage: Stage) => {
    if (!project) return;

    if (project.stage === "Estimate" && newStage === "In Progress") {
      if (
        project.depositAmount &&
        project.depositAmount > 0 &&
        !project.depositPaid
      ) {
        setShowDepositModal(true);
        return;
      }
    }

    storage.updateProject(project.id, { stage: newStage });
    loadProject();
  };

  const handleRecordDeposit = () => {
    if (!project) return;

    const amount = parseFloat(depositPaidAmount) || 0;

    storage.updateProject(project.id, {
      stage: "In Progress",
      depositPaid: true,
      depositPaidDate,
      depositPaidMethod,
      depositPaidAmount: amount,
    });

    setShowDepositModal(false);
    loadProject();
  };

  const handleSkipDeposit = () => {
    if (!project) return;

    if (
      !confirm(
        "Skip recording the deposit? You can record it later from this page."
      )
    ) {
      return;
    }

    storage.updateProject(project.id, { stage: "In Progress" });
    setShowDepositModal(false);
    loadProject();
  };

  const archiveProject = () => {
    if (!project) return;
    if (confirm("Archive this project? It will move to the Archive.")) {
      storage.updateProject(project.id, { stage: "Archived" });
      router.push("/archive");
    }
  };

  const getNextStage = (): Stage | null => {
    if (!project) return null;
    const currentIndex = STAGES.indexOf(project.stage);
    if (currentIndex === -1 || currentIndex === STAGES.length - 1) return null;
    return STAGES[currentIndex + 1];
  };

  const getPreviousStage = (): Stage | null => {
    if (!project) return null;
    const currentIndex = STAGES.indexOf(project.stage);
    if (currentIndex <= 0) return null;
    return STAGES[currentIndex - 1];
  };

  const deleteProject = () => {
    if (!project) return;
    if (
      confirm(
        `Delete project for ${project.clientFirstName} ${project.clientLastName}?`
      )
    ) {
      storage.deleteProject(project.id);
      router.push("/board");
    }
  };

  const addNote = () => {
    if (!project || !newNoteText.trim()) return;

    const newNote: Note = {
      id: generateId(),
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...(project.notes || []), newNote];
    storage.updateProject(project.id, { notes: updatedNotes });
    setNewNoteText("");
    loadProject();
  };

  const deleteNote = (noteId: string) => {
    if (!project) return;
    if (!confirm("Delete this note?")) return;

    const updatedNotes = (project.notes || []).filter((n) => n.id !== noteId);
    storage.updateProject(project.id, { notes: updatedNotes });
    loadProject();
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-muted">Project not found</p>
          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/board")}
              className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
            >
              Back to Board
            </button>
          </div>
        </main>
      </div>
    );
  }

  const nextStage = getNextStage();
  const prevStage = getPreviousStage();
  const isLastStage = project.stage === "Paid/Shipped";
  const notes = project.notes || [];
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalAmount = project.estimateData?.total || 0;
  const depositPaidAmt = project.depositPaid
    ? project.depositPaidAmount || project.depositAmount || 0
    : 0;
  const balanceRemaining = totalAmount - depositPaidAmt;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-plum">
                {project.clientFirstName} {project.clientLastName}
              </h2>
              {project.estimateNumber && (
                <span className="px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold font-bold text-sm">
                  #{project.estimateNumber}
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-1">
              Intake: {project.intakeDate}
            </p>
          </div>
          <button
            onClick={() => router.push("/board")}
            className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
          >
            Back to Board
          </button>
        </div>

        <div className="bg-white border border-line rounded-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted">Stage:</span>
              <span className="px-4 py-2 bg-plum/10 border border-plum/20 rounded-xl font-bold text-plum">
                {project.stage}
              </span>
            </div>
            <div className="flex gap-2">
              {prevStage && (
                <button
                  onClick={() => moveToStage(prevStage)}
                  className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50 text-sm"
                >
                  ← {prevStage}
                </button>
              )}
              {isLastStage ? (
                <button
                  onClick={archiveProject}
                  className="px-4 py-2 bg-plum text-white rounded-xl hover:bg-plum/90 text-sm"
                >
                  Archive →
                </button>
              ) : (
                nextStage && (
                  <button
                    onClick={() => moveToStage(nextStage)}
                    className="px-4 py-2 bg-plum text-white rounded-xl hover:bg-plum/90 text-sm"
                  >
                    {nextStage} →
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-plum mb-3">Client Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted">Name:</span>{" "}
                  <span className="font-medium">
                    {project.clientFirstName} {project.clientLastName}
                  </span>
                </div>
                {project.clientEmail && (
                  <div>
                    <span className="text-muted">Email:</span>{" "}
                    <span className="font-medium">{project.clientEmail}</span>
                  </div>
                )}
                {project.clientPhone && (
                  <div>
                    <span className="text-muted">Phone:</span>{" "}
                    <span className="font-medium">{project.clientPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-plum mb-3">Project Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted">Intake Date:</span>{" "}
                  <span className="font-medium">{project.intakeDate}</span>
                </div>
                <div>
                  <span className="text-muted">Completion Date:</span>{" "}
                  <span className="font-medium">
                    {project.requestedDateType === "asap" && "ASAP"}
                    {project.requestedDateType === "no_date" && "TBD"}
                    {project.requestedDateType === "specific_date" &&
                      project.requestedCompletionDate}
                  </span>
                </div>
                {project.quiltWidth && project.quiltLength && (
                  <div>
                    <span className="text-muted">Quilt Size:</span>{" "}
                    <span className="font-medium">
                      {project.quiltWidth} × {project.quiltLength} inches
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {project.description && (
            <div className="mt-6">
              <h3 className="font-bold text-plum mb-2">Description</h3>
              <p className="text-sm">{project.description}</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-line rounded-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-plum">Estimate</h3>
              {project.estimateNumber && (
                <span className="text-sm text-gold font-bold">
                  #{project.estimateNumber}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {project.estimateData && (
                <button
                  onClick={() =>
                    router.push(`/invoice/${encodeURIComponent(project.id)}`)
                  }
                  className="px-4 py-2 bg-plum text-white rounded-xl hover:bg-plum/90 text-sm"
                >
                  View Invoice
                </button>
              )}
              <button
                onClick={() =>
                  router.push(
                    `/calculator?projectId=${encodeURIComponent(project.id)}`
                  )
                }
                className="px-4 py-2 bg-gold text-white rounded-xl hover:bg-gold/90 text-sm"
              >
                {project.estimateData ? "Edit Estimate" : "+ Create Estimate"}
              </button>
            </div>
          </div>

          {!project.estimateData ? (
            <p className="text-sm text-muted">No estimate created yet</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-3 border-b border-line">
                <span className="text-muted">
                  Quilting ({project.estimateData.quiltArea.toFixed(0)} sq in ×
                  ${project.estimateData.quiltingRate})
                </span>
                <span className="font-medium">
                  ${project.estimateData.quiltingTotal.toFixed(2)}
                </span>
              </div>

              {project.estimateData.threadCost > 0 && (
                <div className="flex justify-between pb-3 border-b border-line">
                  <span className="text-muted">Thread</span>
                  <span className="font-medium">
                    ${project.estimateData.threadCost.toFixed(2)}
                  </span>
                </div>
              )}

              {project.estimateData.battingTotal > 0 && (
                <div className="flex justify-between pb-3 border-b border-line">
                  <span className="text-muted">
                    Batting (
                    {project.estimateData.battingLengthNeeded.toFixed(0)}")
                  </span>
                  <span className="font-medium">
                    ${project.estimateData.battingTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {project.estimateData.clientSuppliesBatting && (
                <div className="flex justify-between pb-3 border-b border-line">
                  <span className="text-muted">Batting (Client Supplied)</span>
                  <span className="font-medium">$0.00</span>
                </div>
              )}

              {project.estimateData.bindingTotal > 0 && (
                <div className="flex justify-between pb-3 border-b border-line">
                  <span className="text-muted">
                    Binding ({project.estimateData.bindingPerimeter.toFixed(0)}"
                    × ${project.estimateData.bindingRatePerInch})
                  </span>
                  <span className="font-medium">
                    ${project.estimateData.bindingTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {project.estimateData.bobbinTotal &&
                project.estimateData.bobbinTotal > 0 && (
                  <div className="flex justify-between pb-3 border-b border-line">
                    <span className="text-muted">
                      Bobbins ({project.estimateData.bobbinCount} × $
                      {project.estimateData.bobbinPrice})
                    </span>
                    <span className="font-medium">
                      ${project.estimateData.bobbinTotal.toFixed(2)}
                    </span>
                  </div>
                )}

              {project.estimateData.taxAmount > 0 && (
                <div className="flex justify-between pb-3 border-b border-line">
                  <span className="text-muted">
                    Tax ({project.estimateData.taxRate}%)
                  </span>
                  <span className="font-medium">
                    ${project.estimateData.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 text-lg font-bold">
                <span className="text-plum">Total</span>
                <span className="text-plum">
                  ${project.estimateData.total.toFixed(2)}
                </span>
              </div>

              <div className="text-xs text-muted pt-2">
                Created: {formatDateTime(project.estimateData.createdAt)}
              </div>
            </div>
          )}
        </div>

        {(project.depositAmount && project.depositAmount > 0) ||
        project.depositPaid ? (
          <div className="bg-white border border-line rounded-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-plum">Deposit</h3>
              {!project.depositPaid &&
                project.depositAmount &&
                project.depositAmount > 0 && (
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="px-4 py-2 bg-gold text-white rounded-xl hover:bg-gold/90 text-sm"
                  >
                    Record Payment
                  </button>
                )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Deposit Amount:</span>
                <span className="font-bold text-gold">
                  {formatCurrency(project.depositAmount || 0)}
                  {project.depositType === "percent" &&
                    project.depositPercent && (
                      <span className="text-muted font-normal ml-1">
                        ({project.depositPercent}%)
                      </span>
                    )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted">Status:</span>
                {project.depositPaid ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    PAID
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                    PENDING
                  </span>
                )}
              </div>

              {project.depositPaid && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted">Paid Date:</span>
                    <span className="font-medium">
                      {project.depositPaidDate
                        ? formatDate(project.depositPaidDate)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Payment Method:</span>
                    <span className="font-medium">
                      {project.depositPaidMethod || "—"}
                    </span>
                  </div>
                  {project.depositPaidAmount !== project.depositAmount && (
                    <div className="flex justify-between">
                      <span className="text-muted">Amount Paid:</span>
                      <span className="font-medium">
                        {formatCurrency(project.depositPaidAmount || 0)}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="border-t border-line pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-plum">Balance Remaining:</span>
                  <span className="text-plum">
                    {formatCurrency(balanceRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-white border border-line rounded-card p-6 mb-6">
          <h3 className="font-bold text-plum mb-4">Notes</h3>

          <div className="mb-4">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-4 py-2 border border-line rounded-xl resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={addNote}
                disabled={!newNoteText.trim()}
                className="px-4 py-2 bg-plum text-white rounded-xl hover:bg-plum/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sortedNotes.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                No notes yet
              </p>
            ) : (
              sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border border-line rounded-xl bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted mb-2">
                        {formatDateTime(note.createdAt)}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {note.text}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                      title="Delete note"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={deleteProject}
            className="px-6 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
          >
            Delete Project
          </button>
        </div>
      </main>

      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-plum mb-4">
              Record Deposit Payment
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-gold/10 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Expected Deposit:</span>
                  <span className="font-bold text-gold">
                    {formatCurrency(project.depositAmount || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Amount Received
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={depositPaidAmount}
                    onChange={(e) => setDepositPaidAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={depositPaidDate}
                  onChange={(e) => setDepositPaidDate(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Payment Method
                </label>
                <select
                  value={depositPaidMethod}
                  onChange={(e) => setDepositPaidMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
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
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRecordDeposit}
                className="flex-1 px-4 py-2 bg-plum text-white rounded-xl font-bold hover:bg-plum/90"
              >
                Record & Move to In Progress
              </button>
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={handleSkipDeposit}
                className="flex-1 px-4 py-2 border border-line rounded-xl text-sm hover:bg-gray-50"
              >
                Skip for Now
              </button>
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 px-4 py-2 border border-line rounded-xl text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = () => {
    const proj = storage.getProjectById(decodeURIComponent(projectId));
    setProject(proj || null);
  };

  const moveToStage = (newStage: Stage) => {
    if (!project) return;
    storage.updateProject(project.id, { stage: newStage });
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-plum">
              {project.clientFirstName} {project.clientLastName}
            </h2>
            <p className="text-sm text-muted">
              Project #{project.id.split("—")[1]?.trim()}
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

        {/* Estimate Section */}
        <div className="bg-white border border-line rounded-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-plum">Estimate</h3>
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

        {/* Notes Section */}
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
    </div>
  );
}

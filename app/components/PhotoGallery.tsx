/**
 * PhotoGallery Component
 *
 * Displays, manages, and provides full-size viewing for project photos.
 * Loads images from Supabase Storage via signed URLs and metadata from
 * the project_photos table.
 *
 * Features: grid view, full-size modal with prev/next, caption editing,
 * photo type changing, delete with confirmation, type filtering.
 *
 * @module components/PhotoGallery
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { PhotoType } from "./PhotoUpload";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET = "project-photos";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PhotoGalleryProps {
  projectId: string;
  organizationId: string;
  onPhotoCountChange?: (count: number) => void;
  editable?: boolean;
}

interface PhotoRecord {
  id: string;
  project_id: string;
  organization_id: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  photo_type: PhotoType | null;
  caption: string | null;
  display_order: number;
  uploaded_at: string;
  updated_at: string;
}

interface PhotoWithUrl extends PhotoRecord {
  signedUrl: string | null;
}

type FilterType = "all" | PhotoType;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_LABELS: Record<string, string> = {
  intake: "Intake",
  progress: "Progress",
  completed: "Completed",
};

const TYPE_COLORS: Record<string, string> = {
  intake: "bg-blue-100 text-blue-700",
  progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PhotoGallery({
  projectId,
  organizationId,
  onPhotoCountChange,
  editable = true,
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal state
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  // Lock body scroll when full-screen viewer is open
  useEffect(() => {
    if (viewingIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [viewingIndex]);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editPhotoType, setEditPhotoType] = useState<PhotoType>("progress");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Track failed image loads
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Refs for touch/swipe
  const touchStartX = useRef(0);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ───────────────────────────────────────────────────────────────────────────
  // Data loading
  // ───────────────────────────────────────────────────────────────────────────

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch metadata
      const { data, error } = await supabase
        .from("project_photos")
        .select("*")
        .eq("project_id", projectId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        setPhotos([]);
        onPhotoCountChange?.(0);
        setLoading(false);
        return;
      }

      // Batch-fetch signed URLs
      const paths = data.map((p: PhotoRecord) => p.storage_path);
      const { data: urlData, error: urlError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(paths, SIGNED_URL_EXPIRY);

      const urlMap = new Map<string, string>();
      if (!urlError && urlData) {
        urlData.forEach((item) => {
          if (item.signedUrl && item.path) {
            urlMap.set(item.path, item.signedUrl);
          }
        });
      }

      const photosWithUrls: PhotoWithUrl[] = data.map((p: PhotoRecord) => ({
        ...p,
        signedUrl: urlMap.get(p.storage_path) || null,
      }));

      setPhotos(photosWithUrls);
      onPhotoCountChange?.(photosWithUrls.length);
    } catch (err) {
      console.error("Error loading photos:", err);
      setToast({ message: "Failed to load photos.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [projectId, onPhotoCountChange]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // ───────────────────────────────────────────────────────────────────────────
  // Filtered photos
  // ───────────────────────────────────────────────────────────────────────────

  const filteredPhotos =
    filter === "all"
      ? photos
      : photos.filter((p) => p.photo_type === filter);

  // ───────────────────────────────────────────────────────────────────────────
  // Full-size viewer
  // ───────────────────────────────────────────────────────────────────────────

  const viewingPhoto =
    viewingIndex !== null ? filteredPhotos[viewingIndex] : null;

  const openViewer = (index: number) => setViewingIndex(index);

  const closeViewer = () => setViewingIndex(null);

  const showPrev = () => {
    if (viewingIndex === null) return;
    setViewingIndex(
      viewingIndex > 0 ? viewingIndex - 1 : filteredPhotos.length - 1
    );
  };

  const showNext = () => {
    if (viewingIndex === null) return;
    setViewingIndex(
      viewingIndex < filteredPhotos.length - 1 ? viewingIndex + 1 : 0
    );
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (viewingIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingIndex, filteredPhotos.length]);

  // Touch/swipe for modal
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showNext();
      else showPrev();
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Edit caption & type
  // ───────────────────────────────────────────────────────────────────────────

  const startEditing = (photo: PhotoWithUrl) => {
    setEditingId(photo.id);
    setEditCaption(photo.caption || "");
    setEditPhotoType(photo.photo_type || "progress");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCaption("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("project_photos")
        .update({
          caption: editCaption.trim() || null,
          photo_type: editPhotoType,
        })
        .eq("id", editingId);

      if (error) throw error;

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, caption: editCaption.trim() || null, photo_type: editPhotoType }
            : p
        )
      );
      setEditingId(null);
      setToast({ message: "Photo updated.", type: "success" });
    } catch (err) {
      console.error("Error updating photo:", err);
      setToast({ message: "Failed to update photo.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Delete photo
  // ───────────────────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deletingId) return;
    const photo = photos.find((p) => p.id === deletingId);
    if (!photo) return;

    setDeleting(true);
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([photo.storage_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Continue to delete DB record even if storage fails
        // (file may already be missing)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("project_photos")
        .delete()
        .eq("id", deletingId);

      if (dbError) throw dbError;

      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== deletingId);
        onPhotoCountChange?.(updated.length);
        return updated;
      });
      setDeletingId(null);
      setToast({ message: "Photo deleted.", type: "success" });
    } catch (err) {
      console.error("Error deleting photo:", err);
      setToast({ message: "Failed to delete photo.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Loading state
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum mr-3" />
        <span className="text-muted">Loading photos...</span>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Empty state
  // ───────────────────────────────────────────────────────────────────────────

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 text-muted mb-3">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-bold text-muted">No photos yet</p>
        <p className="text-xs text-muted mt-1">
          Upload photos to track this project visually.
        </p>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Filter tabs + count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {(["all", "intake", "progress", "completed"] as FilterType[]).map(
            (type) => {
              const count =
                type === "all"
                  ? photos.length
                  : photos.filter((p) => p.photo_type === type).length;
              if (type !== "all" && count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    filter === type
                      ? "bg-plum text-white"
                      : "bg-white border border-line text-muted hover:bg-plum/5"
                  }`}
                >
                  {type === "all" ? "All" : TYPE_LABELS[type]} ({count})
                </button>
              );
            }
          )}
        </div>
        <span className="text-xs text-muted">
          {photos.length} photo{photos.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Photo grid */}
      {filteredPhotos.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          No {filter} photos found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group border border-line rounded-xl overflow-hidden bg-white"
            >
              {/* Thumbnail — click to view full size */}
              <button
                onClick={() => openViewer(index)}
                className="block w-full aspect-square bg-gray-100 overflow-hidden"
              >
                {photo.signedUrl && !failedImages.has(photo.id) ? (
                  <img
                    src={photo.signedUrl}
                    alt={photo.caption || photo.file_name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={() => setFailedImages((prev) => new Set(prev).add(photo.id))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <span className="text-xs text-center px-2">Image unavailable</span>
                  </div>
                )}
              </button>

              {/* Type badge */}
              {photo.photo_type && (
                <span
                  className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    TYPE_COLORS[photo.photo_type] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {TYPE_LABELS[photo.photo_type] || photo.photo_type}
                </span>
              )}

              {/* Info bar */}
              <div className="px-2 py-1.5 border-t border-line">
                {editingId === photo.id ? (
                  /* ── Editing mode ── */
                  <div
                    className="space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Add caption..."
                      className="w-full px-2 py-1 text-xs border border-line rounded-lg"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEditing();
                      }}
                    />
                    <select
                      value={editPhotoType}
                      onChange={(e) =>
                        setEditPhotoType(e.target.value as PhotoType)
                      }
                      className="w-full px-2 py-1 text-xs border border-line rounded-lg"
                    >
                      <option value="intake">Intake</option>
                      <option value="progress">Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex-1 px-2 py-1 bg-plum text-white rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {saving ? "..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 px-2 py-1 border border-line rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Display mode ── */
                  <>
                    <p className="text-xs text-muted truncate">
                      {photo.caption || photo.file_name}
                    </p>
                    <p className="text-[10px] text-muted">
                      {formatDate(photo.uploaded_at)}
                      {photo.file_size ? ` · ${formatFileSize(photo.file_size)}` : ""}
                    </p>
                  </>
                )}
              </div>

              {/* Hover action buttons */}
              {editable && editingId !== photo.id && (
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Edit */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(photo);
                    }}
                    className="w-7 h-7 bg-white/90 border border-line rounded-full flex items-center justify-center hover:bg-white"
                    title="Edit caption"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-plum"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(photo.id);
                    }}
                    className="w-7 h-7 bg-white/90 border border-red-200 rounded-full flex items-center justify-center hover:bg-red-50"
                    title="Delete photo"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Full-Size Viewer Modal
          ───────────────────────────────────────────────────────────────────── */}
      {viewingPhoto && viewingIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={closeViewer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 text-white">
            <div className="text-sm">
              <span className="font-bold">
                {viewingIndex + 1} / {filteredPhotos.length}
              </span>
              {viewingPhoto.photo_type && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    TYPE_COLORS[viewingPhoto.photo_type] || ""
                  }`}
                >
                  {TYPE_LABELS[viewingPhoto.photo_type]}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeViewer();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              title="Close (ESC)"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Image area */}
          <div
            className="flex-1 flex items-center justify-center px-4 relative min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev button */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-2 sm:left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
                title="Previous"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Full-size image */}
            {viewingPhoto.signedUrl ? (
              <img
                src={viewingPhoto.signedUrl}
                alt={viewingPhoto.caption || viewingPhoto.file_name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-white text-center">
                <p className="font-bold">Image unavailable</p>
                <p className="text-sm text-white/60 mt-1">
                  The signed URL may have expired. Close and reopen the gallery.
                </p>
              </div>
            )}

            {/* Next button */}
            {filteredPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 sm:right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
                title="Next"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom info bar */}
          <div className="p-4 text-center text-white">
            {viewingPhoto.caption && (
              <p className="font-medium mb-1">{viewingPhoto.caption}</p>
            )}
            <p className="text-xs text-white/60">
              {viewingPhoto.file_name}
              {" · "}
              {formatDate(viewingPhoto.uploaded_at)}
              {viewingPhoto.file_size
                ? ` · ${formatFileSize(viewingPhoto.file_size)}`
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Delete Confirmation Dialog
          ───────────────────────────────────────────────────────────────────── */}
      {deletingId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !deleting && setDeletingId(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-plum mb-2">Delete Photo?</h3>
            <p className="text-sm text-muted mb-4">
              This will permanently remove the photo from storage. This cannot
              be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-line rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Toast notification
          ───────────────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-3 max-w-md ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {toast.type === "success" ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            )}
          </svg>
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-80 flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

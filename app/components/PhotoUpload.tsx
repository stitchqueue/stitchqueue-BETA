/**
 * PhotoUpload Component
 *
 * Drag-and-drop photo upload with preview, validation, and progress tracking.
 * Uploads files to Supabase Storage and creates metadata records in project_photos.
 *
 * Storage path: project-photos/{projectId}/{timestamp}_{sanitized_filename}
 *
 * @module components/PhotoUpload
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET = "project-photos";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic"];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PhotoType = "intake" | "progress" | "completed";

export interface PhotoUploadProps {
  projectId: string;
  organizationId: string;
  photoType?: PhotoType;
  onUploadComplete?: () => void;
  maxPhotos?: number;
  existingPhotoCount?: number;
}

interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Sanitize a filename: lowercase, replace spaces/special chars with hyphens */
function sanitizeFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "jpg";
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base}.${ext}`;
}

/** Build the storage path for a file */
function buildStoragePath(projectId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(filename);
  return `${projectId}/${timestamp}_${sanitized}`;
}

/** Format bytes as human-readable string */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validate a single file, return error string or null */
function validateFile(file: File): string | null {
  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    // Fallback: check extension for HEIC (some browsers report wrong MIME)
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return "Only JPG, PNG, WebP, and HEIC files are allowed.";
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File exceeds 10 MB limit (${formatFileSize(file.size)}).`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PhotoUpload({
  projectId,
  organizationId,
  photoType = "progress",
  onUploadComplete,
  maxPhotos = 10,
  existingPhotoCount = 0,
}: PhotoUploadProps) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ───────────────────────────────────────────────────────────────────────────
  // File selection
  // ───────────────────────────────────────────────────────────────────────────

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles: SelectedFile[] = [];
      const errors: string[] = [];
      const currentTotal = existingPhotoCount + files.length;

      for (const file of Array.from(incoming)) {
        // Check max photos limit
        if (currentTotal + newFiles.length >= maxPhotos) {
          errors.push(
            `Maximum ${maxPhotos} photos per project. ${maxPhotos - currentTotal} slot(s) remaining.`
          );
          break;
        }

        // Skip duplicates (same name + size)
        if (
          files.some(
            (f) => f.file.name === file.name && f.file.size === file.size
          )
        ) {
          continue;
        }

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          continue;
        }

        newFiles.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (errors.length > 0) {
        setToast({ message: errors[0], type: "error" });
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [files, existingPhotoCount, maxPhotos]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Drag and drop handlers
  // ───────────────────────────────────────────────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // File input handler
  // ───────────────────────────────────────────────────────────────────────────

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [addFiles]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Remove a file from the list
  // ───────────────────────────────────────────────────────────────────────────

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Upload all pending files
  // ───────────────────────────────────────────────────────────────────────────

  const uploadAll = useCallback(async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    // Get current max display_order for this project
    const { data: existingPhotos } = await supabase
      .from("project_photos")
      .select("display_order")
      .eq("project_id", projectId)
      .order("display_order", { ascending: false })
      .limit(1);

    let nextOrder =
      existingPhotos && existingPhotos.length > 0
        ? existingPhotos[0].display_order + 1
        : 0;

    for (const selectedFile of pending) {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFile.id ? { ...f, status: "uploading" } : f
        )
      );

      try {
        const storagePath = buildStoragePath(projectId, selectedFile.file.name);

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, selectedFile.file, {
            contentType: selectedFile.file.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Create metadata record in project_photos table
        const { error: dbError } = await supabase
          .from("project_photos")
          .insert({
            project_id: projectId,
            organization_id: organizationId,
            storage_path: storagePath,
            file_name: selectedFile.file.name,
            file_size: selectedFile.file.size,
            mime_type: selectedFile.file.type || "image/jpeg",
            uploaded_by: "quilter",
            photo_type: photoType,
            display_order: nextOrder,
          });

        if (dbError) {
          // Clean up uploaded file if DB insert fails
          await supabase.storage.from(BUCKET).remove([storagePath]);
          throw new Error(dbError.message);
        }

        nextOrder++;
        successCount++;

        // Mark as done
        setFiles((prev) =>
          prev.map((f) =>
            f.id === selectedFile.id ? { ...f, status: "done" } : f
          )
        );
      } catch (err) {
        errorCount++;
        const message =
          err instanceof Error ? err.message : "Upload failed. Please try again.";

        setFiles((prev) =>
          prev.map((f) =>
            f.id === selectedFile.id
              ? { ...f, status: "error", error: message }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      setToast({
        message: `${successCount} photo${successCount === 1 ? "" : "s"} uploaded successfully.`,
        type: "success",
      });

      // Remove successful files after a brief delay so user sees the green checkmarks
      setTimeout(() => {
        setFiles((prev) => {
          prev
            .filter((f) => f.status === "done")
            .forEach((f) => URL.revokeObjectURL(f.previewUrl));
          return prev.filter((f) => f.status !== "done");
        });
      }, 1500);

      onUploadComplete?.();
    }

    if (errorCount > 0 && successCount === 0) {
      setToast({
        message: `Upload failed. Please try again.`,
        type: "error",
      });
    }
  }, [files, projectId, organizationId, photoType, onUploadComplete]);

  // ───────────────────────────────────────────────────────────────────────────
  // Retry a failed file
  // ───────────────────────────────────────────────────────────────────────────

  const retryFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "pending", error: undefined } : f
      )
    );
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Computed values
  // ───────────────────────────────────────────────────────────────────────────

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const slotsRemaining = maxPhotos - existingPhotoCount - files.length;

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-plum bg-plum/5"
            : "border-line hover:border-plum/50 hover:bg-plum/5"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp,.heic"
          capture="environment"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Icon */}
        <div className="mx-auto w-12 h-12 mb-3 text-muted">
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

        <p className="text-sm font-bold text-plum mb-1">
          {isDragging ? "Drop photos here" : "Drag photos here or tap to browse"}
        </p>
        <p className="text-xs text-muted">
          JPG, PNG, WebP, or HEIC — Max 10 MB each
        </p>
        {slotsRemaining < maxPhotos && (
          <p className="text-xs text-muted mt-1">
            {slotsRemaining > 0
              ? `${slotsRemaining} photo slot${slotsRemaining === 1 ? "" : "s"} remaining`
              : "Photo limit reached"}
          </p>
        )}
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-plum">
              Selected Photos ({files.length})
            </h4>
            {pendingCount > 0 && !isUploading && (
              <button
                onClick={uploadAll}
                className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold hover:bg-plum/90 transition-colors"
              >
                Upload {pendingCount} Photo{pendingCount === 1 ? "" : "s"}
              </button>
            )}
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-plum" />
                Uploading...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((selectedFile) => (
              <div
                key={selectedFile.id}
                className="relative group border border-line rounded-xl overflow-hidden bg-white"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={selectedFile.previewUrl}
                    alt={selectedFile.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Status overlay */}
                {selectedFile.status === "uploading" && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum" />
                  </div>
                )}
                {selectedFile.status === "done" && (
                  <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                {selectedFile.status === "error" && (
                  <div className="absolute inset-0 bg-red-600/20 flex flex-col items-center justify-center p-2">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mb-1">
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
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        retryFile(selectedFile.id);
                      }}
                      className="text-xs text-red-700 font-bold underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* File info bar */}
                <div className="px-2 py-1.5 border-t border-line">
                  <p className="text-xs text-muted truncate">
                    {selectedFile.file.name}
                  </p>
                  <p className="text-xs text-muted">
                    {formatFileSize(selectedFile.file.size)}
                  </p>
                </div>

                {/* Remove button (hidden during upload/done) */}
                {(selectedFile.status === "pending" ||
                  selectedFile.status === "error") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(selectedFile.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                    title="Remove"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Error details */}
          {files.some((f) => f.status === "error") && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-bold text-red-700 mb-1">
                Some uploads failed:
              </p>
              {files
                .filter((f) => f.status === "error")
                .map((f) => (
                  <p key={f.id} className="text-xs text-red-600">
                    {f.file.name}: {f.error}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-3 max-w-md transition-opacity ${
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

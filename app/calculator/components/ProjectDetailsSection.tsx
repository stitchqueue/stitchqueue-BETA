/**
 * ProjectDetailsSection Component
 * 
 * Collects quilt project details: description, due date, and dimensions.
 * Handles date type selection (ASAP, No Date, Specific Date).
 * 
 * @module calculator/components/ProjectDetailsSection
 */

"use client";

interface ProjectDetailsSectionProps {
  // Description
  description: string;
  setDescription: (value: string) => void;
  
  // Requested completion date
  requestedDateType: "asap" | "no_date" | "specific_date";
  setRequestedDateType: (value: "asap" | "no_date" | "specific_date") => void;
  requestedCompletionDate: string;
  setRequestedCompletionDate: (value: string) => void;
  
  // Dimensions
  quiltWidth: string;
  setQuiltWidth: (value: string) => void;
  quiltLength: string;
  setQuiltLength: (value: string) => void;
}

/**
 * Form section for quilt project details.
 * 
 * Features:
 * - Description field for quilt details
 * - Three date options: ASAP (high priority), No Set Date, Specific Date
 * - Width × Length dimension inputs with calculated area display
 */
export default function ProjectDetailsSection({
  description,
  setDescription,
  requestedDateType,
  setRequestedDateType,
  requestedCompletionDate,
  setRequestedCompletionDate,
  quiltWidth,
  setQuiltWidth,
  quiltLength,
  setQuiltLength,
}: ProjectDetailsSectionProps) {
  return (
    <>
      <h2 className="text-lg font-bold text-plum mb-4 pt-4 border-t border-line">
        Project Details
      </h2>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted mb-2">
          Quilt Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Queen wedding quilt, double ring pattern"
          className="w-full px-4 py-2 border border-line rounded-xl"
        />
      </div>

      {/* Requested Completion Date */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted mb-2">
          Requested Completion Date
        </label>
        
        {/* Date type buttons - stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <button
            type="button"
            onClick={() => setRequestedDateType("asap")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              requestedDateType === "asap"
                ? "bg-red-500 text-white"
                : "bg-white border border-line text-muted hover:border-red-300"
            }`}
          >
            ASAP
          </button>
          <button
            type="button"
            onClick={() => setRequestedDateType("no_date")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              requestedDateType === "no_date"
                ? "bg-gold text-white"
                : "bg-white border border-line text-muted hover:border-gold"
            }`}
          >
            No Set Date
          </button>
          <button
            type="button"
            onClick={() => setRequestedDateType("specific_date")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              requestedDateType === "specific_date"
                ? "bg-plum text-white"
                : "bg-white border border-line text-muted hover:border-plum"
            }`}
          >
            Select Date
          </button>
        </div>
        
        {/* Date picker for specific date */}
        {requestedDateType === "specific_date" && (
          <input
            type="date"
            value={requestedCompletionDate}
            onChange={(e) => setRequestedCompletionDate(e.target.value)}
            className="w-full px-4 py-2 border border-line rounded-xl"
          />
        )}
        
        {/* ASAP priority message */}
        {requestedDateType === "asap" && (
          <p className="text-xs text-red-600 mt-1">
            This project will be marked as high priority
          </p>
        )}
      </div>

      {/* Quilt Dimensions - stack on mobile, side-by-side on tablet+ */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted mb-2">
          Quilt Dimensions (inches) *
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            placeholder="Width"
            value={quiltWidth}
            onChange={(e) => setQuiltWidth(e.target.value)}
            className="flex-1 px-4 py-2 border border-line rounded-xl"
          />
          <span className="hidden sm:flex items-center text-muted font-bold">×</span>
          <div className="flex sm:hidden items-center justify-center text-muted font-bold text-xs">
            × (multiplied by)
          </div>
          <input
            type="number"
            placeholder="Length"
            value={quiltLength}
            onChange={(e) => setQuiltLength(e.target.value)}
            className="flex-1 px-4 py-2 border border-line rounded-xl"
          />
        </div>
        
        {/* Calculated area */}
        {quiltWidth && quiltLength && (
          <div className="mt-2 text-xs text-muted">
            Area:{" "}
            {(
              parseFloat(quiltWidth) * parseFloat(quiltLength)
            ).toLocaleString()}{" "}
            sq in
          </div>
        )}
      </div>
    </>
  );
}

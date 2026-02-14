"use client";

interface Props {
  consultationPlanning: string;
  onConsultationPlanningChange: (v: string) => void;
  threadingPrep: string;
  onThreadingPrepChange: (v: string) => void;
  loadingUnloading: string;
  onLoadingUnloadingChange: (v: string) => void;
  packaging: string;
  onPackagingChange: (v: string) => void;
  photos: string;
  onPhotosChange: (v: string) => void;
  billingAdmin: string;
  onBillingAdminChange: (v: string) => void;
  total: number;
}

const FIELDS: {
  key: string;
  label: string;
  placeholder: string;
}[] = [
  { key: "consultationPlanning", label: "Consultation & Planning", placeholder: "e.g. 15" },
  { key: "threadingPrep", label: "Threading & Prep", placeholder: "e.g. 10" },
  { key: "loadingUnloading", label: "Loading & Unloading", placeholder: "e.g. 10" },
  { key: "packaging", label: "Packaging", placeholder: "e.g. 5" },
  { key: "photos", label: "Photos", placeholder: "e.g. 5" },
  { key: "billingAdmin", label: "Billing & Admin", placeholder: "e.g. 10" },
];

export default function IncidentalsSection({
  consultationPlanning,
  onConsultationPlanningChange,
  threadingPrep,
  onThreadingPrepChange,
  loadingUnloading,
  onLoadingUnloadingChange,
  packaging,
  onPackagingChange,
  photos,
  onPhotosChange,
  billingAdmin,
  onBillingAdminChange,
  total,
}: Props) {
  const values: Record<string, string> = {
    consultationPlanning,
    threadingPrep,
    loadingUnloading,
    packaging,
    photos,
    billingAdmin,
  };
  const setters: Record<string, (v: string) => void> = {
    consultationPlanning: onConsultationPlanningChange,
    threadingPrep: onThreadingPrepChange,
    loadingUnloading: onLoadingUnloadingChange,
    packaging: onPackagingChange,
    photos: onPhotosChange,
    billingAdmin: onBillingAdminChange,
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-plum mb-4">
        Per-Project Incidentals (minutes)
      </h3>
      <p className="text-xs text-muted mb-4">
        Time spent on each project beyond actual quilting — these add up and
        affect your effective rate.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-bold text-muted mb-2">
              {field.label}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={values[field.key]}
              onChange={(e) => setters[field.key](e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>
        ))}
      </div>

      {/* Auto total */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-bold text-muted">Total Per Project:</span>
        <span className="text-lg font-bold text-plum">
          {total} minutes
        </span>
      </div>
    </div>
  );
}

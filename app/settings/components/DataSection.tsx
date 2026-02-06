/**
 * DataSection Component
 * 
 * Reports & Data management section.
 * Includes CSV export, reports placeholder, and danger zone.
 * 
 * @module settings/components/DataSection
 */

"use client";

import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";

interface DataSectionProps {
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
  onExportCSV: () => void;
  onClearAllData: () => void;
}

/**
 * Data management settings section.
 * 
 * Features:
 * - Export all projects to CSV
 * - Reports placeholder (coming soon)
 * - Danger zone: Clear all data
 */
export default function DataSection({
  isOpen,
  onToggle,
  onExportCSV,
  onClearAllData,
}: DataSectionProps) {
  return (
    <div>
      <AccordionHeader
        sectionKey="data"
        label="Reports & Data"
        icon="📊"
        subtitle="Export data and manage your account"
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        <div className="space-y-6">
          {/* Export Data */}
          <div className="p-4 border border-line rounded-xl">
            <h3 className="font-bold text-sm mb-2">Export Data</h3>
            <p className="text-xs text-muted mb-4">
              Export all your projects to a CSV file for backup or use in other
              software.
            </p>
            <button
              onClick={onExportCSV}
              className="px-4 py-2 bg-plum text-white rounded-xl font-bold"
            >
              Export to CSV
            </button>
          </div>

          {/* Reports Placeholder */}
          <div className="p-4 border border-line rounded-xl bg-background">
            <h3 className="font-bold text-sm mb-2 text-muted">Reports</h3>
            <p className="text-xs text-muted">
              Income reports, quilting totals, and batting usage tracking coming
              soon.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="p-4 border border-red-300 rounded-xl bg-red-50">
            <h3 className="font-bold text-sm text-red-600 mb-2">Danger Zone</h3>
            <p className="text-xs text-muted mb-4">
              Clear all data including projects, settings, and preferences. This
              cannot be undone!
            </p>
            <button
              onClick={onClearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </AccordionBody>
    </div>
  );
}

/**
 * Data Management Section Component
 * 
 * Provides data export and deletion functionality.
 * 
 * @module settings/components/reports/DataManagement
 */

"use client";

import { storage } from "../../../lib/storage";
import { exportAllProjectsCSV } from "./utils";

interface DataManagementProps {
  onClearData?: () => void;
}

/**
 * Data management controls (export, clear data)
 */
export default function DataManagement({
  onClearData,
}: DataManagementProps) {
  const handleExportAllCSV = async () => {
    const projects = await storage.getProjects();
    exportAllProjectsCSV(projects);
  };

  const handleClearAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to clear ALL data? This cannot be undone!"
      )
    )
      return;
    if (
      !confirm(
        "Really sure? All projects, settings, and data will be deleted!"
      )
    )
      return;

    try {
      const deleteResult = await storage.deleteAllProjects();
      if (!deleteResult.success) {
        alert("Error deleting projects: " + deleteResult.error);
        return;
      }

      localStorage.clear();
      alert("All data cleared! Reloading...");
      
      if (onClearData) {
        onClearData();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Error clearing data. Check console for details.");
    }
  };

  return (
    <div className="border-t border-line pt-6 space-y-4">
      <h3 className="font-bold text-plum">Data Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export All Data */}
        <div className="p-4 border border-line rounded-xl">
          <h4 className="font-bold text-sm mb-2">Export All Data</h4>
          <p className="text-xs text-muted mb-4">
            Export all projects to CSV for backup or external use.
          </p>
          <button
            onClick={handleExportAllCSV}
            className="px-4 py-2 bg-plum text-white rounded-xl font-bold text-sm hover:bg-plum/90 transition-colors"
          >
            Export Projects CSV
          </button>
        </div>

        {/* Danger Zone */}
        <div className="p-4 border border-red-300 rounded-xl bg-red-50">
          <h4 className="font-bold text-sm text-red-600 mb-2">Danger Zone</h4>
          <p className="text-xs text-muted mb-4">
            Clear all data including projects and settings. Cannot be undone!
          </p>
          <button
            onClick={handleClearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}

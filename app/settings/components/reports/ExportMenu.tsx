/**
 * Export Menu Component
 * 
 * Dropdown menu for exporting reports as CSV or PDF.
 * 
 * @module settings/components/reports/ExportMenu
 */

"use client";

import { useEffect, useRef } from "react";

interface ExportMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

/**
 * Export dropdown menu with CSV and PDF options
 */
export default function ExportMenu({
  isOpen,
  onToggle,
  onExportCSV,
  onExportPDF,
}: ExportMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="px-4 py-2 border border-plum text-plum rounded-xl text-sm font-bold hover:bg-plum hover:text-white transition-colors flex items-center gap-2"
      >
        Export
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-line rounded-xl shadow-lg z-10 overflow-hidden">
          <button
            onClick={onExportCSV}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <span>📄</span> Export CSV
          </button>
          <button
            onClick={onExportPDF}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-t border-line"
          >
            <span>📑</span> Export PDF
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Report Type Tabs Component
 * 
 * Tab navigation for switching between different report types.
 * 
 * @module settings/components/reports/ReportTypeTabs
 */

"use client";

export type ReportType = "revenue" | "payments" | "materials" | "clients" | "tax";

interface ReportTab {
  key: ReportType;
  label: string;
  icon: string;
}

interface ReportTypeTabsProps {
  selectedReport: ReportType;
  onSelectReport: (reportType: ReportType) => void;
}

const REPORT_TABS: ReportTab[] = [
  { key: "revenue", label: "Revenue", icon: "💰" },
  { key: "payments", label: "Payments", icon: "💵" },
  { key: "materials", label: "Materials", icon: "🧵" },
  { key: "clients", label: "Clients", icon: "👥" },
  { key: "tax", label: "Tax Summary", icon: "📋" },
];

/**
 * Report type selector tabs
 */
export default function ReportTypeTabs({
  selectedReport,
  onSelectReport,
}: ReportTypeTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {REPORT_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onSelectReport(tab.key)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            selectedReport === tab.key
              ? "bg-plum text-white"
              : "bg-background border border-line hover:bg-white"
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

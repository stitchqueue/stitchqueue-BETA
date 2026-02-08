/**
 * Date Range Selector Component
 * 
 * Controls for selecting date ranges (month, quarter, year, custom).
 * 
 * @module settings/components/reports/DateRangeSelector
 */

"use client";

import type { DateRangeType } from "./utils";

interface DateRangeSelectorProps {
  dateRange: DateRangeType;
  customStartDate: string;
  customEndDate: string;
  onSelectRange: (range: DateRangeType) => void;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
}

const DATE_RANGE_OPTIONS: Array<{ key: DateRangeType; label: string }> = [
  { key: "month", label: "This Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "year", label: "This Year" },
  { key: "custom", label: "Custom" },
];

/**
 * Date range selector with custom date inputs
 */
export default function DateRangeSelector({
  dateRange,
  customStartDate,
  customEndDate,
  onSelectRange,
  onCustomStartChange,
  onCustomEndChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted">Date Range:</span>
      <div className="flex flex-wrap gap-2">
        {DATE_RANGE_OPTIONS.map((range) => (
          <button
            key={range.key}
            onClick={() => onSelectRange(range.key)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              dateRange === range.key
                ? "bg-gold text-white"
                : "bg-background border border-line hover:bg-white"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {dateRange === "custom" && (
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg text-sm"
          />
          <span className="text-sm text-muted">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg text-sm"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Date Range Utilities
 * 
 * Helper functions for calculating and formatting date ranges
 * used across the reports system.
 * 
 * @module settings/components/reports/utils/dateHelpers
 */

export type DateRangeType = "month" | "quarter" | "year" | "custom";

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Calculate date range based on range type
 */
export function getDateRange(
  rangeType: DateRangeType,
  customStartDate?: string,
  customEndDate?: string
): DateRange {
  const now = new Date();
  let startDate: string;
  let endDate: string;

  switch (rangeType) {
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      break;

    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1)
        .toISOString()
        .split("T")[0];
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        .toISOString()
        .split("T")[0];
      break;

    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      endDate = new Date(now.getFullYear(), 11, 31)
        .toISOString()
        .split("T")[0];
      break;

    case "custom":
      startDate =
        customStartDate ||
        new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
      endDate = customEndDate || new Date().toISOString().split("T")[0];
      break;

    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      endDate = new Date().toISOString().split("T")[0];
  }

  return { startDate, endDate };
}

/**
 * Format date string for display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format Utilities
 * 
 * Helper functions for formatting currency, numbers, and other display values.
 * 
 * @module settings/components/reports/utils/formatters
 */

/**
 * Format number as currency
 */
export function formatCurrency(amount: number, currencyCode: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/**
 * Format date string for display
 */

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Safely get nested property value
 */
export function safeGet(obj: any, path: string, defaultValue: any = 0): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
}

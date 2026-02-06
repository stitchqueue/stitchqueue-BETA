/**
 * Formatting Utilities for Settings
 * 
 * @module settings/utils/formatters
 */

/**
 * Formats a phone number as XXX-XXX-XXXX
 * 
 * @param value - Raw input value (may contain non-digits)
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}

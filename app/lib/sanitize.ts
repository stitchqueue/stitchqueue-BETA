/**
 * HTML sanitization utilities for user input embedded in emails.
 *
 * EVERY user-supplied string that appears in an HTML email template
 * must pass through escapeHtml() before interpolation.
 *
 * @module lib/sanitize
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const ESCAPE_RE = /[&<>"']/g;

/**
 * Escape HTML special characters to prevent XSS in email templates.
 * Returns empty string for nullish input.
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return input.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch]);
}

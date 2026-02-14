// v4.0 Feature Flags — Phase 3: Deprecate Accounting Features
//
// StitchQueue is workflow management, NOT accounting software.
// QuickBooks/Xero handle taxes and detailed financials.
// These flags hide (not delete) accounting features while preserving
// the code for backward compatibility with v3.6.2 data.
//
// Set a flag to `true` to re-enable a deprecated feature.

import React from 'react';

// ---------------------------------------------------------------------------
// Flag Definitions
// ---------------------------------------------------------------------------

export const FEATURE_FLAGS = {
  // ENABLE_TAX_SYSTEM
  // Controls: Settings tax rate inputs (single + dual GST/PST),
  //   Calculator tax calculation display, Estimate tax line items,
  //   Invoice tax breakdown
  ENABLE_TAX_SYSTEM: false,

  // ENABLE_PAYMENT_METHODS
  // Controls: Payment method dropdowns (cash, check, credit, etc.),
  //   Complex payment history tracking, Multiple payment entries
  ENABLE_PAYMENT_METHODS: false,

  // ENABLE_FINANCIAL_REPORTS
  // Controls: Revenue reports, Cash flow reports, Payment reports,
  //   Accounts receivable aging, Tax liability reports
  ENABLE_FINANCIAL_REPORTS: false,

  // ENABLE_DETAILED_PAYMENTS
  // Controls: Detailed payment tracking beyond the simple
  //   deposit/paid checkboxes used in the v4.0 Stage 3 checklist
  ENABLE_DETAILED_PAYMENTS: false,
} as const;

// ---------------------------------------------------------------------------
// Types & Helpers
// ---------------------------------------------------------------------------

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/** Check whether a feature flag is enabled. */
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag];
};

// ---------------------------------------------------------------------------
// React Component for Conditional Rendering
// ---------------------------------------------------------------------------

/**
 * Renders children only when the given feature flag is enabled.
 *
 * Usage:
 *   <FeatureGate flag="ENABLE_TAX_SYSTEM">
 *     <TaxRateInputs />
 *   </FeatureGate>
 */
export const FeatureGate = ({
  flag,
  children,
}: {
  flag: FeatureFlag;
  children: React.ReactNode;
}): React.ReactElement | null => {
  if (!isFeatureEnabled(flag)) return null;
  return React.createElement(React.Fragment, null, children);
};

// ---------------------------------------------------------------------------
// Deprecation Comment Template
// ---------------------------------------------------------------------------
//
// When wrapping deprecated code, use this comment block:
//
// v4.0 DEPRECATED - Hidden by ENABLE_<FLAG_NAME> flag
// Kept for backward compatibility with v3.6.2 data
// Can be removed after full migration to v4.0+
//

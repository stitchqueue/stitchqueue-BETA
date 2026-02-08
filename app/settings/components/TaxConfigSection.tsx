/**
 * TaxConfigSection Component
 * 
 * Tax configuration UI supporting single-rate (US) and dual-rate (Canadian) tax systems.
 * Handles primary tax (GST/Sales Tax) and optional secondary tax (PST/Provincial Tax).
 * 
 * @module settings/components/TaxConfigSection
 */

"use client";

import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";
import type { Settings } from "../../types";


interface TaxConfigSectionProps {
  settings: Settings;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
  handleInputChange: (field: keyof Settings, value: string | number | boolean) => void;
}

/**
 * Tax configuration form section with support for single or dual tax rates.
 * 
 * Features:
 * - Primary tax (always visible) - for single-rate systems or GST
 * - Secondary tax (optional toggle) - for dual-rate systems like GST+PST
 * - Combined rate display when both enabled
 * - Example configurations for common scenarios
 * 
 * Common Configurations:
 * - US States: Primary only as "Sales Tax" (e.g., 7.5%)
 * - BC Canada: Primary 5% "GST" + Secondary 7% "PST"
 * - ON Canada: Primary 13% "HST", Secondary disabled
 * - AB Canada: Primary 5% "GST", Secondary disabled
 */
export default function TaxConfigSection({
  settings,
  isOpen,
  onToggle,
  handleInputChange,
}: TaxConfigSectionProps) {
  // Calculate combined rate for display
  const primaryRate = settings.taxPrimaryRate ?? 0;
  const secondaryRate = settings.taxSecondaryEnabled ? (settings.taxSecondaryRate ?? 0) : 0;
  const combinedRate = primaryRate + secondaryRate;
return (
    <>
      <AccordionHeader
        sectionKey="tax"
        label="Tax Configuration"
        icon="💰"
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        <div className="space-y-6">
        {/* Primary Tax Section */}
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <h4 className="text-sm font-bold text-plum mb-3">
            Primary Tax
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Primary Tax Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.taxPrimaryRate ?? 0}
                  onChange={(e) =>
                    handleInputChange("taxPrimaryRate", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border border-line rounded-xl pr-12"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                  %
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                Your default tax rate
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Primary Tax Label
              </label>
              <input
                type="text"
                value={settings.taxPrimaryLabel ?? "Sales Tax"}
                onChange={(e) =>
                  handleInputChange("taxPrimaryLabel", e.target.value)
                }
                className="w-full px-4 py-2 border border-line rounded-xl"
                placeholder="Sales Tax, GST, HST"
              />
              <p className="text-xs text-muted mt-1">
                Appears on estimates and invoices
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Tax Section */}
        <div className="p-4 bg-gold/10 rounded-xl border border-gold/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-plum">
              Secondary Tax (Optional)
            </h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.taxSecondaryEnabled ?? false}
                onChange={(e) =>
                  handleInputChange("taxSecondaryEnabled", e.target.checked)
                }
                className="w-5 h-5 rounded border-line accent-gold"
              />
              <span className="text-sm font-bold text-muted">Enable Secondary Tax</span>
            </label>
          </div>

          {settings.taxSecondaryEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Secondary Tax Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.taxSecondaryRate ?? 0}
                    onChange={(e) =>
                      handleInputChange("taxSecondaryRate", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl pr-12"
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Additional tax rate (e.g., PST)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Secondary Tax Label
                </label>
                <input
                  type="text"
                  value={settings.taxSecondaryLabel ?? "Provincial Tax"}
                  onChange={(e) =>
                    handleInputChange("taxSecondaryLabel", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-line rounded-xl"
                  placeholder="PST, Provincial Tax"
                />
                <p className="text-xs text-muted mt-1">
                  Appears on estimates and invoices
                </p>
              </div>
            </div>
          )}

          {!settings.taxSecondaryEnabled && (
            <p className="text-sm text-muted italic">
              Enable secondary tax for dual-rate systems (e.g., GST + PST in Canada)
            </p>
          )}
        </div>

        {/* Combined Rate Display */}
        {settings.taxSecondaryEnabled && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-blue-900">
                Combined Tax Rate:
              </span>
              <span className="text-lg font-bold text-blue-900">
                {combinedRate.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Primary ({primaryRate}%) + Secondary ({secondaryRate}%)
            </p>
          </div>
        )}

        {/* Example Configurations */}
        <div className="p-4 bg-white border border-line rounded-xl">
          <h4 className="text-sm font-bold text-muted mb-2">
            💡 Common Configurations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-2 bg-gray-50 rounded">
              <div className="font-bold text-plum">US States (Single Rate)</div>
              <div className="text-muted">Primary: 7.5% "Sales Tax"</div>
              <div className="text-muted">Secondary: Disabled</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="font-bold text-plum">British Columbia (Dual Rate)</div>
              <div className="text-muted">Primary: 5% "GST"</div>
              <div className="text-muted">Secondary: 7% "PST"</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="font-bold text-plum">Ontario (Harmonized)</div>
              <div className="text-muted">Primary: 13% "HST"</div>
              <div className="text-muted">Secondary: Disabled</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="font-bold text-plum">Alberta (GST Only)</div>
              <div className="text-muted">Primary: 5% "GST"</div>
              <div className="text-muted">Secondary: Disabled</div>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-2">
            <span className="text-blue-600 text-lg">ℹ️</span>
            <div className="flex-1 text-sm text-blue-800">
              <strong>Per-Estimate Override:</strong> Tax rates can be adjusted for individual estimates on the calculator page for out-of-region clients or tax-exempt organizations. Use the "Tax Exempt" checkbox for tax-free sales.
            </div>
          </div>
        </div>

        {/* Settings Helper */}
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm text-purple-800">
            <strong>💡 Tip:</strong> Set your default tax rates here based on your home location. Most quilters use their home state or province rate as the default, then adjust per-project as needed.
          </p>
        </div>
      </div>
    </AccordionBody>
    </>
  );
}
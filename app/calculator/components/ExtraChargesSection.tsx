/**
 * ExtraChargesSection Component
 * 
 * Allows adding custom charges to an estimate (shipping, rush fees, etc.).
 * Supports taxable and non-taxable charges.
 * 
 * @module calculator/components/ExtraChargesSection
 */

"use client";

import type { ExtraCharge } from "../../types";
import { FeatureGate, isFeatureEnabled } from "../../lib/featureFlags";

interface ExtraChargesSectionProps {
  /** List of current extra charges */
  extraCharges: ExtraCharge[];
  
  // New charge form state
  newChargeName: string;
  setNewChargeName: (value: string) => void;
  newChargeAmount: string;
  setNewChargeAmount: (value: string) => void;
  newChargeTaxable: boolean;
  setNewChargeTaxable: (value: boolean) => void;
  
  // Handlers
  onAddCharge: () => void;
  onRemoveCharge: (id: string) => void;
  
  /** Currency formatter function */
  formatCurrency: (amount: number) => string;
}

/**
 * Form section for adding/removing extra charges.
 * 
 * Features:
 * - Add custom charges with name, amount, and taxable flag
 * - Display list of added charges
 * - Remove individual charges
 */
export default function ExtraChargesSection({
  extraCharges,
  newChargeName,
  setNewChargeName,
  newChargeAmount,
  setNewChargeAmount,
  newChargeTaxable,
  setNewChargeTaxable,
  onAddCharge,
  onRemoveCharge,
  formatCurrency,
}: ExtraChargesSectionProps) {
  return (
    <div className="mb-6 p-4 bg-background border border-line rounded-xl">
      <h3 className="text-sm font-bold text-plum mb-3">
        Extra Charges (Shipping, Rush, Custom Fees, etc.)
      </h3>

      {/* Add New Charge Form */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Charge name (e.g., Shipping, Rush Fee)"
            value={newChargeName}
            onChange={(e) => setNewChargeName(e.target.value)}
            className="flex-1 px-4 py-2 border border-line rounded-xl bg-white"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Amount"
              value={newChargeAmount}
              onChange={(e) => {
                const val = e.target.value;
                const num = parseFloat(val);
                if (val !== "" && !isNaN(num)) {
                  if (num < 0) { setNewChargeAmount("0"); return; }
                  if (num > 99999) { setNewChargeAmount("99999"); return; }
                }
                setNewChargeAmount(val);
              }}
              className="w-full sm:w-32 pl-7 pr-3 py-2 border border-line rounded-xl bg-white"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* v4.0 DEPRECATED - Taxable checkbox hidden by ENABLE_TAX_SYSTEM flag */}
          <FeatureGate flag="ENABLE_TAX_SYSTEM">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newChargeTaxable}
                onChange={(e) => setNewChargeTaxable(e.target.checked)}
                className="w-4 h-4 rounded border-line"
              />
              <span className="text-sm text-muted">Taxable</span>
            </label>
          </FeatureGate>
          <button
            type="button"
            onClick={onAddCharge}
            className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold"
          >
            Add Charge
          </button>
        </div>
      </div>

      {/* List of Extra Charges */}
      {extraCharges.length > 0 ? (
        <div className="space-y-2">
          {extraCharges.map((charge) => (
            <div
              key={charge.id}
              className="flex items-center justify-between p-3 bg-white border border-line rounded-lg"
            >
              <div className="flex-1">
                <div className="text-sm font-bold">{charge.name}</div>
                <div className="text-xs text-muted">
                  {formatCurrency(charge.amount)}
                  {isFeatureEnabled("ENABLE_TAX_SYSTEM") && (charge.taxable ? " (taxable)" : " (non-taxable)")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveCharge(charge.id)}
                className="px-3 py-1 text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted text-center py-2">
          No extra charges added yet.
        </p>
      )}
    </div>
  );
}

/**
 * EstimateSummary Component
 * 
 * Displays the pricing breakdown, donation toggle, and deposit summary.
 * Shows all calculated totals from the pricing engine.
 * 
 * @module calculator/components/EstimateSummary
 */

"use client";

import type { Settings, ExtraCharge } from "../../types";

interface EstimateSummaryProps {
  settings: Settings;
  
  // Calculated totals
  quiltingTotal: number;
  battingTotal: number;
  bindingTotal: number;
  bobbinTotal: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  depositAmount: number;
  balanceDue: number;
  
  // Extra charges for itemized display
  extraCharges: ExtraCharge[];
  clientSuppliesBatting: boolean;
  
  // Donation toggle
  isDonation: boolean;
  setIsDonation: (value: boolean) => void;
  
  // Deposit display
  depositReceivedToday: boolean;
  depositPaymentMethod: string;
  
  /** Currency formatter function */
  formatCurrency: (amount: number) => string;
}

/**
 * Displays the complete estimate summary with pricing breakdown.
 * 
 * Sections:
 * - Line items (quilting, batting, binding, bobbin)
 * - Extra charges (itemized)
 * - Subtotal, tax, and total
 * - Donation toggle with tax-deductible info
 * - Deposit summary (if deposit entered)
 */
export default function EstimateSummary({
  settings,
  quiltingTotal,
  battingTotal,
  bindingTotal,
  bobbinTotal,
  subtotal,
  taxAmount,
  total,
  depositAmount,
  balanceDue,
  extraCharges,
  clientSuppliesBatting,
  isDonation,
  setIsDonation,
  depositReceivedToday,
  depositPaymentMethod,
  formatCurrency,
}: EstimateSummaryProps) {
  return (
    <div className="border-t border-line pt-6 mt-6">
      <h3 className="text-lg font-bold text-plum mb-4">
        Estimate Summary
      </h3>

      {/* ─────────────────────────────────────────────────────────────────
          LINE ITEMS
          ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Quilting</span>
          <span className="font-bold">{formatCurrency(quiltingTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            Batting {clientSuppliesBatting && "(Client Supplied)"}
          </span>
          <span className="font-bold">{formatCurrency(battingTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Binding</span>
          <span className="font-bold">{formatCurrency(bindingTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Bobbins</span>
          <span className="font-bold">{formatCurrency(bobbinTotal)}</span>
        </div>
        
        {/* Extra Charges (itemized) */}
        {extraCharges.length > 0 && (
          <>
            <div className="border-t border-line pt-2 mt-2">
              <div className="text-xs font-bold text-muted mb-1">Extra Charges:</div>
            </div>
            {extraCharges.map((charge) => (
              <div key={charge.id} className="flex justify-between text-sm pl-2">
                <span className="text-muted">
                  {charge.name}
                  {!charge.taxable && " *"}
                </span>
                <span className="font-bold">{formatCurrency(charge.amount)}</span>
              </div>
            ))}
            {extraCharges.some((c) => !c.taxable) && (
              <p className="text-xs text-muted pl-2">* Non-taxable</p>
            )}
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SUBTOTAL, TAX, TOTAL
          ───────────────────────────────────────────────────────────────── */}
      <div className="border-t border-line pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            {settings.taxLabel || "Tax"} ({settings.taxRate || 0}%)
          </span>
          <span className="font-bold">{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between text-lg border-t border-line pt-3">
          <span className="font-bold text-plum">Total</span>
          <span className="font-bold text-plum">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          DONATION TOGGLE
          ───────────────────────────────────────────────────────────────── */}
      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDonation}
            onChange={(e) => setIsDonation(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-line accent-purple-600"
          />
          <div className="flex-1">
            <div className="text-sm font-bold text-purple-700">
              🎁 Mark as Donation
            </div>
            <div className="text-xs text-purple-600 mt-1">
              For charitable organizations. Tax-deductible materials can be calculated on invoice.
            </div>
            {isDonation && (
              <div className="mt-2 text-xs text-purple-600 bg-purple-100 p-2 rounded">
                <strong>Note:</strong> Only donations to qualified 501(c)(3) organizations are tax-deductible. 
                Materials and mileage may be deductible - quilting services are not.
              </div>
            )}
          </div>
        </label>
        {isDonation && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
              ✅ DONATION
            </span>
            <span className="text-purple-700">
              Invoice will show tax-deductible breakdown
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          DEPOSIT SUMMARY (shown in total section when deposit > 0)
          ───────────────────────────────────────────────────────────────── */}
      {depositAmount > 0 && (
        <div className="mt-4 p-3 bg-gold/10 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-gold">
              Deposit {depositReceivedToday ? "(Paid Today)" : "Due"}
            </span>
            <span className="font-bold text-gold">
              {formatCurrency(depositAmount)}
            </span>
          </div>
          {depositReceivedToday && (
            <div className="flex justify-between text-xs">
              <span className="text-muted">Payment Method</span>
              <span className="font-medium">{depositPaymentMethod}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted">Balance on Completion</span>
            <span className="font-bold">{formatCurrency(balanceDue)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DepositSection Component
 * 
 * Handles deposit configuration: type (percentage/flat), amount, and payment recording.
 * 
 * @module calculator/components/DepositSection
 */

"use client";

interface DepositSectionProps {
  // Deposit configuration
  depositType: "percentage" | "flat";
  setDepositType: (value: "percentage" | "flat") => void;
  depositValue: string;
  setDepositValue: (value: string) => void;
  
  // Payment recording
  depositReceivedToday: boolean;
  setDepositReceivedToday: (value: boolean) => void;
  depositPaymentMethod: string;
  setDepositPaymentMethod: (value: string) => void;
  
  // Calculated amounts
  depositAmount: number;
  balanceDue: number;
  
  /** Currency formatter function */
  formatCurrency: (amount: number) => string;
  /** Currency symbol (e.g. "$", "£", "S/") */
  currencySymbol?: string;
}

/**
 * Form section for configuring deposit requirements.
 * 
 * Features:
 * - Toggle between percentage and flat amount deposit
 * - Option to mark deposit as received today
 * - Payment method selection when recording deposit
 */
export default function DepositSection({
  depositType,
  setDepositType,
  depositValue,
  setDepositValue,
  depositReceivedToday,
  setDepositReceivedToday,
  depositPaymentMethod,
  setDepositPaymentMethod,
  depositAmount,
  balanceDue,
  formatCurrency,
  currencySymbol = "$",
}: DepositSectionProps) {
  /**
   * Clears deposit value and resets received flag
   */
  const handleClearDeposit = () => {
    setDepositValue("");
    setDepositReceivedToday(false);
  };

  return (
    <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-xl">
      <label className="block text-sm font-bold text-plum mb-3">
        Deposit (Optional)
      </label>

      {/* Deposit Type Toggle - stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <button
          type="button"
          onClick={() => { setDepositType("percentage"); setDepositValue(""); }}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            depositType === "percentage"
              ? "bg-gold text-white"
              : "bg-white border border-line text-muted hover:border-gold"
          }`}
        >
          Percentage (%)
        </button>
        <button
          type="button"
          onClick={() => { setDepositType("flat"); setDepositValue(""); }}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            depositType === "flat"
              ? "bg-gold text-white"
              : "bg-white border border-line text-muted hover:border-gold"
          }`}
        >
          Flat Amount ({currencySymbol})
        </button>
      </div>

      {/* Deposit Value Input */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">
            {depositType === "percentage" ? "%" : currencySymbol}
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder={depositType === "percentage" ? "50" : "100.00"}
            value={depositValue}
            onChange={(e) => setDepositValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-xl"
          />
        </div>
        {depositValue && (
          <button
            type="button"
            onClick={handleClearDeposit}
            className="px-3 py-2 text-sm text-muted hover:text-red-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Deposit Summary and Payment Recording */}
      {depositAmount > 0 && (
        <div className="mt-3 p-3 bg-white rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Deposit Due:</span>
            <span className="font-bold text-gold">
              {formatCurrency(depositAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Balance on Completion:</span>
            <span className="font-bold">{formatCurrency(balanceDue)}</span>
          </div>

          {/* Deposit Received Today Option */}
          <div className="border-t border-line pt-3 mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={depositReceivedToday}
                onChange={(e) => setDepositReceivedToday(e.target.checked)}
                className="w-5 h-5 rounded border-line accent-green-600"
              />
              <div>
                <div className="text-sm font-bold text-green-700">
                  Deposit received today
                </div>
                <div className="text-xs text-muted">
                  Record payment now (skips deposit step later)
                </div>
              </div>
            </label>

            {/* Payment Method (shown when recording deposit) */}
            {depositReceivedToday && (
              <div className="mt-3">
                <label className="block text-xs font-bold text-muted mb-1">
                  Payment Method
                </label>
                <select
                  value={depositPaymentMethod}
                  onChange={(e) => setDepositPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-xl text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Venmo">Venmo</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Square">Square</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper text when no deposit entered */}
      {!depositAmount && (
        <p className="text-xs text-muted mt-2">
          Enter a deposit amount to see options.
        </p>
      )}
    </div>
  );
}

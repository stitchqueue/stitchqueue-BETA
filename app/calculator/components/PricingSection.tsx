/**
 * PricingSection Component
 * 
 * Handles all pricing inputs: quilting type, batting, binding, and bobbins.
 * Displays different UI based on FREE vs PRO tier and whether rates are configured.
 * 
 * @module calculator/components/PricingSection
 */

"use client";

import type { Settings } from "../../types";

interface PricingSectionProps {
  settings: Settings;
  
  // Tier flags (derived from settings, passed for convenience)
  isPaidTier: boolean;
  hasQuiltingRates: boolean;
  hasBattingOptions: boolean;
  hasBobbinOptions: boolean;
  
  // Quilting
  quiltingType: string;
  setQuiltingType: (value: string) => void;
  quiltingRateManual: string;
  setQuiltingRateManual: (value: string) => void;
  customQuiltingRate: string;
  setCustomQuiltingRate: (value: string) => void;
  
  // Batting
  clientSuppliesBatting: boolean;
  setClientSuppliesBatting: (value: boolean) => void;
  battingChoice: string;
  setBattingChoice: (value: string) => void;
  battingPriceManual: string;
  setBattingPriceManual: (value: string) => void;
  battingLengthAddition: string;
  setBattingLengthAddition: (value: string) => void;
  
  // Binding
  bindingType: string;
  setBindingType: (value: string) => void;
  bindingRateManual: string;
  setBindingRateManual: (value: string) => void;
  
  // Bobbin
  bobbinChoice: string;
  setBobbinChoice: (value: string) => void;
  bobbinCount: string;
  setBobbinCount: (value: string) => void;
  bobbinPriceManual: string;
  setBobbinPriceManual: (value: string) => void;
}

/**
 * Form section for all pricing-related inputs.
 * 
 * Display modes:
 * - PRO tier with rates: Shows dropdown with saved rates + "Custom Rate" option
 * - PRO tier without rates: Shows text input for type + rate input
 * - FREE tier: Always shows text input for type + rate input
 */
export default function PricingSection({
  settings,
  isPaidTier,
  hasQuiltingRates,
  hasBattingOptions,
  hasBobbinOptions,
  quiltingType,
  setQuiltingType,
  quiltingRateManual,
  setQuiltingRateManual,
  customQuiltingRate,
  setCustomQuiltingRate,
  clientSuppliesBatting,
  setClientSuppliesBatting,
  battingChoice,
  setBattingChoice,
  battingPriceManual,
  setBattingPriceManual,
  battingLengthAddition,
  setBattingLengthAddition,
  bindingType,
  setBindingType,
  bindingRateManual,
  setBindingRateManual,
  bobbinChoice,
  setBobbinChoice,
  bobbinCount,
  setBobbinCount,
  bobbinPriceManual,
  setBobbinPriceManual,
}: PricingSectionProps) {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────
          QUILTING TYPE
          ───────────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted mb-2">
          Quilting Type
        </label>
        {isPaidTier && hasQuiltingRates ? (
          // PRO tier with rates: show dropdown with "Custom Rate" option
          <div className="space-y-2">
            <select
              value={quiltingType}
              onChange={(e) => setQuiltingType(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            >
              <option value="">Select quilting type...</option>
              {(settings.pricingRates?.lightE2E ?? 0) > 0 && (
                <option value="lightE2E">
                  Light Edge-to-Edge (${settings.pricingRates?.lightE2E}/sq in)
                </option>
              )}
              {(settings.pricingRates?.standardE2E ?? 0) > 0 && (
                <option value="standardE2E">
                  Standard Edge-to-Edge (${settings.pricingRates?.standardE2E}/sq in)
                </option>
              )}
              {(settings.pricingRates?.lightCustom ?? 0) > 0 && (
                <option value="lightCustom">
                  Light Custom (${settings.pricingRates?.lightCustom}/sq in)
                </option>
              )}
              {(settings.pricingRates?.custom ?? 0) > 0 && (
                <option value="custom">
                  Custom (${settings.pricingRates?.custom}/sq in)
                </option>
              )}
              {(settings.pricingRates?.denseCustom ?? 0) > 0 && (
                <option value="denseCustom">
                  Dense Custom (${settings.pricingRates?.denseCustom}/sq in)
                </option>
              )}
              <option value="Custom Rate">Custom Rate (set price for this estimate only)</option>
            </select>
            
            {/* Show custom rate input when "Custom Rate" is selected */}
            {quiltingType === "Custom Rate" && (
              <input
                type="text"
                inputMode="decimal"
                max="99999"
                placeholder="Price per square inch for this estimate (e.g., 0.025)"
                value={customQuiltingRate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && parseFloat(val) > 99999) {
                    setCustomQuiltingRate("99999");
                  } else {
                    setCustomQuiltingRate(val);
                  }
                }}
                className="w-full px-4 py-2 border border-line rounded-xl bg-amber-50"
              />
            )}
          </div>
        ) : (
          // FREE tier or PRO without rates: manual entry
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Quilting type (e.g., Edge-to-Edge)"
              value={quiltingType}
              onChange={(e) => setQuiltingType(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
            <input
              type="text"
              inputMode="decimal"
              max="99999"
              placeholder="Rate per sq inch (e.g., 0.02)"
              value={quiltingRateManual}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "" && parseFloat(val) > 99999) {
                  setQuiltingRateManual("99999");
                } else {
                  setQuiltingRateManual(val);
                }
              }}
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          CLIENT SUPPLIES BATTING TOGGLE
          ───────────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={clientSuppliesBatting}
            onChange={(e) => setClientSuppliesBatting(e.target.checked)}
            className="w-5 h-5 rounded border-line"
          />
          <div>
            <div className="text-sm font-bold text-plum">
              Client Supplies Own Batting
            </div>
            <div className="text-xs text-muted">
              Batting cost will be $0
            </div>
          </div>
        </label>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          BATTING (only shown if client doesn't supply)
          ───────────────────────────────────────────────────────────────── */}
      {!clientSuppliesBatting && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Batting
            </label>
            {isPaidTier && hasBattingOptions ? (
              // PRO tier with batting options: show dropdown
              <select
                value={battingChoice}
                onChange={(e) => setBattingChoice(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="">Select batting...</option>
                {settings.battingOptions?.map((b) => (
                  <option key={`${b.name}-${b.widthInches}`} value={b.name}>
                    {b.name} - {b.widthInches}&quot; wide ($
                    {b.pricePerInch.toFixed(4)}/in)
                  </option>
                ))}
              </select>
            ) : (
              // FREE tier or PRO without options: manual entry
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Batting type (e.g., Warm & Natural)"
                  value={battingChoice}
                  onChange={(e) => setBattingChoice(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Price per inch (e.g., 0.12)"
                  value={battingPriceManual}
                  onChange={(e) => setBattingPriceManual(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Batting Length Addition */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Batting Length Addition
            </label>
            <select
              value={battingLengthAddition}
              onChange={(e) => setBattingLengthAddition(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            >
              <option value="2">2 inches</option>
              <option value="4">4 inches (recommended)</option>
              <option value="6">6 inches</option>
              <option value="8">8 inches</option>
            </select>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          BINDING
          ───────────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted mb-2">
          Binding
        </label>
        {isPaidTier &&
        (settings.pricingRates?.bindingTopAttached ||
          settings.pricingRates?.bindingFullyAttached) ? (
          // PRO tier with binding rates: show dropdown with prices
          <select
            value={bindingType}
            onChange={(e) => setBindingType(e.target.value)}
            className="w-full px-4 py-2 border border-line rounded-xl"
          >
            <option value="">Select binding...</option>
            <option value="No Binding">No Binding ($0)</option>
            {(settings.pricingRates?.bindingTopAttached ?? 0) > 0 && (
              <option value="Top Attached Only">
                Top Attached Only (${settings.pricingRates?.bindingTopAttached}/in)
              </option>
            )}
            {(settings.pricingRates?.bindingFullyAttached ?? 0) > 0 && (
              <option value="Fully Attached">
                Fully Attached (${settings.pricingRates?.bindingFullyAttached}/in)
              </option>
            )}
          </select>
        ) : (
          // FREE tier or PRO without rates: dropdown + manual rate
          <div className="space-y-2">
            <select
              value={bindingType}
              onChange={(e) => setBindingType(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            >
              <option value="">Select binding type...</option>
              <option value="No Binding">No Binding</option>
              <option value="Top Attached Only">Top Attached Only</option>
              <option value="Fully Attached">Fully Attached</option>
            </select>
            {bindingType && bindingType !== "No Binding" && (
              <input
                type="text"
                inputMode="decimal"
                placeholder="Rate per inch (e.g., 0.15)"
                value={bindingRateManual}
                onChange={(e) => setBindingRateManual(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          BOBBINS
          ───────────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-muted mb-2">
          Bobbins
        </label>
        {isPaidTier && hasBobbinOptions ? (
          // PRO tier with bobbin options: dropdown + count
          <div className="space-y-2">
            <select
              value={bobbinChoice}
              onChange={(e) => setBobbinChoice(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            >
              <option value="">Select bobbin type...</option>
              {settings.bobbinOptions?.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} (${b.price.toFixed(2)} each)
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={bobbinCount}
              onChange={(e) => setBobbinCount(e.target.value)}
              placeholder="Number of bobbins"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>
        ) : (
          // FREE tier or PRO without options: count + manual price
          <div className="space-y-2">
            <input
              type="number"
              min="0"
              value={bobbinCount}
              onChange={(e) => setBobbinCount(e.target.value)}
              placeholder="Number of bobbins"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Price per bobbin (e.g., 2.50)"
              value={bobbinPriceManual}
              onChange={(e) => setBobbinPriceManual(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>
        )}
      </div>
    </>
  );
}
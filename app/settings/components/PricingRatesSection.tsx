/**
 * PricingRatesSection Component
 * 
 * Manages quilting and binding rate settings (PRO tier only).
 * Values auto-save on blur.
 * 
 * @module settings/components/PricingRatesSection
 */

"use client";

import type { Settings } from "../../types";
import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";

/**
 * Rate string state type for controlled inputs
 */
export interface RateStrings {
  lightE2E: string;
  standardE2E: string;
  lightCustom: string;
  custom: string;
  denseCustom: string;
  bindingTopAttached: string;
  bindingFullyAttached: string;
}

interface PricingRatesSectionProps {
  settings: Settings;
  rateStrings: RateStrings;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
  onRateChange: (field: keyof RateStrings, value: string) => void;
  onRateBlur: (field: keyof RateStrings) => void;
}

/**
 * Pricing rates settings section.
 *
 * Rates:
 * - Light E2E, Standard E2E, Light Custom, Custom, Dense Custom ($/sq in)
 * - Binding: Top Attached, Fully Attached ($/in)
 */
export default function PricingRatesSection({
  rateStrings,
  isOpen,
  onToggle,
  onRateChange,
  onRateBlur,
}: PricingRatesSectionProps) {
  return (
    <div>
      <AccordionHeader
        sectionKey="pricing"
        label="Pricing Rates"
        icon="💲"
        subtitle="Per square inch quilting rates"
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
          <div className="space-y-4">
            {/* Quilting Rates Header */}
            <div>
              <h3 className="text-md font-bold text-plum mb-3">
                Quilting Rates
              </h3>
              <p className="text-xs text-muted mb-4">
                Values save when you click out of a field
              </p>
            </div>

            {/* Quilting Rate Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Light Edge-to-Edge ($/sq in)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStrings.lightE2E}
                  onChange={(e) => onRateChange("lightE2E", e.target.value)}
                  onBlur={() => onRateBlur("lightE2E")}
                  placeholder="0.015"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Standard Edge-to-Edge ($/sq in)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStrings.standardE2E}
                  onChange={(e) => onRateChange("standardE2E", e.target.value)}
                  onBlur={() => onRateBlur("standardE2E")}
                  placeholder="0.02"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Light Custom ($/sq in)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStrings.lightCustom}
                  onChange={(e) => onRateChange("lightCustom", e.target.value)}
                  onBlur={() => onRateBlur("lightCustom")}
                  placeholder="0.025"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Custom ($/sq in)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStrings.custom}
                  onChange={(e) => onRateChange("custom", e.target.value)}
                  onBlur={() => onRateBlur("custom")}
                  placeholder="0.03"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Dense Custom ($/sq in)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStrings.denseCustom}
                  onChange={(e) => onRateChange("denseCustom", e.target.value)}
                  onBlur={() => onRateBlur("denseCustom")}
                  placeholder="0.04"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            </div>

            {/* Binding Rates */}
            <div className="border-t border-line pt-6 mt-6">
              <h3 className="text-md font-bold text-plum mb-4">
                Binding Rates (per inch)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Top Attached Only ($/in)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rateStrings.bindingTopAttached}
                    onChange={(e) =>
                      onRateChange("bindingTopAttached", e.target.value)
                    }
                    onBlur={() => onRateBlur("bindingTopAttached")}
                    placeholder="0.10"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Fully Attached ($/in)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rateStrings.bindingFullyAttached}
                    onChange={(e) =>
                      onRateChange("bindingFullyAttached", e.target.value)
                    }
                    onBlur={() => onRateBlur("bindingFullyAttached")}
                    placeholder="0.20"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
      </AccordionBody>
    </div>
  );
}

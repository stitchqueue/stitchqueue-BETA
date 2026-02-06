/**
 * Pricing Calculations
 * 
 * Core pricing engine for the StitchQueue calculator.
 * Calculates quilting, batting, binding, bobbin, extra charges, discount, tax, and deposit.
 * 
 * @module calculator/utils/calculations
 */

import type { Settings, ExtraCharge } from "../../types";

/**
 * Input values needed for price calculations
 */
export interface CalculationInputs {
  // Quilt dimensions
  quiltWidth: string;
  quiltLength: string;
  
  // Quilting
  quiltingType: string;
  quiltingRateManual: string;
  
  // Batting
  battingChoice: string;
  battingPriceManual: string;
  battingLengthAddition: string;
  clientSuppliesBatting: boolean;
  
  // Binding
  bindingType: string;
  bindingRateManual: string;
  
  // Bobbin
  bobbinChoice: string;
  bobbinCount: string;
  bobbinPriceManual: string;
  
  // Extra charges
  extraCharges: ExtraCharge[];

  // Discount
  discountType: "percentage" | "flat";
  discountValue: string;
  
  // Deposit
  depositType: "percentage" | "flat";
  depositValue: string;
}

/**
 * Calculated totals returned by calculateTotals
 */
export interface CalculationResults {
  quiltingTotal: number;
  battingTotal: number;
  bindingTotal: number;
  bobbinTotal: number;
  extraChargesTotal: number;
  extraChargesTaxable: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  depositAmount: number;
  balanceDue: number;
}

/**
 * Calculates all pricing totals based on form inputs and settings.
 * 
 * Pricing logic:
 * - Quilting: quilt area (width × length) × rate per square inch
 * - Batting: (quilt length + addition inches) × price per inch
 * - Binding: perimeter (2 × (width + length)) × rate per inch
 * - Bobbin: count × price each
 * - Subtotal: sum of all line items above + extra charges
 * - Discount: percentage of subtotal OR flat amount (applied after subtotal)
 * - Tax: applied to discounted taxable amount (proportionally reduced by discount)
 * - Deposit: percentage of total OR flat amount
 * 
 * @param inputs - Form values for calculations
 * @param settings - User's saved settings (rates, tax, etc.)
 * @returns CalculationResults with all totals
 */
export function calculateTotals(
  inputs: CalculationInputs,
  settings: Settings
): CalculationResults {
  const isPaidTier = settings.isPaidTier || false;
  
  // Check if user has saved rates
  const hasQuiltingRates =
    settings.pricingRates &&
    ((settings.pricingRates.lightE2E ?? 0) > 0 ||
      (settings.pricingRates.standardE2E ?? 0) > 0 ||
      (settings.pricingRates.lightCustom ?? 0) > 0 ||
      (settings.pricingRates.custom ?? 0) > 0 ||
      (settings.pricingRates.denseCustom ?? 0) > 0);
  
  const hasBobbinOptions =
    settings.bobbinOptions && settings.bobbinOptions.length > 0;
  
  const hasBattingOptions =
    settings.battingOptions && settings.battingOptions.length > 0;

  let quilting = 0;
  let batting = 0;
  let binding = 0;
  let bobbin = 0;

  const w = parseFloat(inputs.quiltWidth) || 0;
  const h = parseFloat(inputs.quiltLength) || 0;
  const area = w * h;

  // ─────────────────────────────────────────────────────────────────
  // QUILTING CALCULATION
  // Formula: area × rate per square inch
  // ─────────────────────────────────────────────────────────────────
  if (area > 0) {
    if (isPaidTier && hasQuiltingRates && inputs.quiltingType) {
      const rate =
        settings.pricingRates?.[
          inputs.quiltingType as keyof typeof settings.pricingRates
        ] || 0;
      quilting = area * (rate as number);
    } else if (inputs.quiltingRateManual) {
      quilting = area * (parseFloat(inputs.quiltingRateManual) || 0);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // BATTING CALCULATION
  // Formula: (quilt length + addition) × price per inch
  // ─────────────────────────────────────────────────────────────────
  if (!inputs.clientSuppliesBatting && h > 0) {
    const additionInches = parseFloat(inputs.battingLengthAddition) || 4;
    const battingLengthNeeded = h + additionInches;

    if (isPaidTier && hasBattingOptions && inputs.battingChoice) {
      const battingOption = settings.battingOptions?.find(
        (b) => b.name === inputs.battingChoice
      );
      const battingPricePerInch = battingOption?.pricePerInch || 0;
      batting = battingLengthNeeded * battingPricePerInch;
    } else if (inputs.battingPriceManual) {
      batting = battingLengthNeeded * (parseFloat(inputs.battingPriceManual) || 0);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // BINDING CALCULATION (per-inch)
  // Formula: perimeter × rate per inch
  // ─────────────────────────────────────────────────────────────────
  if (inputs.bindingType && inputs.bindingType !== "No Binding" && w > 0 && h > 0) {
    const perimeter = (w + h) * 2;
    if (
      isPaidTier &&
      (settings.pricingRates?.bindingTopAttached ||
        settings.pricingRates?.bindingFullyAttached)
    ) {
      if (inputs.bindingType === "Top Attached Only") {
        binding = perimeter * (settings.pricingRates?.bindingTopAttached || 0);
      } else if (inputs.bindingType === "Fully Attached") {
        binding = perimeter * (settings.pricingRates?.bindingFullyAttached || 0);
      }
    } else if (inputs.bindingRateManual) {
      binding = perimeter * (parseFloat(inputs.bindingRateManual) || 0);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // BOBBIN CALCULATION
  // Formula: count × price each
  // ─────────────────────────────────────────────────────────────────
  const bobbins = parseInt(inputs.bobbinCount) || 0;
  if (bobbins > 0) {
    if (isPaidTier && hasBobbinOptions && inputs.bobbinChoice) {
      const bobbinOption = settings.bobbinOptions?.find(
        (b) => b.name === inputs.bobbinChoice
      );
      bobbin = bobbins * (bobbinOption?.price || 0);
    } else if (inputs.bobbinPriceManual) {
      bobbin = bobbins * (parseFloat(inputs.bobbinPriceManual) || 0);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // EXTRA CHARGES CALCULATION
  // Separates taxable vs non-taxable charges
  // ─────────────────────────────────────────────────────────────────
  let extraTotal = 0;
  let extraTaxable = 0;
  inputs.extraCharges.forEach((charge) => {
    extraTotal += charge.amount;
    if (charge.taxable) {
      extraTaxable += charge.amount;
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // SUBTOTAL (before discount)
  // ─────────────────────────────────────────────────────────────────
  const subtotal = quilting + batting + binding + bobbin + extraTotal;
  const taxableAmount = quilting + batting + binding + bobbin + extraTaxable;

  // ─────────────────────────────────────────────────────────────────
  // DISCOUNT CALCULATION
  // Applied after subtotal, before tax
  // Percentage: % of subtotal | Flat: fixed dollar amount
  // Discount cannot exceed subtotal
  // ─────────────────────────────────────────────────────────────────
  let discount = 0;
  const discVal = parseFloat(inputs.discountValue) || 0;
  if (discVal > 0 && subtotal > 0) {
    if (inputs.discountType === "percentage") {
      discount = subtotal * (Math.min(discVal, 100) / 100);
    } else {
      discount = Math.min(discVal, subtotal);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // TAX CALCULATION
  // Tax applies to: quilting, batting, binding, bobbin, taxable extras
  // Discount proportionally reduces the taxable amount
  // ─────────────────────────────────────────────────────────────────
  let discountedTaxable = taxableAmount;
  if (discount > 0 && subtotal > 0) {
    const discountRatio = discount / subtotal;
    discountedTaxable = taxableAmount * (1 - discountRatio);
  }
  const tax = discountedTaxable * ((settings.taxRate || 0) / 100);

  // ─────────────────────────────────────────────────────────────────
  // TOTAL (subtotal - discount + tax)
  // ─────────────────────────────────────────────────────────────────
  const total = subtotal - discount + tax;

  // ─────────────────────────────────────────────────────────────────
  // DEPOSIT CALCULATION
  // Either percentage of total OR flat amount
  // ─────────────────────────────────────────────────────────────────
  let deposit = 0;
  const depVal = parseFloat(inputs.depositValue) || 0;
  if (depVal > 0) {
    if (inputs.depositType === "percentage") {
      deposit = total * (depVal / 100);
    } else {
      deposit = depVal;
    }
  }
  const balance = total - deposit;

  return {
    quiltingTotal: quilting,
    battingTotal: batting,
    bindingTotal: binding,
    bobbinTotal: bobbin,
    extraChargesTotal: extraTotal,
    extraChargesTaxable: extraTaxable,
    discountAmount: discount,
    subtotal,
    taxAmount: tax,
    total,
    depositAmount: deposit,
    balanceDue: balance,
  };
}
/**
 * CalculatorForm Component
 * 
 * Main orchestrator for the estimate calculator. Manages all form state,
 * handles calculations, and saves estimates to the database.
 * 
 * This is the "brain" of the calculator - it holds all state and passes
 * it down to child components. Child components are purely presentational.
 * 
 * @module calculator/CalculatorForm
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { supabase } from "../lib/supabase";
import { isFeatureEnabled } from "../lib/featureFlags";
import type { Settings, Project, ExtraCharge } from "../types";
import { getCurrencySymbol } from "../lib/currency";

interface BOCRateData {
  hasBOC: boolean;
  targetRatePerSqIn: number | null;
  sphRate: number | null;
  targetHourlyWage: number | null;
  monthlyOverhead: number | null;
  projectsPerMonth: number | null;
  incidentalsMinutes: number | null;
}

// Import child components
import {
  TierStatusCard,
  ClientInfoSection,
  ProjectDetailsSection,
  PricingSection,
  ExtraChargesSection,
  EstimateSummary,
  DepositSection,
} from "./components";

// Import utilities
import {
  calculateTotals,
  getNextEstimateNumberAtomic,
} from "./utils";
import { getTodayDate } from "../lib/utils";

/**
 * Main calculator form component.
 * 
 * Handles:
 * - Loading existing project data (edit mode)
 * - Managing 60+ form state variables
 * - Calculating totals on input changes
 * - Saving new/updated estimates to database
 */
export default function CalculatorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  // ─────────────────────────────────────────────────────────────────────
  // CORE STATE
  // ─────────────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<Settings | null>(null);
  const [nextEstimateNumber, setNextEstimateNumber] = useState<number>(1001);
  const [existingProject, setExistingProject] = useState<Project | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─────────────────────────────────────────────────────────────────────
  // CLIENT INFORMATION STATE
  // ─────────────────────────────────────────────────────────────────────
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientStreet, setClientStreet] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientPostalCode, setClientPostalCode] = useState("");
  const [clientCountry, setClientCountry] = useState("United States");

  // ─────────────────────────────────────────────────────────────────────
  // PROJECT DETAILS STATE
  // ─────────────────────────────────────────────────────────────────────
  const [quiltWidth, setQuiltWidth] = useState("");
  const [quiltLength, setQuiltLength] = useState("");
  const [description, setDescription] = useState("");
  const [requestedDateType, setRequestedDateType] = useState<"asap" | "no_date" | "specific_date">("no_date");
  const [requestedCompletionDate, setRequestedCompletionDate] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // PRICING STATE
  // ─────────────────────────────────────────────────────────────────────
  const [quiltingType, setQuiltingType] = useState("");
  const [quiltingRateManual, setQuiltingRateManual] = useState("");
  const [customQuiltingRate, setCustomQuiltingRate] = useState("");
  const [battingChoice, setBattingChoice] = useState("");
  const [battingPriceManual, setBattingPriceManual] = useState("");
  const [battingLengthAddition, setBattingLengthAddition] = useState("4");
  const [clientSuppliesBatting, setClientSuppliesBatting] = useState(false);
  const [bindingType, setBindingType] = useState("");
  const [bindingRateManual, setBindingRateManual] = useState("");
  const [bobbinChoice, setBobbinChoice] = useState("");
  const [bobbinCount, setBobbinCount] = useState("1");
  const [bobbinPriceManual, setBobbinPriceManual] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // EXTRA CHARGES STATE
  // ─────────────────────────────────────────────────────────────────────
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [newChargeName, setNewChargeName] = useState("");
  const [newChargeAmount, setNewChargeAmount] = useState("");
  const [newChargeTaxable, setNewChargeTaxable] = useState(true);

  // ─────────────────────────────────────────────────────────────────────
  // DISCOUNT STATE
  // ─────────────────────────────────────────────────────────────────────
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // DONATION & DEPOSIT STATE
  // ─────────────────────────────────────────────────────────────────────
  const [isDonation, setIsDonation] = useState(false);
  const [depositType, setDepositType] = useState<"percentage" | "flat">("percentage");
  const [depositValue, setDepositValue] = useState("");
  const [depositReceivedToday, setDepositReceivedToday] = useState(false);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState("Cash");

  // ─────────────────────────────────────────────────────────────────────
  // CALCULATED VALUES STATE
  // ─────────────────────────────────────────────────────────────────────
  const [quiltingTotal, setQuiltingTotal] = useState(0);
  const [battingTotal, setBattingTotal] = useState(0);
  const [bindingTotal, setBindingTotal] = useState(0);
  const [bobbinTotal, setBobbinTotal] = useState(0);
  const [extraChargesTotal, setExtraChargesTotal] = useState(0);
  const [extraChargesTaxable, setExtraChargesTaxable] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);

  // Tax state (dual rate system)
  const [taxExempt, setTaxExempt] = useState(false);
  const [taxPrimaryRate, setTaxPrimaryRate] = useState("");
  const [taxSecondaryRate, setTaxSecondaryRate] = useState("");
  const [taxPrimaryAmount, setTaxPrimaryAmount] = useState(0);
  const [taxSecondaryAmount, setTaxSecondaryAmount] = useState(0);
  // ─────────────────────────────────────────────────────────────────────
  // BOC RATE WARNING STATE
  // ─────────────────────────────────────────────────────────────────────
  const [bocData, setBocData] = useState<BOCRateData | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // DERIVED FLAGS (computed from settings)
  // ─────────────────────────────────────────────────────────────────────
  const isPaidTier = settings?.isPaidTier || false;
  
  const hasQuiltingRates =
    settings?.pricingRates &&
    ((settings.pricingRates.lightE2E ?? 0) > 0 ||
      (settings.pricingRates.standardE2E ?? 0) > 0 ||
      (settings.pricingRates.lightCustom ?? 0) > 0 ||
      (settings.pricingRates.custom ?? 0) > 0 ||
      (settings.pricingRates.denseCustom ?? 0) > 0);
  
  const hasBobbinOptions =
    settings?.bobbinOptions && settings.bobbinOptions.length > 0;
  
  const hasBattingOptions =
    settings?.battingOptions && settings.battingOptions.length > 0;

  // ─────────────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────
  
  /**
   * Formats phone number as XXX-XXX-XXXX
   */
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setClientPhone(formatted);
  };

  /**
   * Resets state when country changes
   */
  const handleCountryChange = (newCountry: string) => {
    setClientCountry(newCountry);
    setClientState(""); // Reset state when country changes
  };

  /**
   * Formats amount as currency using settings
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currencyCode || "USD",
    }).format(amount);
  };

  const currencySymbol = getCurrencySymbol(settings?.currencyCode || "USD");

  // ─────────────────────────────────────────────────────────────────────
  // EXTRA CHARGES HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  
  const handleAddExtraCharge = () => {
    if (!newChargeName || !newChargeAmount) {
      alert("Please enter charge name and amount");
      return;
    }

    const newCharge: ExtraCharge = {
      id: crypto.randomUUID(),
      name: newChargeName,
      amount: parseFloat(newChargeAmount) || 0,
      taxable: newChargeTaxable,
    };

    setExtraCharges([...extraCharges, newCharge]);
    setNewChargeName("");
    setNewChargeAmount("");
    setNewChargeTaxable(true);
  };

  const handleRemoveExtraCharge = (id: string) => {
    setExtraCharges(extraCharges.filter((c) => c.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────
  // DATA LOADING EFFECT
  // ─────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    const loadData = async () => {
      const savedSettings = await storage.getSettings();
      setSettings(savedSettings);
      setNextEstimateNumber(savedSettings.nextEstimateNumber || 1001);

      // Initialize tax rates from settings
      setTaxPrimaryRate((savedSettings.taxPrimaryRate || 0).toString());
      if (savedSettings.taxSecondaryEnabled) {
        setTaxSecondaryRate((savedSettings.taxSecondaryRate || 0).toString());
      }

      // Load existing project if projectId provided (edit mode)
      if (projectId) {
        const project = await storage.getProjectById(
          decodeURIComponent(projectId)
        );
        if (project) {
          setExistingProject(project);
          setIsEditMode(true);

          // Pre-fill form with project data
          setClientFirstName(project.clientFirstName || "");
          setClientLastName(project.clientLastName || "");
          setClientEmail(project.clientEmail || "");
          setClientPhone(project.clientPhone || "");
          setClientStreet(project.clientStreet || "");
          setClientCity(project.clientCity || "");
          setClientState(project.clientState || "");
          setClientPostalCode(project.clientPostalCode || "");
          setClientCountry(project.clientCountry || "United States");
          setQuiltWidth(project.quiltWidth?.toString() || "");
          setQuiltLength(project.quiltLength?.toString() || "");
          setDescription(project.description || "");
          setRequestedDateType(project.requestedDateType || "no_date");
          setRequestedCompletionDate(project.requestedCompletionDate || "");
          setQuiltingType(project.quiltingType || "");
          if (project.customQuiltingRate) {
            setCustomQuiltingRate(project.customQuiltingRate.toString());
          }
          setBattingChoice(project.battingChoice || "");
          setBattingLengthAddition(project.battingLengthAddition || "4");
          setClientSuppliesBatting(project.clientSuppliesBatting || false);
          setBindingType(project.bindingType || "");
          setBobbinChoice(project.bobbinChoice || "");
          setExtraCharges(project.extraCharges || []);
          setIsDonation(project.isDonation || false);

          // Restore discount fields from project or estimateData
          if (project.discountType) {
            setDiscountType(project.discountType);
          }
          if (project.discountValue !== undefined && project.discountValue > 0) {
            setDiscountValue(project.discountValue.toString());
          } else if (project.estimateData?.discountValue !== undefined && project.estimateData.discountValue > 0) {
            setDiscountType(project.estimateData.discountType || "percentage");
            setDiscountValue(project.estimateData.discountValue.toString());
          }

          // Restore tax data
          if (project.taxExempt !== undefined) {
            setTaxExempt(project.taxExempt);
          }
          if (project.taxPrimaryRate !== undefined) {
            setTaxPrimaryRate(project.taxPrimaryRate.toString());
          }
          if (project.taxSecondaryRate !== undefined) {
            setTaxSecondaryRate(project.taxSecondaryRate.toString());
          }

          // Use existing estimate number if available
          if (project.estimateNumber) {
            setNextEstimateNumber(project.estimateNumber);
          }
        }
      }

      // v4.0 DEPRECATED: Force tax exempt when tax system is disabled
      // This ensures saved estimates have $0 tax and total = subtotal - discount
      if (!isFeatureEnabled("ENABLE_TAX_SYSTEM")) {
        setTaxExempt(true);
      }
    };

    loadData();
  }, [projectId]);

  // ─────────────────────────────────────────────────────────────────────
  // CALCULATION EFFECT
  // ─────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    if (!settings) return;

    const results = calculateTotals(
      {
        quiltWidth,
        quiltLength,
        quiltingType,
        quiltingRateManual,
        customQuiltingRate,
        battingChoice,
        battingPriceManual,
        battingLengthAddition,
        clientSuppliesBatting,
        bindingType,
        bindingRateManual,
        bobbinChoice,
        bobbinCount,
        bobbinPriceManual,
        extraCharges,
        discountType,
        discountValue,
        taxExempt,
        taxPrimaryRate,
        taxSecondaryRate,
        depositType,
        depositValue,
      },
      settings
    );

    setQuiltingTotal(results.quiltingTotal);
    setBattingTotal(results.battingTotal);
    setBindingTotal(results.bindingTotal);
    setBobbinTotal(results.bobbinTotal);
    setExtraChargesTotal(results.extraChargesTotal);
    setExtraChargesTaxable(results.extraChargesTaxable);
    setDiscountAmount(results.discountAmount);
    setSubtotal(results.subtotal);
    setTaxPrimaryAmount(results.taxPrimaryAmount);
    setTaxSecondaryAmount(results.taxSecondaryAmount);
    setTaxAmount(results.taxTotalAmount);
    setTotal(results.total);
    setDepositAmount(results.depositAmount);
    setBalanceDue(results.balanceDue);
  }, [
    quiltWidth,
    quiltLength,
    quiltingType,
    quiltingRateManual,
    customQuiltingRate,
    battingChoice,
    battingPriceManual,
    battingLengthAddition,
    clientSuppliesBatting,
    bindingType,
    bindingRateManual,
    bobbinChoice,
    bobbinCount,
    bobbinPriceManual,
    extraCharges,
    discountType,
    discountValue,
    taxExempt,
    taxPrimaryRate,
    taxSecondaryRate,
    depositType,
    depositValue,
    settings,
  ]);

  // ─────────────────────────────────────────────────────────────────────
  // BOC RATE CHECK (fetch after auth is confirmed — settings loaded)
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!settings) return; // Wait until user is authenticated and settings are loaded
    async function fetchBocRate() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      try {
        const res = await fetch("/api/boc-rate-check", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data) setBocData(data);
        }
      } catch {
        // Silently fail — don't break the calculator
      }
    }
    fetchBocRate();
  }, [settings]);

  // ─────────────────────────────────────────────────────────────────────
  // BOC WARNING CALCULATION
  // ─────────────────────────────────────────────────────────────────────

  const bocWarning = useMemo(() => {
    if (!bocData?.hasBOC || !bocData.targetRatePerSqIn || !bocData.sphRate || !bocData.targetHourlyWage) {
      return null;
    }

    const width = parseFloat(quiltWidth) || 0;
    const length = parseFloat(quiltLength) || 0;
    const area = width * length;
    if (area <= 0 || total <= 0) return null;

    const currentRatePerSqIn = total / area;
    if (currentRatePerSqIn >= bocData.targetRatePerSqIn) return null;

    // Reverse-engineer implied hourly wage using the BOC formula
    const overheadPerProject = (bocData.monthlyOverhead || 0) / (bocData.projectsPerMonth || 10);
    const quiltingTimeMinutes = (area / bocData.sphRate) * 60;
    const totalTimeMinutes = quiltingTimeMinutes + (bocData.incidentalsMinutes || 0);
    const totalTimeHours = totalTimeMinutes / 60;
    const impliedHourly = totalTimeHours > 0 ? (total - overheadPerProject) / totalTimeHours : 0;
    const suggestedMinimum = bocData.targetRatePerSqIn * area;

    return { impliedHourly, targetHourly: bocData.targetHourlyWage, suggestedMinimum };
  }, [quiltWidth, quiltLength, total, bocData]);

  // ─────────────────────────────────────────────────────────────────────
  // SAVE HANDLER
  // ─────────────────────────────────────────────────────────────────────
  
  const handleSaveEstimate = async () => {
    // Validation
    if (!quiltWidth || !quiltLength) {
      alert("Please enter quilt dimensions");
      return;
    }

    if (!clientFirstName || !clientLastName) {
      alert("Please enter client name");
      return;
    }

    if (!settings) {
      alert("Settings not loaded");
      return;
    }

    setSaving(true);

    try {
      const today = getTodayDate();

      // Use existing estimate number if editing, otherwise get next atomically
      let estimateNumber: number;
      if (isEditMode && existingProject?.estimateNumber) {
        estimateNumber = existingProject.estimateNumber;
      } else {
        estimateNumber = await getNextEstimateNumberAtomic();
      }

      // Get bobbin details
      let bobbinName = "";
      let bobbinPrice = 0;
      if (isPaidTier && hasBobbinOptions && bobbinChoice) {
        const bobbinOption = settings.bobbinOptions?.find(
          (b) => b.name === bobbinChoice
        );
        bobbinName = bobbinOption?.name || "";
        bobbinPrice = bobbinOption?.price || 0;
      } else {
        bobbinName = "Manual Entry";
        bobbinPrice = parseFloat(bobbinPriceManual) || 0;
      }

      // Build estimate data snapshot
      const estimateData = {
        quiltArea:
          (parseFloat(quiltWidth) || 0) * (parseFloat(quiltLength) || 0),
        quiltingRate:
          quiltingType === "Custom Rate"
            ? parseFloat(customQuiltingRate) || 0
            : isPaidTier && hasQuiltingRates && quiltingType
            ? settings.pricingRates?.[
                quiltingType as keyof typeof settings.pricingRates
              ] || 0
            : parseFloat(quiltingRateManual) || 0,
        quiltingTotal,
        battingLengthNeeded:
          (parseFloat(quiltLength) || 0) +
          (parseFloat(battingLengthAddition) || 4),
        battingTotal,
        clientSuppliesBatting,
        bindingPerimeter:
          ((parseFloat(quiltWidth) || 0) + (parseFloat(quiltLength) || 0)) * 2,
        bindingRatePerInch:
          bindingType === "Top Attached Only"
            ? settings.pricingRates?.bindingTopAttached || 0.1
            : bindingType === "Fully Attached"
            ? settings.pricingRates?.bindingFullyAttached || 0.2
            : 0,
        bindingTotal,
        bobbinName,
        bobbinCount: parseInt(bobbinCount) || 0,
        bobbinPrice,
        bobbinTotal,
        extraCharges,
        extraChargesTotal,
        extraChargesTaxable,
        // Discount snapshot
        discountType: discountAmount > 0 ? discountType : undefined,
        discountValue: discountAmount > 0 ? (parseFloat(discountValue) || 0) : undefined,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        isDonation,
        subtotal,
        // Tax snapshot
        taxExempt,
        taxPrimaryRate: parseFloat(taxPrimaryRate) || 0,
        taxPrimaryLabel: settings.taxPrimaryLabel || "Sales Tax",
        taxPrimaryAmount,
        taxSecondaryRate: settings.taxSecondaryEnabled ? (parseFloat(taxSecondaryRate) || 0) : undefined,
        taxSecondaryLabel: settings.taxSecondaryEnabled ? settings.taxSecondaryLabel : undefined,
        taxSecondaryAmount: settings.taxSecondaryEnabled ? taxSecondaryAmount : undefined,
        taxTotalAmount: taxAmount,
        total,
        depositType: !isDonation && depositAmount > 0 ? depositType : undefined,
        depositPercentage:
          !isDonation && depositType === "percentage" ? parseFloat(depositValue) || 0 : undefined,
        depositFlat:
          !isDonation && depositType === "flat" ? parseFloat(depositValue) || 0 : undefined,
        depositAmount: isDonation ? 0 : depositAmount,
        balanceDue: isDonation ? total : balanceDue,
        createdAt:
          existingProject?.estimateData?.createdAt || new Date().toISOString(),
      };

      // Build project object with all form values
      const projectData = {
        stage: "Estimates" as const,
        estimateNumber,
        clientFirstName,
        clientLastName,
        clientEmail: clientEmail || undefined,
        clientPhone: clientPhone || undefined,
        clientStreet: clientStreet || undefined,
        clientCity: clientCity || undefined,
        clientState: clientState || undefined,
        clientPostalCode: clientPostalCode || undefined,
        clientCountry: clientCountry || undefined,
        description: description || undefined,
        cardLabel: description?.substring(0, 50) || undefined,
        quiltWidth: parseFloat(quiltWidth) || 0,
        quiltLength: parseFloat(quiltLength) || 0,
        requestedDateType,
        requestedCompletionDate:
          requestedDateType === "specific_date"
            ? requestedCompletionDate
            : undefined,
        quiltingType:
          isPaidTier && hasQuiltingRates
            ? quiltingType
            : quiltingType || "Manual Entry",
        customQuiltingRate:
          quiltingType === "Custom Rate"
            ? parseFloat(customQuiltingRate) || undefined
            : undefined,
        battingChoice:
          isPaidTier && hasBattingOptions
            ? battingChoice
            : battingChoice || "Manual Entry",
        battingLengthAddition,
        clientSuppliesBatting,
        bindingType,
        bobbinChoice:
          isPaidTier && hasBobbinOptions
            ? bobbinChoice
            : "Manual Entry",
        extraCharges,
        // Discount fields on project level
        discountType: discountAmount > 0 ? discountType : undefined,
        discountValue: discountAmount > 0 ? (parseFloat(discountValue) || 0) : undefined,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        isDonation,
        // Tax fields
        taxExempt,
        taxPrimaryRate: parseFloat(taxPrimaryRate) || 0,
        taxPrimaryAmount,
        taxSecondaryRate: settings.taxSecondaryEnabled ? (parseFloat(taxSecondaryRate) || 0) : undefined,
        taxSecondaryAmount: settings.taxSecondaryEnabled ? taxSecondaryAmount : undefined,
        taxTotalAmount: taxAmount,
        depositType: !isDonation && depositAmount > 0 ? depositType : undefined,
        depositPercentage:
          !isDonation && depositType === "percentage" ? parseFloat(depositValue) || 0 : undefined,
        depositAmount: isDonation ? 0 : depositAmount,
        depositPaid: !isDonation && depositReceivedToday && depositAmount > 0,
        depositPaidDate:
          !isDonation && depositReceivedToday && depositAmount > 0 ? today : undefined,
        depositPaidMethod:
          !isDonation && depositReceivedToday && depositAmount > 0
            ? depositPaymentMethod
            : undefined,
        depositPaidAmount:
          !isDonation && depositReceivedToday && depositAmount > 0 ? depositAmount : undefined,
        estimateData,
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode && existingProject) {
        // Reset Job Summary if estimate total changed after invoicing
        const jobSummaryNeedsReset =
          existingProject.invoiced === true &&
          Math.round(estimateData.total * 100) !== Math.round((existingProject.invoicedAmount || 0) * 100);

        if (jobSummaryNeedsReset) {
          (projectData as Partial<Project>).invoiced = false;
          (projectData as Partial<Project>).invoicedAmount = undefined;
          (projectData as Partial<Project>).invoicedDate = undefined;
        }

        // UPDATE existing project
        const updatedProject: Project = {
          ...existingProject,
          ...projectData,
        };

        const result = await storage.updateProject(
          updatedProject.id,
          updatedProject
        );

        if (!result.success) {
          console.error("Error updating project:", result.error);
          alert(
            "Error updating estimate: " + (result.error || "Unknown error")
          );
          return;
        }

        const donationMsg = isDonation ? " (Marked as Donation)" : "";
        const discountMsg = discountAmount > 0 ? ` Discount: ${formatCurrency(discountAmount)}.` : "";
        const depositMsg =
          depositReceivedToday && depositAmount > 0
            ? ` Deposit of ${formatCurrency(depositAmount)} recorded.`
            : "";
        const jobSummaryResetMsg = jobSummaryNeedsReset
          ? "\n\nEstimate total changed — Job Summary has been reset. Please re-confirm it in the Completed checklist."
          : "";
        alert(`Estimate #${estimateNumber} updated!${donationMsg}${discountMsg}${depositMsg}${jobSummaryResetMsg}`);
      } else {
        // CREATE new project
        const newProject: Project = {
          id: crypto.randomUUID(),
          intakeDate: today,
          notes: [],
          attachments: [],
          createdAt: new Date().toISOString(),
          ...projectData,
        };

        const result = await storage.addProject(newProject);

        if (!result.success) {
          console.error("Error adding project:", result.error);
          alert("Error saving estimate: " + (result.error || "Unknown error"));
          return;
        }

        const donationMsg = isDonation ? " (Marked as Donation)" : "";
        const discountMsg = discountAmount > 0 ? ` Discount: ${formatCurrency(discountAmount)}.` : "";
        const depositMsg =
          depositReceivedToday && depositAmount > 0
            ? ` Deposit of ${formatCurrency(depositAmount)} recorded.`
            : "";
        alert(`Estimate #${estimateNumber} saved!${donationMsg}${discountMsg}${depositMsg}`);
      }

      router.push("/board");
    } catch (error) {
      console.error("Error saving estimate:", error);
      alert("Error saving estimate. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-plum">
              {isEditMode ? "Edit Estimate" : "New Estimate"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {isEditMode ? (
                <>
                  Editing:{" "}
                  <span className="font-bold">
                    {existingProject?.clientFirstName}{" "}
                    {existingProject?.clientLastName}
                  </span>
                  {" • "}
                </>
              ) : null}
              Estimate{" "}
              <span className="font-bold text-gold">#{nextEstimateNumber}</span>
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
          >
            Back
          </button>
        </div>

        {/* Tier Status Card */}
        {settings && (
          <TierStatusCard
            isPaidTier={isPaidTier}
            hasQuiltingRates={!!hasQuiltingRates}
          />
        )}

        {/* Calculator Form */}
        <div className="bg-white border border-line rounded-card p-4 sm:p-6">
          {/* Client Information Section */}
          <ClientInfoSection
            clientFirstName={clientFirstName}
            setClientFirstName={setClientFirstName}
            clientLastName={clientLastName}
            setClientLastName={setClientLastName}
            clientEmail={clientEmail}
            setClientEmail={setClientEmail}
            clientPhone={clientPhone}
            onPhoneChange={handlePhoneChange}
            clientStreet={clientStreet}
            setClientStreet={setClientStreet}
            clientCity={clientCity}
            setClientCity={setClientCity}
            clientState={clientState}
            setClientState={setClientState}
            clientPostalCode={clientPostalCode}
            setClientPostalCode={setClientPostalCode}
            clientCountry={clientCountry}
            onCountryChange={handleCountryChange}
          />

          {/* Project Details Section */}
          <ProjectDetailsSection
            description={description}
            setDescription={setDescription}
            requestedDateType={requestedDateType}
            setRequestedDateType={setRequestedDateType}
            requestedCompletionDate={requestedCompletionDate}
            setRequestedCompletionDate={setRequestedCompletionDate}
            quiltWidth={quiltWidth}
            setQuiltWidth={setQuiltWidth}
            quiltLength={quiltLength}
            setQuiltLength={setQuiltLength}
          />

          {/* Pricing Section (Quilting, Batting, Binding, Bobbin) */}
          {settings && (
            <PricingSection
              settings={settings}
              isPaidTier={isPaidTier}
              hasQuiltingRates={!!hasQuiltingRates}
              hasBattingOptions={!!hasBattingOptions}
              hasBobbinOptions={!!hasBobbinOptions}
              quiltingType={quiltingType}
              setQuiltingType={setQuiltingType}
              quiltingRateManual={quiltingRateManual}
              setQuiltingRateManual={setQuiltingRateManual}
              customQuiltingRate={customQuiltingRate}
              setCustomQuiltingRate={setCustomQuiltingRate}
              clientSuppliesBatting={clientSuppliesBatting}
              setClientSuppliesBatting={setClientSuppliesBatting}
              battingChoice={battingChoice}
              setBattingChoice={setBattingChoice}
              battingPriceManual={battingPriceManual}
              setBattingPriceManual={setBattingPriceManual}
              battingLengthAddition={battingLengthAddition}
              setBattingLengthAddition={setBattingLengthAddition}
              bindingType={bindingType}
              setBindingType={setBindingType}
              bindingRateManual={bindingRateManual}
              setBindingRateManual={setBindingRateManual}
              bobbinChoice={bobbinChoice}
              setBobbinChoice={setBobbinChoice}
              bobbinCount={bobbinCount}
              setBobbinCount={setBobbinCount}
              bobbinPriceManual={bobbinPriceManual}
              setBobbinPriceManual={setBobbinPriceManual}
            />
          )}

          {/* Extra Charges Section */}
          <ExtraChargesSection
            extraCharges={extraCharges}
            newChargeName={newChargeName}
            setNewChargeName={setNewChargeName}
            newChargeAmount={newChargeAmount}
            setNewChargeAmount={setNewChargeAmount}
            newChargeTaxable={newChargeTaxable}
            setNewChargeTaxable={setNewChargeTaxable}
            onAddCharge={handleAddExtraCharge}
            onRemoveCharge={handleRemoveExtraCharge}
            formatCurrency={formatCurrency}
            currencySymbol={currencySymbol}
          />

          {/* Estimate Summary (Totals, Discount, Donation Toggle) */}
          {settings && (
            <EstimateSummary
              settings={settings}
              quiltingType={quiltingType}
              quiltingTotal={quiltingTotal}
              battingTotal={battingTotal}
              bindingTotal={bindingTotal}
              bobbinTotal={bobbinTotal}
              subtotal={subtotal}
              taxExempt={taxExempt}
              setTaxExempt={setTaxExempt}
              taxPrimaryRate={taxPrimaryRate}
              setTaxPrimaryRate={setTaxPrimaryRate}
              taxSecondaryRate={taxSecondaryRate}
              setTaxSecondaryRate={setTaxSecondaryRate}
              taxPrimaryAmount={taxPrimaryAmount}
              taxSecondaryAmount={taxSecondaryAmount}
              taxAmount={taxAmount}
              total={total}
              depositAmount={depositAmount}
              balanceDue={balanceDue}
              extraCharges={extraCharges}
              clientSuppliesBatting={clientSuppliesBatting}
              discountType={discountType}
              setDiscountType={setDiscountType}
              discountValue={discountValue}
              setDiscountValue={setDiscountValue}
              discountAmount={discountAmount}
              isDonation={isDonation}
              setIsDonation={setIsDonation}
              depositReceivedToday={depositReceivedToday}
              depositPaymentMethod={depositPaymentMethod}
              formatCurrency={formatCurrency}
              currencySymbol={currencySymbol}
            />
          )}

          {/* BOC Rate Warning — only shown when user owns BOC, has saved settings, and is undercharging */}
          {bocWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4">
              <p className="text-sm text-amber-800">
                <span className="font-bold">Heads up:</span> At this price you&apos;re
                earning approximately{" "}
                <span className="font-bold">{formatCurrency(bocWarning.impliedHourly)}/hr</span>
                {" "}&mdash; your BOC target is{" "}
                <span className="font-bold">{formatCurrency(bocWarning.targetHourly)}/hr</span>.
                Consider charging at least{" "}
                <span className="font-bold">{formatCurrency(bocWarning.suggestedMinimum)}</span>.
              </p>
            </div>
          )}

          {/* Deposit Configuration Section - hidden for donations (no payment to collect deposit on) */}
          {!isDonation && (
            <DepositSection
              depositType={depositType}
              setDepositType={setDepositType}
              depositValue={depositValue}
              setDepositValue={setDepositValue}
              depositReceivedToday={depositReceivedToday}
              setDepositReceivedToday={setDepositReceivedToday}
              depositPaymentMethod={depositPaymentMethod}
              setDepositPaymentMethod={setDepositPaymentMethod}
              depositAmount={depositAmount}
              balanceDue={balanceDue}
              formatCurrency={formatCurrency}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleSaveEstimate}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? `Update Estimate #${nextEstimateNumber}`
                : `Save Estimate #${nextEstimateNumber}`}
            </button>
            <button
              onClick={() => {
                if (
                  !quiltWidth ||
                  !quiltLength ||
                  !clientFirstName ||
                  !clientLastName
                ) {
                  alert("Please fill in required fields first");
                  return;
                }
                alert("Preview invoice coming soon!");
              }}
              className="flex-1 px-4 py-3 border-2 border-gold text-gold rounded-xl font-bold hover:bg-gold hover:text-white transition-colors"
            >
              Preview Invoice
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
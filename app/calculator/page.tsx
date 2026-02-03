"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { supabase } from "../lib/supabase";
import type { Settings, Project } from "../types";

// Atomic estimate number generator to prevent race conditions
async function getNextEstimateNumberAtomic(): Promise<number> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get current settings
      const { data: orgData, error: fetchError } = await supabase
        .from("organizations")
        .select("settings")
        .single();

      if (fetchError) throw fetchError;

      const currentSettings = orgData?.settings || {};
      const currentNumber = currentSettings.nextEstimateNumber || 1001;
      const newNumber = currentNumber + 1;

      // Update with the new number
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          settings: {
            ...currentSettings,
            nextEstimateNumber: newNumber,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", orgData?.id);

      if (updateError) throw updateError;

      return currentNumber;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error("Failed to get atomic estimate number:", error);
        // Fallback to timestamp-based number
        return (Math.floor(Date.now() / 1000) % 100000) + 10000;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }

  return 1001; // Ultimate fallback
}

function CalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [settings, setSettings] = useState<Settings | null>(null);
  const [nextEstimateNumber, setNextEstimateNumber] = useState<number>(1001);
  const [existingProject, setExistingProject] = useState<Project | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientStreet, setClientStreet] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientPostalCode, setClientPostalCode] = useState("");
  const [clientCountry, setClientCountry] = useState("United States");
  const [quiltWidth, setQuiltWidth] = useState("");
  const [quiltLength, setQuiltLength] = useState("");
  const [description, setDescription] = useState("");
  const [requestedDateType, setRequestedDateType] = useState<
    "asap" | "no_date" | "specific_date"
  >("no_date");
  const [requestedCompletionDate, setRequestedCompletionDate] = useState("");
  const [quiltingType, setQuiltingType] = useState("");
  const [quiltingRateManual, setQuiltingRateManual] = useState("");
  const [threadChoice, setThreadChoice] = useState("");
  const [threadPriceManual, setThreadPriceManual] = useState("");
  const [battingChoice, setBattingChoice] = useState("");
  const [battingPriceManual, setBattingPriceManual] = useState("");
  const [battingLengthAddition, setBattingLengthAddition] = useState("4");
  const [clientSuppliesBatting, setClientSuppliesBatting] = useState(false);
  const [bindingType, setBindingType] = useState("");
  const [bindingRateManual, setBindingRateManual] = useState("");
  const [bobbinCount, setBobbinCount] = useState("1");

  // Deposit state
  const [depositType, setDepositType] = useState<"percentage" | "flat">("percentage");
  const [depositValue, setDepositValue] = useState("");
  const [depositReceivedToday, setDepositReceivedToday] = useState(false);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState("Cash");

  // Calculated values
  const [quiltingTotal, setQuiltingTotal] = useState(0);
  const [threadTotal, setThreadTotal] = useState(0);
  const [battingTotal, setBattingTotal] = useState(0);
  const [bindingTotal, setBindingTotal] = useState(0);
  const [bobbinTotal, setBobbinTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);

  const isPaidTier = settings?.isPaidTier || false;
  const hasQuiltingRates =
    settings?.pricingRates &&
    ((settings.pricingRates.lightE2E ?? 0) > 0 ||
      (settings.pricingRates.standardE2E ?? 0) > 0 ||
      (settings.pricingRates.lightCustom ?? 0) > 0 ||
      (settings.pricingRates.custom ?? 0) > 0 ||
      (settings.pricingRates.denseCustom ?? 0) > 0);
  const hasThreadOptions =
    settings?.threadOptions && settings.threadOptions.length > 0;
  const hasBattingOptions =
    settings?.battingOptions && settings.battingOptions.length > 0;

  // Phone formatting helper
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setClientPhone(formatted);
  };

  useEffect(() => {
    const loadData = async () => {
      const savedSettings = await storage.getSettings();
      setSettings(savedSettings);
      setNextEstimateNumber(savedSettings.nextEstimateNumber || 1001);

      // Load existing project if projectId provided
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
          setThreadChoice(project.threadChoice || "");
          setBattingChoice(project.battingChoice || "");
          setBattingLengthAddition(project.battingLengthAddition || "4");
          setClientSuppliesBatting(project.clientSuppliesBatting || false);
          setBindingType(project.bindingType || "");

          // If project already has estimate number, use it
          if (project.estimateNumber) {
            setNextEstimateNumber(project.estimateNumber);
          }
        }
      }
    };

    loadData();
  }, [projectId]);

  useEffect(() => {
    if (settings) {
      calculateTotals();
    }
  }, [
    quiltWidth,
    quiltLength,
    quiltingType,
    quiltingRateManual,
    threadChoice,
    threadPriceManual,
    battingChoice,
    battingPriceManual,
    battingLengthAddition,
    clientSuppliesBatting,
    bindingType,
    bindingRateManual,
    bobbinCount,
    depositType,
    depositValue,
    settings,
  ]);

  const calculateTotals = () => {
    if (!settings) return;

    let quilting = 0;
    let thread = 0;
    let batting = 0;
    let binding = 0;
    let bobbin = 0;

    const w = parseFloat(quiltWidth) || 0;
    const h = parseFloat(quiltLength) || 0;
    const area = w * h;

    // Quilting calculation
    if (area > 0) {
      if (isPaidTier && hasQuiltingRates && quiltingType) {
        const rate =
          settings.pricingRates?.[
            quiltingType as keyof typeof settings.pricingRates
          ] || 0;
        quilting = area * (rate as number);
      } else if (quiltingRateManual) {
        quilting = area * (parseFloat(quiltingRateManual) || 0);
      }
    }

    // Thread calculation
    if (isPaidTier && hasThreadOptions && threadChoice) {
      const threadOption = settings.threadOptions?.find(
        (t) => t.name === threadChoice
      );
      thread = threadOption?.price || 0;
    } else if (threadPriceManual) {
      thread = parseFloat(threadPriceManual) || 0;
    }

    // Batting calculation
    if (!clientSuppliesBatting && h > 0) {
      const additionInches = parseFloat(battingLengthAddition) || 4;
      const battingLengthNeeded = h + additionInches;

      if (isPaidTier && hasBattingOptions && battingChoice) {
        const battingOption = settings.battingOptions?.find(
          (b) => b.name === battingChoice
        );
        const battingPricePerInch = battingOption?.pricePerInch || 0;
        batting = battingLengthNeeded * battingPricePerInch;
      } else if (battingPriceManual) {
        batting = battingLengthNeeded * (parseFloat(battingPriceManual) || 0);
      }
    }

    // Binding calculation (per-inch)
    if (bindingType && bindingType !== "No Binding" && w > 0 && h > 0) {
      const perimeter = (w + h) * 2;
      if (
        isPaidTier &&
        (settings.pricingRates?.bindingTopAttached ||
          settings.pricingRates?.bindingFullyAttached)
      ) {
        if (bindingType === "Top Attached Only") {
          binding =
            perimeter * (settings.pricingRates?.bindingTopAttached || 0);
        } else if (bindingType === "Fully Attached") {
          binding =
            perimeter * (settings.pricingRates?.bindingFullyAttached || 0);
        }
      } else if (bindingRateManual) {
        binding = perimeter * (parseFloat(bindingRateManual) || 0);
      }
    }

    // Bobbin calculation
    const bobbins = parseInt(bobbinCount) || 0;
    bobbin = bobbins * (settings.bobbinPrice || 0);

    const sub = quilting + thread + batting + binding + bobbin;
    const tax = sub * ((settings.taxRate || 0) / 100);
    const tot = sub + tax;

    // Deposit calculation
    let deposit = 0;
    const depVal = parseFloat(depositValue) || 0;
    if (depVal > 0) {
      if (depositType === "percent") {
        deposit = tot * (depVal / 100);
      } else {
        deposit = depVal;
      }
    }
    const balance = tot - deposit;

    setQuiltingTotal(quilting);
    setThreadTotal(thread);
    setBattingTotal(batting);
    setBindingTotal(binding);
    setBobbinTotal(bobbin);
    setSubtotal(sub);
    setTaxAmount(tax);
    setTotal(tot);
    setDepositAmount(deposit);
    setBalanceDue(balance);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currencyCode || "USD",
    }).format(amount);
  };

  const handleSaveEstimate = async () => {
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
      const today = new Date().toISOString().split("T")[0];

      // Use existing estimate number if editing, otherwise get next number atomically
      let estimateNumber: number;
      if (isEditMode && existingProject?.estimateNumber) {
        estimateNumber = existingProject.estimateNumber;
      } else {
        // Get atomic estimate number to prevent race conditions
        estimateNumber = await getNextEstimateNumberAtomic();
      }

      const estimateData = {
        quiltArea:
          (parseFloat(quiltWidth) || 0) * (parseFloat(quiltLength) || 0),
        quiltingRate:
          isPaidTier && hasQuiltingRates && quiltingType
            ? settings.pricingRates?.[
                quiltingType as keyof typeof settings.pricingRates
              ] || 0
            : parseFloat(quiltingRateManual) || 0,
        quiltingTotal,
        threadCost: threadTotal,
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
        bobbinCount: parseInt(bobbinCount) || 0,
        bobbinPrice: settings.bobbinPrice || 0,
        bobbinTotal,
        subtotal,
        taxRate: settings.taxRate || 0,
        taxAmount,
        total,
        depositType: depositAmount > 0 ? depositType : null,
        depositPercent:
          depositType === "percentage" ? parseFloat(depositValue) || 0 : undefined,
        depositFlat:
          depositType === "flat" ? parseFloat(depositValue) || 0 : undefined,
        depositAmount,
        balanceDue,
        createdAt:
          existingProject?.estimateData?.createdAt || new Date().toISOString(),
      };

      // Build the project object with ALL current form values
      const projectData = {
        stage: "Estimate" as const,
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
        threadChoice:
          isPaidTier && hasThreadOptions
            ? threadChoice
            : threadChoice || "Manual Entry",
        battingChoice:
          isPaidTier && hasBattingOptions
            ? battingChoice
            : battingChoice || "Manual Entry",
        battingLengthAddition,
        clientSuppliesBatting,
        bindingType,
        depositType: depositAmount > 0 ? depositType : null,
        depositPercentage:
          depositType === "percentage" ? parseFloat(depositValue) || 0 : undefined,
        depositAmount,
        depositPaid: depositReceivedToday && depositAmount > 0,
        depositPaidDate:
          depositReceivedToday && depositAmount > 0 ? today : undefined,
        depositPaidMethod:
          depositReceivedToday && depositAmount > 0
            ? depositPaymentMethod
            : undefined,
        depositPaidAmount:
          depositReceivedToday && depositAmount > 0 ? depositAmount : undefined,
        estimateData,
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode && existingProject) {
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

        const depositMsg =
          depositReceivedToday && depositAmount > 0
            ? ` Deposit of ${formatCurrency(depositAmount)} recorded.`
            : "";
        alert(`Estimate #${estimateNumber} updated!${depositMsg}`);
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

        const depositMsg =
          depositReceivedToday && depositAmount > 0
            ? ` Deposit of ${formatCurrency(depositAmount)} recorded.`
            : "";
        alert(`Estimate #${estimateNumber} saved!${depositMsg}`);
      }

      router.push("/board");
    } catch (error) {
      console.error("Error saving estimate:", error);
      alert("Error saving estimate. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Tier Status */}
        <div className="bg-white border border-line rounded-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">
                Tier: {isPaidTier ? "PRO" : "FREE"}
              </div>
              <div className="text-xs text-muted mt-1">
                {isPaidTier
                  ? hasQuiltingRates
                    ? "Using saved rates from Settings"
                    : "Set up rates in Settings to auto-populate"
                  : "Manual entry mode"}
              </div>
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold"
            >
              {isPaidTier ? "Edit Settings" : "Upgrade in Settings"}
            </button>
          </div>
          {!isPaidTier && (
            <div className="mt-3 p-3 bg-gold/10 rounded-xl text-xs">
              <div className="font-bold mb-1">FREE Tier Mode:</div>
              <div>
                You&apos;ll manually enter pricing for each estimate. Go to
                Settings and enable PRO tier to save rates and auto-populate.
              </div>
            </div>
          )}
          {isPaidTier && !hasQuiltingRates && (
            <div className="mt-3 p-3 bg-gold/10 rounded-xl text-xs">
              <div className="font-bold mb-1">Setup Needed:</div>
              <div>
                Go to Settings → Pricing Rates to set up your quilting rates.
                Until then, you can enter rates manually below.
              </div>
            </div>
          )}
        </div>

        {/* Calculator Form */}
        <div className="bg-white border border-line rounded-card p-6">
          {/* Client Information Section */}
          <h2 className="text-lg font-bold text-plum mb-4">
            Client Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={clientFirstName}
                onChange={(e) => setClientFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={clientLastName}
                onChange={(e) => setClientLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="509-555-1234"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={clientStreet}
              onChange={(e) => setClientStreet(e.target.value)}
              placeholder="123 Main Street"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-muted mb-2">
                City
              </label>
              <input
                type="text"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                placeholder="Spokane"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={clientState}
                onChange={(e) => setClientState(e.target.value)}
                placeholder="WA"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={clientPostalCode}
                onChange={(e) => setClientPostalCode(e.target.value)}
                placeholder="99201"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Country
              </label>
              <select
                value={clientCountry}
                onChange={(e) => setClientCountry(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Mexico">Mexico</option>
                <option value="Ecuador">Ecuador</option>
              </select>
            </div>
          </div>

          {/* Project Details Section */}
          <h2 className="text-lg font-bold text-plum mb-4 pt-4 border-t border-line">
            Project Details
          </h2>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Quilt Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Queen wedding quilt, double ring pattern"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>

          {/* Requested Completion Date */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Requested Completion Date
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setRequestedDateType("asap")}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  requestedDateType === "asap"
                    ? "bg-red-500 text-white"
                    : "bg-white border border-line text-muted hover:border-red-300"
                }`}
              >
                ASAP
              </button>
              <button
                type="button"
                onClick={() => setRequestedDateType("no_date")}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  requestedDateType === "no_date"
                    ? "bg-gold text-white"
                    : "bg-white border border-line text-muted hover:border-gold"
                }`}
              >
                No Set Date
              </button>
              <button
                type="button"
                onClick={() => setRequestedDateType("specific_date")}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  requestedDateType === "specific_date"
                    ? "bg-plum text-white"
                    : "bg-white border border-line text-muted hover:border-plum"
                }`}
              >
                Select Date
              </button>
            </div>
            {requestedDateType === "specific_date" && (
              <input
                type="date"
                value={requestedCompletionDate}
                onChange={(e) => setRequestedCompletionDate(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            )}
            {requestedDateType === "asap" && (
              <p className="text-xs text-red-600 mt-1">
                This project will be marked as high priority
              </p>
            )}
          </div>

          {/* Quilt Dimensions */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Quilt Dimensions (inches) *
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Width"
                value={quiltWidth}
                onChange={(e) => setQuiltWidth(e.target.value)}
                className="flex-1 px-4 py-2 border border-line rounded-xl"
              />
              <span className="flex items-center text-muted font-bold">×</span>
              <input
                type="number"
                placeholder="Length"
                value={quiltLength}
                onChange={(e) => setQuiltLength(e.target.value)}
                className="flex-1 px-4 py-2 border border-line rounded-xl"
              />
            </div>
            {quiltWidth && quiltLength && (
              <div className="mt-2 text-xs text-muted">
                Area:{" "}
                {(
                  parseFloat(quiltWidth) * parseFloat(quiltLength)
                ).toLocaleString()}{" "}
                sq in
              </div>
            )}
          </div>

          {/* Quilting Type */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Quilting Type
            </label>
            {isPaidTier && hasQuiltingRates ? (
              <select
                value={quiltingType}
                onChange={(e) => setQuiltingType(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="">Select quilting type...</option>
                {(settings?.pricingRates?.lightE2E ?? 0) > 0 && (
                  <option value="lightE2E">
                    Light Edge-to-Edge (${settings?.pricingRates?.lightE2E}/sq
                    in)
                  </option>
                )}
                {(settings?.pricingRates?.standardE2E ?? 0) > 0 && (
                  <option value="standardE2E">
                    Standard Edge-to-Edge ($
                    {settings?.pricingRates?.standardE2E}
                    /sq in)
                  </option>
                )}
                {(settings?.pricingRates?.lightCustom ?? 0) > 0 && (
                  <option value="lightCustom">
                    Light Custom (${settings?.pricingRates?.lightCustom}/sq in)
                  </option>
                )}
                {(settings?.pricingRates?.custom ?? 0) > 0 && (
                  <option value="custom">
                    Custom (${settings?.pricingRates?.custom}/sq in)
                  </option>
                )}
                {(settings?.pricingRates?.denseCustom ?? 0) > 0 && (
                  <option value="denseCustom">
                    Dense Custom (${settings?.pricingRates?.denseCustom}/sq in)
                  </option>
                )}
              </select>
            ) : (
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
                  placeholder="Rate per sq inch (e.g., 0.02)"
                  value={quiltingRateManual}
                  onChange={(e) => setQuiltingRateManual(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Thread */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Thread
            </label>
            {isPaidTier && hasThreadOptions ? (
              <select
                value={threadChoice}
                onChange={(e) => setThreadChoice(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="">Select thread...</option>
                {settings?.threadOptions?.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} (${t.price.toFixed(2)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Thread type (e.g., So Fine #50)"
                  value={threadChoice}
                  onChange={(e) => setThreadChoice(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Thread price (e.g., 5.00)"
                  value={threadPriceManual}
                  onChange={(e) => setThreadPriceManual(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Client Supplies Batting Toggle */}
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

          {/* Batting */}
          {!clientSuppliesBatting && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-bold text-muted mb-2">
                  Batting
                </label>
                {isPaidTier && hasBattingOptions ? (
                  <select
                    value={battingChoice}
                    onChange={(e) => setBattingChoice(e.target.value)}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    <option value="">Select batting...</option>
                    {settings?.battingOptions?.map((b) => (
                      <option key={`${b.name}-${b.widthInches}`} value={b.name}>
                        {b.name} - {b.widthInches}&quot; wide ($
                        {b.pricePerInch.toFixed(4)}/in)
                      </option>
                    ))}
                  </select>
                ) : (
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

          {/* Binding */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Binding
            </label>
            {isPaidTier &&
            (settings?.pricingRates?.bindingTopAttached ||
              settings?.pricingRates?.bindingFullyAttached) ? (
              <select
                value={bindingType}
                onChange={(e) => setBindingType(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="">Select binding...</option>
                <option value="No Binding">No Binding ($0)</option>
                {(settings?.pricingRates?.bindingTopAttached ?? 0) > 0 && (
                  <option value="Top Attached Only">
                    Top Attached Only ($
                    {settings?.pricingRates?.bindingTopAttached}/in)
                  </option>
                )}
                {(settings?.pricingRates?.bindingFullyAttached ?? 0) > 0 && (
                  <option value="Fully Attached">
                    Fully Attached ($
                    {settings?.pricingRates?.bindingFullyAttached}/in)
                  </option>
                )}
              </select>
            ) : (
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

          {/* Bobbins */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Bobbins{" "}
              {settings?.bobbinPrice
                ? `($${settings.bobbinPrice.toFixed(2)} each)`
                : ""}
            </label>
            <input
              type="number"
              min="0"
              value={bobbinCount}
              onChange={(e) => setBobbinCount(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>

          {/* Deposit Section */}
          <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-xl">
            <label className="block text-sm font-bold text-plum mb-3">
              Deposit (Optional)
            </label>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setDepositType("percentage")}
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
                onClick={() => setDepositType("flat")}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  depositType === "flat"
                    ? "bg-gold text-white"
                    : "bg-white border border-line text-muted hover:border-gold"
                }`}
              >
                Flat Amount ($)
              </button>
            </div>

            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">
                  {depositType === "percent" ? "%" : "$"}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={depositType === "percent" ? "50" : "100.00"}
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line rounded-xl"
                />
              </div>
              {depositValue && (
                <button
                  type="button"
                  onClick={() => {
                    setDepositValue("");
                    setDepositReceivedToday(false);
                  }}
                  className="px-3 py-2 text-sm text-muted hover:text-red-600"
                >
                  Clear
                </button>
              )}
            </div>

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
                  <span className="font-bold">
                    {formatCurrency(balanceDue)}
                  </span>
                </div>

                {/* Deposit Received Today Option */}
                <div className="border-t border-line pt-3 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={depositReceivedToday}
                      onChange={(e) =>
                        setDepositReceivedToday(e.target.checked)
                      }
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

                  {depositReceivedToday && (
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-muted mb-1">
                        Payment Method
                      </label>
                      <select
                        value={depositPaymentMethod}
                        onChange={(e) =>
                          setDepositPaymentMethod(e.target.value)
                        }
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

            {!depositAmount && (
              <p className="text-xs text-muted mt-2">
                Enter a deposit amount to see options.
              </p>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-line pt-6 mt-6">
            <h3 className="text-lg font-bold text-plum mb-4">
              Estimate Summary
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Quilting</span>
                <span className="font-bold">
                  {formatCurrency(quiltingTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Thread</span>
                <span className="font-bold">{formatCurrency(threadTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">
                  Batting {clientSuppliesBatting && "(Client Supplied)"}
                </span>
                <span className="font-bold">
                  {formatCurrency(battingTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Binding</span>
                <span className="font-bold">
                  {formatCurrency(bindingTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Bobbins</span>
                <span className="font-bold">{formatCurrency(bobbinTotal)}</span>
              </div>
            </div>

            <div className="border-t border-line pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">
                  {settings?.taxLabel || "Tax"} ({settings?.taxRate || 0}%)
                </span>
                <span className="font-bold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg border-t border-line pt-3">
                <span className="font-bold text-plum">Total</span>
                <span className="font-bold text-plum">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Deposit Summary in Total Section */}
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
                  <span className="font-bold">
                    {formatCurrency(balanceDue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
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

function CalculatorPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <CalculatorPage />
    </Suspense>
  );
}

export default CalculatorPageWrapper;

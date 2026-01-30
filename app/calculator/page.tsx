"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import type { Settings } from "../types";

function CalculatorPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isPaidTier, setIsPaidTier] = useState(false);

  // Form state
  const [quiltWidth, setQuiltWidth] = useState("");
  const [quiltLength, setQuiltLength] = useState("");
  const [quiltingType, setQuiltingType] = useState("");
  const [threadChoice, setThreadChoice] = useState("");
  const [battingChoice, setBattingChoice] = useState("");
  const [battingLengthAddition, setBattingLengthAddition] = useState("4");
  const [clientSuppliesBatting, setClientSuppliesBatting] = useState(false);
  const [bindingType, setBindingType] = useState("");
  const [bobbinCount, setBobbinCount] = useState("1");

  // Calculated values
  const [quiltingTotal, setQuiltingTotal] = useState(0);
  const [threadTotal, setThreadTotal] = useState(0);
  const [battingTotal, setBattingTotal] = useState(0);
  const [bindingTotal, setBindingTotal] = useState(0);
  const [bobbinTotal, setBobbinTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const savedSettings = storage.getSettings();
    setSettings(savedSettings);
    setIsPaidTier(savedSettings.isPaidTier || false);
  }, []);

  useEffect(() => {
    if (settings) {
      calculateTotals();
    }
  }, [
    quiltWidth,
    quiltLength,
    quiltingType,
    threadChoice,
    battingChoice,
    battingLengthAddition,
    clientSuppliesBatting,
    bindingType,
    bobbinCount,
    settings,
  ]);

  const calculateTotals = () => {
    if (!settings) return;

    let quilting = 0;
    let thread = 0;
    let batting = 0;
    let binding = 0;
    let bobbin = 0;

    // Quilting calculation
    const w = parseFloat(quiltWidth) || 0;
    const h = parseFloat(quiltLength) || 0;
    const area = w * h;

    if (quiltingType && area > 0) {
      const rate =
        settings.pricingRates?.[
          quiltingType as keyof typeof settings.pricingRates
        ] || 0;
      quilting = area * rate;
    }

    // Thread calculation
    if (threadChoice) {
      const threadOption = settings.threadOptions?.find(
        (t) => t.name === threadChoice
      );
      thread = threadOption?.price || 0;
    }

    // Batting calculation
    if (battingChoice && !clientSuppliesBatting) {
      const battingOption = settings.battingOptions?.find(
        (b) => b.name === battingChoice
      );
      const battingWidth = battingOption?.widthInches || 0;
      const battingPricePerInch = battingOption?.pricePerInch || 0;
      const additionInches = parseFloat(battingLengthAddition) || 4;
      const battingLengthNeeded = h + additionInches;
      batting = battingLengthNeeded * battingPricePerInch;
    }

    // Binding calculation (per-inch)
    if (bindingType && w > 0 && h > 0) {
      const perimeter = (w + h) * 2;
      if (bindingType === "Top Attached Only") {
        binding =
          perimeter * (settings.pricingRates?.bindingTopAttached || 0.1);
      } else if (bindingType === "Fully Attached") {
        binding =
          perimeter * (settings.pricingRates?.bindingFullyAttached || 0.2);
      }
    }

    // Bobbin calculation
    const bobbins = parseInt(bobbinCount) || 0;
    bobbin = bobbins * (settings.bobbinPrice || 0);

    const sub = quilting + thread + batting + binding + bobbin;
    const tax = sub * ((settings.taxRate || 0) / 100);
    const tot = sub + tax;

    setQuiltingTotal(quilting);
    setThreadTotal(thread);
    setBattingTotal(batting);
    setBindingTotal(binding);
    setBobbinTotal(bobbin);
    setSubtotal(sub);
    setTaxAmount(tax);
    setTotal(tot);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-plum">Pricing Calculator</h1>
            <p className="text-sm text-muted mt-1">
              Create estimate for new project
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
          >
            Back
          </button>
        </div>

        {/* Tier Toggle */}
        <div className="bg-white border border-line rounded-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">
                Tier: {isPaidTier ? "PAID" : "FREE"}
              </div>
              <div className="text-xs text-muted mt-1">
                {isPaidTier
                  ? "Settings auto-populate"
                  : "Manual entry required"}
              </div>
            </div>
            <button
              onClick={() => setIsPaidTier(!isPaidTier)}
              className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold"
            >
              Toggle Tier
            </button>
          </div>
          {!isPaidTier && (
            <div className="mt-3 p-3 bg-gold/10 rounded-xl text-xs">
              <div className="font-bold mb-1">FREE Tier Note:</div>
              <div>
                You'll manually enter pricing for each estimate. Upgrade to PAID
                to save rates and auto-populate.
              </div>
            </div>
          )}
        </div>

        {/* Calculator Form */}
        <div className="bg-white border border-line rounded-card p-6">
          <h2 className="text-lg font-bold text-plum mb-4">Project Details</h2>

          {/* Quilt Dimensions */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Quilt Dimensions (inches)
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
                {(parseFloat(quiltWidth) * parseFloat(quiltLength)).toFixed(0)}{" "}
                sq in
              </div>
            )}
          </div>

          {/* Quilting Type */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Quilting Type
            </label>
            {isPaidTier && settings?.pricingRates ? (
              <select
                value={quiltingType}
                onChange={(e) => setQuiltingType(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="">Select quilting type...</option>
                <option value="lightE2E">
                  Light Edge-to-Edge (${settings.pricingRates.lightE2E || 0}/sq
                  in)
                </option>
                <option value="standardE2E">
                  Standard Edge-to-Edge ($
                  {settings.pricingRates.standardE2E || 0}/sq in)
                </option>
                <option value="lightCustom">
                  Light Custom (${settings.pricingRates.lightCustom || 0}/sq in)
                </option>
                <option value="custom">
                  Custom (${settings.pricingRates.custom || 0}/sq in)
                </option>
                <option value="denseCustom">
                  Dense Custom (${settings.pricingRates.denseCustom || 0}/sq in)
                </option>
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter quilting type manually"
                value={quiltingType}
                onChange={(e) => setQuiltingType(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            )}
          </div>

          {/* Thread */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Thread
            </label>
            {isPaidTier &&
            settings?.threadOptions &&
            settings.threadOptions.length > 0 ? (
              <select
                value={threadChoice}
                onChange={(e) => setThreadChoice(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="">Select thread...</option>
                {settings.threadOptions.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} (${t.price})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter thread choice manually"
                value={threadChoice}
                onChange={(e) => setThreadChoice(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
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
                {isPaidTier &&
                settings?.battingOptions &&
                settings.battingOptions.length > 0 ? (
                  <select
                    value={battingChoice}
                    onChange={(e) => setBattingChoice(e.target.value)}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    <option value="">Select batting...</option>
                    {settings.battingOptions.map((b) => (
                      <option key={`${b.name}-${b.widthInches}`} value={b.name}>
                        {b.name} - {b.widthInches}" wide (${b.pricePerInch}/in)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter batting choice manually"
                    value={battingChoice}
                    onChange={(e) => setBattingChoice(e.target.value)}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
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
            <select
              value={bindingType}
              onChange={(e) => setBindingType(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            >
              <option value="">Select binding...</option>
              <option value="No Binding">No Binding ($0)</option>
              <option value="Top Attached Only">
                Top Attached Only ($
                {settings?.pricingRates?.bindingTopAttached || 0.1}/in)
              </option>
              <option value="Fully Attached">
                Fully Attached ($
                {settings?.pricingRates?.bindingFullyAttached || 0.2}/in)
              </option>
            </select>
          </div>

          {/* Bobbins */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Bobbins
            </label>
            <input
              type="number"
              min="0"
              value={bobbinCount}
              onChange={(e) => setBobbinCount(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-line pt-6 mt-6">
            <h3 className="text-lg font-bold text-plum mb-4">Estimate</h3>

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
                <span className="text-muted">Batting</span>
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
                  Tax ({settings?.taxRate || 0}%)
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
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.push("/board")}
              className="flex-1 px-4 py-3 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
            >
              Save & Go to Board
            </button>
            <button
              onClick={() => alert("Preview invoice coming soon!")}
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

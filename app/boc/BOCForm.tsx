"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Toast from "../components/Toast";
import { useAuth } from "../lib/auth-context";
import { getBOCSettings, saveBOCSettings } from "../lib/storage/boc";
import { getBOCMode, type BOCMode } from "../lib/storage/boc-mode";
import { getBOCPurchaseStatus, type BOCPurchaseStatus } from "../lib/storage/boc-stripe";
import { BETA_TESTER_EMAILS } from "../lib/server-subscription";
import type { BOCSettings, ExperienceLevel, OverheadItem, IncidentalItem } from "../types";
import { DEFAULT_BOC_SETTINGS, DEFAULT_OVERHEAD_ITEMS, DEFAULT_INCIDENTAL_ITEMS, SPH_RATES } from "../types";
import {
  calculateMinimumRate,
  type BOCCalculationResults,
} from "./utils/calculations";
import RateCalculatorSection from "./components/RateCalculatorSection";
import OverheadSection from "./components/OverheadSection";
import IncidentalsSection from "./components/IncidentalsSection";
import ResultsCard from "./components/ResultsCard";
import PerformanceDashboard from "./components/PerformanceDashboard";
import DonatedQuiltsSection from "./components/DonatedQuiltsSection";

const BOC_SUBSCRIBER_PRICE = process.env.NEXT_PUBLIC_STRIPE_BOC_SUBSCRIBER_PRICE_ID;
const BOC_STANDALONE_PRICE = process.env.NEXT_PUBLIC_STRIPE_BOC_STANDALONE_PRICE_ID;

interface BOCFormProps {
  serverPurchased?: boolean;
}

export default function BOCForm({ serverPurchased = false }: BOCFormProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // ── Loading / saving state ──────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Mode + purchase detection ───────────────────────────────────────
  const [bocMode, setBocMode] = useState<BOCMode>({
    isConnected: false,
    hasProjects: false,
    isSubscribed: false,
  });
  const [forceStandalone, setForceStandalone] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<BOCPurchaseStatus>({
    hasPurchased: false,
    purchaseDate: null,
  });

  // ── Form state ─────────────────────────────────────────────────────
  const [targetHourlyWage, setTargetHourlyWage] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("experienced");
  const [projectsPerMonth, setProjectsPerMonth] = useState("10");
  const [avgProjectSize, setAvgProjectSize] = useState("6000");

  // Array-based items
  const [overheadItems, setOverheadItems] = useState<OverheadItem[]>(DEFAULT_OVERHEAD_ITEMS);
  const [incidentalItems, setIncidentalItems] = useState<IncidentalItem[]>(DEFAULT_INCIDENTAL_ITEMS);

  // ── Computed results ────────────────────────────────────────────────
  const [results, setResults] = useState<BOCCalculationResults | null>(null);

  // ── Derived values ──────────────────────────────────────────────────
  const sphRate = SPH_RATES[experienceLevel];

  const overheadTotal = useMemo(
    () => overheadItems.reduce((sum, item) => sum + (item.amount || 0), 0),
    [overheadItems]
  );

  const incidentalsTotal = useMemo(
    () => incidentalItems.reduce((sum, item) => sum + (item.minutes || 0), 0),
    [incidentalItems]
  );

  // ── Load saved settings + mode + purchase status ────────────────────
  useEffect(() => {
    async function load() {
      try {
        const promises: [Promise<BOCSettings>, Promise<BOCMode>, Promise<BOCPurchaseStatus | null>] = [
          getBOCSettings(),
          getBOCMode(),
          user ? getBOCPurchaseStatus(user.id) : Promise.resolve(null),
        ];

        const [saved, mode, purchase] = await Promise.all(promises);
        applySettings(saved);
        setBocMode(mode);
        if (purchase) setPurchaseStatus(purchase);
      } catch (err) {
        console.error("Error loading BOC settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Show toast on successful purchase redirect
  useEffect(() => {
    if (searchParams.get("purchase") === "success") {
      setToast({ message: "BOC purchased! Performance tracking unlocked.", type: "success" });
    }
  }, [searchParams]);

  function applySettings(s: BOCSettings) {
    setTargetHourlyWage(s.targetHourlyWage ? String(s.targetHourlyWage) : "");
    setExperienceLevel(s.experienceLevel);
    setProjectsPerMonth(s.projectsPerMonth ? String(s.projectsPerMonth) : "10");
    setAvgProjectSize(s.avgProjectSize ? String(s.avgProjectSize) : "6000");
    setOverheadItems(s.overheadItems.length > 0 ? s.overheadItems : DEFAULT_OVERHEAD_ITEMS);
    setIncidentalItems(s.incidentalsItems.length > 0 ? s.incidentalsItems : DEFAULT_INCIDENTAL_ITEMS);
    setForceStandalone(s.forceStandaloneMode);
  }

  // ── Auto-calculate on every input change ────────────────────────────
  useEffect(() => {
    const res = calculateMinimumRate({
      targetHourlyWage: parseFloat(targetHourlyWage) || 0,
      sphRate,
      monthlyOverhead: overheadTotal,
      projectsPerMonth: parseFloat(projectsPerMonth) || 0,
      incidentalsMinutes: incidentalsTotal,
      avgProjectSize: parseFloat(avgProjectSize) || 0,
    });
    setResults(res);
  }, [
    targetHourlyWage,
    sphRate,
    overheadTotal,
    projectsPerMonth,
    incidentalsTotal,
    avgProjectSize,
  ]);

  // ── Save handler ────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const settings: BOCSettings = {
        targetHourlyWage: parseFloat(targetHourlyWage) || 0,
        experienceLevel,
        sphRate,
        monthlyOverhead: overheadTotal,
        overheadItems,
        incidentalsMinutes: incidentalsTotal,
        incidentalsItems: incidentalItems,
        projectsPerMonth: parseFloat(projectsPerMonth) || 0,
        avgProjectSize: parseFloat(avgProjectSize) || 0,
        forceStandaloneMode: forceStandalone,
      };

      const result = await saveBOCSettings(settings);
      if (result.success) {
        setToast({ message: "Settings saved!", type: "success" });
      } else {
        setToast({
          message: result.error || "Failed to save settings",
          type: "error",
        });
      }
    } catch (err) {
      setToast({ message: "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
    }
  }, [
    targetHourlyWage,
    experienceLevel,
    sphRate,
    overheadTotal,
    overheadItems,
    incidentalsTotal,
    incidentalItems,
    projectsPerMonth,
    avgProjectSize,
    forceStandalone,
  ]);

  // ── Purchase handler ────────────────────────────────────────────────
  const handlePurchase = useCallback(
    async (priceId: string) => {
      if (!user) return;
      setPurchasing(true);
      try {
        const res = await fetch("/api/boc/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setToast({
            message: data.error || "Failed to start checkout",
            type: "error",
          });
          setPurchasing(false);
        }
      } catch (err) {
        setToast({ message: "Failed to start checkout", type: "error" });
        setPurchasing(false);
      }
    },
    [user]
  );

  // ── Derived: effective mode (respects force-standalone toggle) ──────
  const effectiveMode: BOCMode = forceStandalone
    ? { isConnected: false, hasProjects: false, isSubscribed: false }
    : bocMode;

  // ── Derived: should show dashboards ─────────────────────────────────
  // Server-side check is authoritative; client-side is a fallback for UX
  const isBetaTester = user?.email ? BETA_TESTER_EMAILS.includes(user.email) : false;
  const showDashboards = serverPurchased || purchaseStatus.hasPurchased || isBetaTester;

  // ── Force-standalone toggle handler (saves immediately) ────────────
  const isBetaMode = process.env.NEXT_PUBLIC_ENABLE_BETA_MODE === "true";

  const handleForceStandaloneToggle = useCallback(async (checked: boolean) => {
    setForceStandalone(checked);
    try {
      const settings: BOCSettings = {
        targetHourlyWage: parseFloat(targetHourlyWage) || 0,
        experienceLevel,
        sphRate,
        monthlyOverhead: overheadTotal,
        overheadItems,
        incidentalsMinutes: incidentalsTotal,
        incidentalsItems: incidentalItems,
        projectsPerMonth: parseFloat(projectsPerMonth) || 0,
        avgProjectSize: parseFloat(avgProjectSize) || 0,
        forceStandaloneMode: checked,
      };
      await saveBOCSettings(settings);
    } catch (err) {
      console.error("Error saving force standalone mode:", err);
    }
  }, [
    targetHourlyWage,
    experienceLevel,
    sphRate,
    overheadTotal,
    overheadItems,
    incidentalsTotal,
    incidentalItems,
    projectsPerMonth,
    avgProjectSize,
  ]);

  // ── Loading screen ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-lg font-bold text-plum">
            Loading BOC...
          </div>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-plum">
            Business Overhead Calculator
          </h2>
          <p className="text-sm text-muted mt-1">
            Determine your minimum per-square-inch rate based on overhead, wage,
            and project parameters.
          </p>

          {/* Beta-only: force standalone mode toggle */}
          {isBetaMode && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <input
                type="checkbox"
                id="force-standalone"
                checked={forceStandalone}
                onChange={(e) => handleForceStandaloneToggle(e.target.checked)}
                className="mt-0.5 accent-plum"
              />
              <label htmlFor="force-standalone" className="text-sm">
                <span className="font-medium text-amber-800">
                  Force standalone mode (manual entry only)
                </span>
                <br />
                <span className="text-xs text-amber-600">
                  Test the $79 standalone experience without auto-sync. For testing only.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Main card — always visible (rate calculator is free) */}
        <div className="bg-white border border-line rounded-xl p-4 sm:p-6 space-y-8">
          <RateCalculatorSection
            targetHourlyWage={targetHourlyWage}
            onTargetHourlyWageChange={setTargetHourlyWage}
            experienceLevel={experienceLevel}
            onExperienceLevelChange={setExperienceLevel}
            sphRate={sphRate}
            projectsPerMonth={projectsPerMonth}
            onProjectsPerMonthChange={setProjectsPerMonth}
            avgProjectSize={avgProjectSize}
            onAvgProjectSizeChange={setAvgProjectSize}
          />

          <hr className="border-line" />

          <OverheadSection
            items={overheadItems}
            onChange={setOverheadItems}
            total={overheadTotal}
          />

          <hr className="border-line" />

          <IncidentalsSection
            items={incidentalItems}
            onChange={setIncidentalItems}
            total={incidentalsTotal}
          />

          <hr className="border-line" />

          {/* Results */}
          <ResultsCard results={results} />
        </div>

        {/* Performance Dashboard + Donations — paywall gated */}
        {showDashboards ? (
          <>
            {/* Performance Dashboard */}
            {effectiveMode.isConnected && effectiveMode.hasProjects ? (
              <div className="mt-6">
                <PerformanceDashboard
                  targetHourlyWage={parseFloat(targetHourlyWage) || 0}
                  sphRate={sphRate}
                  incidentalsMinutes={incidentalsTotal}
                  monthlyOverhead={overheadTotal}
                  minimumRatePerSqIn={results?.isValid ? results.minimumRatePerSqIn : 0}
                />
              </div>
            ) : (
              <div className="mt-6 bg-background border border-line rounded-xl p-4 sm:p-6 text-center">
                <p className="text-sm text-muted">
                  Complete and archive projects to see your actual performance
                  compared to your target rate.
                </p>
              </div>
            )}

            {/* Donated Quilts */}
            {effectiveMode.isConnected && (
              <div className="mt-6">
                <DonatedQuiltsSection
                  sphRate={sphRate}
                  incidentalsMinutes={incidentalsTotal}
                  targetHourlyWage={parseFloat(targetHourlyWage) || 0}
                />
              </div>
            )}
          </>
        ) : (
          /* Paywall */
          <div className="mt-6 bg-white border-2 border-gold/40 rounded-xl p-6 sm:p-8 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-plum mb-2">
              Unlock Performance Tracking &amp; Tax Reports
            </h3>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              See your actual hourly rate, compare it to your target, track
              donated quilts, and generate IRS-compliant tax summaries.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {effectiveMode.isSubscribed && BOC_SUBSCRIBER_PRICE && (
                <button
                  onClick={() => handlePurchase(BOC_SUBSCRIBER_PRICE)}
                  disabled={purchasing}
                  className="bg-gold text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {purchasing ? "Redirecting..." : "Buy for $49 (subscriber)"}
                </button>
              )}
              {BOC_STANDALONE_PRICE && (
                <button
                  onClick={() => handlePurchase(BOC_STANDALONE_PRICE)}
                  disabled={purchasing}
                  className="bg-plum text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {purchasing ? "Redirecting..." : "Buy for $79"}
                </button>
              )}
            </div>
            {effectiveMode.isSubscribed && (
              <p className="text-xs text-muted mt-3">
                Subscribers save $30 — one-time purchase, yours forever.
              </p>
            )}
          </div>
        )}

        {/* Save button — below everything */}
        <div className="bg-white border border-line rounded-xl p-4 sm:p-6 mt-6">
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-plum text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save My Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

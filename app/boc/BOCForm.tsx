"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "../components/Header";
import Toast from "../components/Toast";
import { getBOCSettings, saveBOCSettings } from "../lib/storage/boc";
import { getBOCMode, type BOCMode } from "../lib/storage/boc-mode";
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

export default function BOCForm() {
  // ── Loading / saving state ──────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Mode detection ───────────────────────────────────────────────────
  const [bocMode, setBocMode] = useState<BOCMode>({ isConnected: false, hasProjects: false });

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

  // ── Load saved settings ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [saved, mode] = await Promise.all([
          getBOCSettings(),
          getBOCMode(),
        ]);
        applySettings(saved);
        setBocMode(mode);
      } catch (err) {
        console.error("Error loading BOC settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function applySettings(s: BOCSettings) {
    setTargetHourlyWage(s.targetHourlyWage ? String(s.targetHourlyWage) : "");
    setExperienceLevel(s.experienceLevel);
    setProjectsPerMonth(s.projectsPerMonth ? String(s.projectsPerMonth) : "10");
    setAvgProjectSize(s.avgProjectSize ? String(s.avgProjectSize) : "6000");
    setOverheadItems(s.overheadItems.length > 0 ? s.overheadItems : DEFAULT_OVERHEAD_ITEMS);
    setIncidentalItems(s.incidentalsItems.length > 0 ? s.incidentalsItems : DEFAULT_INCIDENTAL_ITEMS);
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
        </div>

        {/* Main card */}
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

        {/* Performance Dashboard — outside the main card */}
        {bocMode.isConnected && bocMode.hasProjects ? (
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

        {/* Save button — below dashboard */}
        <div className="bg-white border border-line rounded-xl p-4 sm:p-6 mt-6">

          {/* Save button */}
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

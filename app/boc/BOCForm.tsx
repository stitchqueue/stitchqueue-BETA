"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Toast from "../components/Toast";
import { getBOCSettings, saveBOCSettings } from "../lib/storage/boc";
import type { BOCSettings, ExperienceLevel, OverheadItems, IncidentalsItems } from "../types";
import { DEFAULT_BOC_SETTINGS, SPH_RATES } from "../types";
import {
  calculateMinimumRate,
  type BOCCalculationResults,
} from "./utils/calculations";
import RateCalculatorSection from "./components/RateCalculatorSection";
import OverheadSection from "./components/OverheadSection";
import IncidentalsSection from "./components/IncidentalsSection";
import ResultsCard from "./components/ResultsCard";

export default function BOCForm() {
  const router = useRouter();

  // ── Loading / saving state ──────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ── Form state (strings for controlled inputs) ─────────────────────
  const [targetHourlyWage, setTargetHourlyWage] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("experienced");
  const [projectsPerMonth, setProjectsPerMonth] = useState("10");
  const [avgProjectSize, setAvgProjectSize] = useState("6000");

  // Overhead items
  const [machinePayment, setMachinePayment] = useState("");
  const [insurance, setInsurance] = useState("");
  const [rentSpace, setRentSpace] = useState("");
  const [utilities, setUtilities] = useState("");
  const [software, setSoftware] = useState("");
  const [overheadOther, setOverheadOther] = useState("");

  // Incidentals items (minutes)
  const [consultationPlanning, setConsultationPlanning] = useState("");
  const [threadingPrep, setThreadingPrep] = useState("");
  const [loadingUnloading, setLoadingUnloading] = useState("");
  const [packaging, setPackaging] = useState("");
  const [photos, setPhotos] = useState("");
  const [billingAdmin, setBillingAdmin] = useState("");

  // ── Computed results ────────────────────────────────────────────────
  const [results, setResults] = useState<BOCCalculationResults | null>(null);

  // ── Derived values ──────────────────────────────────────────────────
  const sphRate = SPH_RATES[experienceLevel];

  const overheadTotal =
    (parseFloat(machinePayment) || 0) +
    (parseFloat(insurance) || 0) +
    (parseFloat(rentSpace) || 0) +
    (parseFloat(utilities) || 0) +
    (parseFloat(software) || 0) +
    (parseFloat(overheadOther) || 0);

  const incidentalsTotal =
    (parseFloat(consultationPlanning) || 0) +
    (parseFloat(threadingPrep) || 0) +
    (parseFloat(loadingUnloading) || 0) +
    (parseFloat(packaging) || 0) +
    (parseFloat(photos) || 0) +
    (parseFloat(billingAdmin) || 0);

  // ── Load saved settings ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const saved = await getBOCSettings();
        applySettings(saved);
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

    // Overhead items
    const o = s.overheadItems;
    setMachinePayment(o.machinePayment ? String(o.machinePayment) : "");
    setInsurance(o.insurance ? String(o.insurance) : "");
    setRentSpace(o.rentSpace ? String(o.rentSpace) : "");
    setUtilities(o.utilities ? String(o.utilities) : "");
    setSoftware(o.software ? String(o.software) : "");
    setOverheadOther(o.other ? String(o.other) : "");

    // Incidentals items
    const i = s.incidentalsItems;
    setConsultationPlanning(
      i.consultationPlanning ? String(i.consultationPlanning) : ""
    );
    setThreadingPrep(i.threadingPrep ? String(i.threadingPrep) : "");
    setLoadingUnloading(
      i.loadingUnloading ? String(i.loadingUnloading) : ""
    );
    setPackaging(i.packaging ? String(i.packaging) : "");
    setPhotos(i.photos ? String(i.photos) : "");
    setBillingAdmin(i.billingAdmin ? String(i.billingAdmin) : "");
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
        overheadItems: {
          machinePayment: parseFloat(machinePayment) || 0,
          insurance: parseFloat(insurance) || 0,
          rentSpace: parseFloat(rentSpace) || 0,
          utilities: parseFloat(utilities) || 0,
          software: parseFloat(software) || 0,
          other: parseFloat(overheadOther) || 0,
        },
        incidentalsMinutes: incidentalsTotal,
        incidentalsItems: {
          consultationPlanning: parseFloat(consultationPlanning) || 0,
          threadingPrep: parseFloat(threadingPrep) || 0,
          loadingUnloading: parseFloat(loadingUnloading) || 0,
          packaging: parseFloat(packaging) || 0,
          photos: parseFloat(photos) || 0,
          billingAdmin: parseFloat(billingAdmin) || 0,
        },
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
    machinePayment,
    insurance,
    rentSpace,
    utilities,
    software,
    overheadOther,
    incidentalsTotal,
    consultationPlanning,
    threadingPrep,
    loadingUnloading,
    packaging,
    photos,
    billingAdmin,
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
            machinePayment={machinePayment}
            onMachinePaymentChange={setMachinePayment}
            insurance={insurance}
            onInsuranceChange={setInsurance}
            rentSpace={rentSpace}
            onRentSpaceChange={setRentSpace}
            utilities={utilities}
            onUtilitiesChange={setUtilities}
            software={software}
            onSoftwareChange={setSoftware}
            other={overheadOther}
            onOtherChange={setOverheadOther}
            total={overheadTotal}
          />

          <hr className="border-line" />

          <IncidentalsSection
            consultationPlanning={consultationPlanning}
            onConsultationPlanningChange={setConsultationPlanning}
            threadingPrep={threadingPrep}
            onThreadingPrepChange={setThreadingPrep}
            loadingUnloading={loadingUnloading}
            onLoadingUnloadingChange={setLoadingUnloading}
            packaging={packaging}
            onPackagingChange={setPackaging}
            photos={photos}
            onPhotosChange={setPhotos}
            billingAdmin={billingAdmin}
            onBillingAdminChange={setBillingAdmin}
            total={incidentalsTotal}
          />

          <hr className="border-line" />

          {/* Results */}
          <ResultsCard results={results} />

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

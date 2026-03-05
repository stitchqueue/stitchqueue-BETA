"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { storage, hasOrganization, DEFAULT_SETTINGS } from "../lib/storage";
import type { Settings } from "../types";
import { FeatureGate, isFeatureEnabled } from "../lib/featureFlags";
import {
  SectionKey,
  BusinessInfoSection,
  TaxConfigSection,
  PricingRatesSection,
  BobbinOptionsSection,
  BattingOptionsSection,
  SubscriptionSection,
  ReportsSection,
  IntakeFormSection,
} from "./components";
import type { RateStrings } from "./components";
import { formatPhoneNumber } from "./utils";
import { useBobbinOptions, useBattingOptions } from "./hooks";

const ALL_SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "business", label: "Business Info", icon: "🏢" },
  { key: "subscription", label: "Subscription", icon: "💳" },
  { key: "tax", label: "Tax Configuration", icon: "💰" },
  { key: "pricing", label: "Pricing Rates", icon: "💲" },
  { key: "bobbin", label: "Bobbin Options", icon: "🧵" },
  { key: "batting", label: "Batting Options", icon: "🛏️" },
  { key: "intake", label: "Client Intake Form", icon: "📋" },
  { key: "data", label: isFeatureEnabled("ENABLE_FINANCIAL_REPORTS") ? "Reports & Data" : "Data Management", icon: "📊" },
];

const SECTIONS = ALL_SECTIONS.filter((s) => {
  if (s.key === "tax" && !isFeatureEnabled("ENABLE_TAX_SYSTEM")) return false;
  return true;
});

/**
 * Main settings form orchestrator.
 * Core state + generic handlers live here.
 * Bobbin/batting CRUD delegated to custom hooks.
 */
export default function SettingsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set());
  const [rateStrings, setRateStrings] = useState<RateStrings>({
    lightE2E: "",
    standardE2E: "",
    lightCustom: "",
    custom: "",
    denseCustom: "",
    bindingTopAttached: "",
    bindingFullyAttached: "",
  });

  // Domain hooks
  const bobbin = useBobbinOptions(settings, setSettings);
  const batting = useBattingOptions(settings, setSettings);

  // Open section from URL param
  useEffect(() => {
    const section = searchParams.get("section") as SectionKey | null;
    if (section && SECTIONS.some((s) => s.key === section)) {
      setOpenSections(new Set([section]));
    }
  }, [searchParams]);

  // Load settings on mount
  useEffect(() => {
    const init = async () => {
      try {
        const hasOrg = await hasOrganization();
        if (!hasOrg) {
          router.push("/");
          return;
        }
        setIsAuthenticated(true);

        const s = await storage.getSettings();
        if (!s.bobbinOptions) {
          s.bobbinOptions = [];
        }
        setSettings(s);

        setRateStrings({
          lightE2E: s.pricingRates?.lightE2E?.toString() || "",
          standardE2E: s.pricingRates?.standardE2E?.toString() || "",
          lightCustom: s.pricingRates?.lightCustom?.toString() || "",
          custom: s.pricingRates?.custom?.toString() || "",
          denseCustom: s.pricingRates?.denseCustom?.toString() || "",
          bindingTopAttached: s.pricingRates?.bindingTopAttached?.toString() || "",
          bindingFullyAttached: s.pricingRates?.bindingFullyAttached?.toString() || "",
        });
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // Accordion toggle
  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Generic field handlers
  const handleFieldChange = async (field: keyof Settings, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    // Trim business name before saving; reject if empty after trim
    if (field === "businessName" && typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return;
      updated.businessName = trimmed;
    }
    await storage.saveSettings(updated);
  };

  const handlePhoneChange = async (value: string) => {
    const formatted = formatPhoneNumber(value);
    const updated = { ...settings, phone: formatted };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // Pricing rate handlers
  const handleRateChange = (field: keyof RateStrings, value: string) => {
    setRateStrings((prev) => ({ ...prev, [field]: value }));
  };

  const handleRateBlur = async (field: keyof RateStrings) => {
    const value = parseFloat(rateStrings[field]) || 0;
    const updated = {
      ...settings,
      pricingRates: { ...settings.pricingRates, [field]: value },
    };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // Logo handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const updated = { ...settings, logoUrl: event.target?.result as string };
      setSettings(updated);
      await storage.saveSettings(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    const updated = { ...settings, logoUrl: "" };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum"></div>
            <span className="ml-3 text-muted">Loading settings...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-plum">Settings</h1>
            <p className="text-sm text-muted mt-1">
              Configure your StitchQueue system
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors self-start sm:self-auto"
          >
            Back to Home
          </button>
        </div>

        <div className="space-y-3">
          <BusinessInfoSection
            settings={settings}
            isOpen={openSections.has("business")}
            onToggle={toggleSection}
            onFieldChange={handleFieldChange}
            onPhoneChange={handlePhoneChange}
            onLogoUpload={handleLogoUpload}
            onRemoveLogo={handleRemoveLogo}
          />

          <SubscriptionSection
            isOpen={openSections.has("subscription")}
            onToggle={toggleSection}
          />

          <FeatureGate flag="ENABLE_TAX_SYSTEM">
            <TaxConfigSection
              settings={settings}
              isOpen={openSections.has("tax")}
              onToggle={toggleSection}
              handleInputChange={handleFieldChange}
            />
          </FeatureGate>

          <PricingRatesSection
            settings={settings}
            rateStrings={rateStrings}
            isOpen={openSections.has("pricing")}
            onToggle={toggleSection}
            onRateChange={handleRateChange}
            onRateBlur={handleRateBlur}
          />

          <BobbinOptionsSection
            settings={settings}
            isOpen={openSections.has("bobbin")}
            onToggle={toggleSection}
            {...bobbin}
          />

          <BattingOptionsSection
            settings={settings}
            isOpen={openSections.has("batting")}
            onToggle={toggleSection}
            {...batting}
          />

          <IntakeFormSection
            isOpen={openSections.has("intake")}
            onToggle={toggleSection}
          />

          <ReportsSection
            settings={settings}
            isOpen={openSections.has("data")}
            onToggle={toggleSection}
          />
        </div>
      </main>
    </div>
  );
}

/**
 * SettingsForm Component
 * 
 * Main orchestrator for the settings page. Manages all form state,
 * handles data persistence, and coordinates child components.
 * 
 * @module settings/SettingsForm
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import {
  storage,
  hasOrganization,
  DEFAULT_SETTINGS,
} from "../lib/storage";
import type { Settings, BobbinOption, BattingOption } from "../types";

// Import child components
import {
  SectionKey,
  TierCard,
  BusinessInfoSection,
  PricingRatesSection,
  BobbinOptionsSection,
  BattingOptionsSection,
  DataSection,
} from "./components";
import type { RateStrings } from "./components";

// Import utilities
import { formatPhoneNumber } from "./utils";

/**
 * Section configuration for navigation
 */
const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "business", label: "Business Info", icon: "🏢" },
  { key: "pricing", label: "Pricing Rates", icon: "💲" },
  { key: "bobbin", label: "Bobbin Options", icon: "🧵" },
  { key: "batting", label: "Batting Options", icon: "🛏️" },
  { key: "data", label: "Reports & Data", icon: "📊" },
];

/**
 * Main settings form component.
 * 
 * Handles:
 * - Loading settings from database
 * - Managing accordion open/close state
 * - All CRUD operations for bobbin and batting options
 * - CSV export and data clearing
 */
export default function SettingsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ─────────────────────────────────────────────────────────────────────
  // CORE STATE
  // ─────────────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Accordion: track which sections are open
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set());

  // ─────────────────────────────────────────────────────────────────────
  // BOBBIN STATE
  // ─────────────────────────────────────────────────────────────────────
  const [newBobbinName, setNewBobbinName] = useState("");
  const [newBobbinPrice, setNewBobbinPrice] = useState("");
  const [editingBobbin, setEditingBobbin] = useState<string | null>(null);
  const [editBobbinName, setEditBobbinName] = useState("");
  const [editBobbinPrice, setEditBobbinPrice] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // BATTING STATE
  // ─────────────────────────────────────────────────────────────────────
  const [newBattingName, setNewBattingName] = useState("");
  const [newBattingWidth, setNewBattingWidth] = useState("");
  const [newBattingPrice, setNewBattingPrice] = useState("");
  const [editingBatting, setEditingBatting] = useState<string | null>(null);
  const [editBattingName, setEditBattingName] = useState("");
  const [editBattingWidth, setEditBattingWidth] = useState("");
  const [editBattingPrice, setEditBattingPrice] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // PRICING RATE STRINGS (for controlled decimal inputs)
  // ─────────────────────────────────────────────────────────────────────
  const [rateStrings, setRateStrings] = useState<RateStrings>({
    lightE2E: "",
    standardE2E: "",
    lightCustom: "",
    custom: "",
    denseCustom: "",
    bindingTopAttached: "",
    bindingFullyAttached: "",
  });

  // ─────────────────────────────────────────────────────────────────────
  // SECTION PARAM EFFECT
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const section = searchParams.get("section") as SectionKey | null;
    if (section && SECTIONS.some((s) => s.key === section)) {
      setOpenSections(new Set([section]));
    }
  }, [searchParams]);

  // ─────────────────────────────────────────────────────────────────────
  // DATA LOADING EFFECT
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Check authentication
        const hasOrg = await hasOrganization();
        if (!hasOrg) {
          router.push("/");
          return;
        }
        setIsAuthenticated(true);

        // Load settings
        const s = await storage.getSettings();
        // Ensure bobbinOptions exists (migration from old settings)
        if (!s.bobbinOptions) {
          s.bobbinOptions = [];
        }
        setSettings(s);
        
        // Initialize rate strings from settings
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

  // ─────────────────────────────────────────────────────────────────────
  // ACCORDION HANDLERS
  // ─────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────
  // GENERIC FIELD HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  const handleFieldChange = async (field: keyof Settings, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const handlePhoneChange = async (value: string) => {
    const formatted = formatPhoneNumber(value);
    const updated = { ...settings, phone: formatted };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // ─────────────────────────────────────────────────────────────────────
  // TIER TOGGLE
  // ─────────────────────────────────────────────────────────────────────
  const handleToggleTier = async () => {
    const updated = { ...settings, isPaidTier: !settings.isPaidTier };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const handleEnablePaidTier = async () => {
    const updated = { ...settings, isPaidTier: true };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // ─────────────────────────────────────────────────────────────────────
  // PRICING RATE HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  const handleRateChange = (field: keyof RateStrings, value: string) => {
    setRateStrings((prev) => ({ ...prev, [field]: value }));
  };

  const handleRateBlur = async (field: keyof RateStrings) => {
    const value = parseFloat(rateStrings[field]) || 0;
    const updated = {
      ...settings,
      pricingRates: {
        ...settings.pricingRates,
        [field]: value,
      },
    };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // ─────────────────────────────────────────────────────────────────────
  // LOGO HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert("Logo file must be smaller than 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const updated = {
        ...settings,
        logoUrl: event.target?.result as string,
      };
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

  // ─────────────────────────────────────────────────────────────────────
  // BOBBIN HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  const handleAddBobbin = async () => {
    if (!newBobbinName || !newBobbinPrice) {
      alert("Please enter bobbin name and price");
      return;
    }

    const newBobbin: BobbinOption = {
      name: newBobbinName,
      price: parseFloat(newBobbinPrice),
      isDefault: (settings.bobbinOptions || []).length === 0,
    };

    const updated = {
      ...settings,
      bobbinOptions: [...(settings.bobbinOptions || []), newBobbin],
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setNewBobbinName("");
    setNewBobbinPrice("");
  };

  const handleDeleteBobbin = async (name: string) => {
    if (!confirm(`Delete bobbin option "${name}"?`)) return;

    const updated = {
      ...settings,
      bobbinOptions: (settings.bobbinOptions || []).filter(
        (b) => b.name !== name
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const handleSetDefaultBobbin = async (name: string) => {
    const updated = {
      ...settings,
      bobbinOptions: (settings.bobbinOptions || []).map((b) => ({
        ...b,
        isDefault: b.name === name,
      })),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const handleStartEditBobbin = (bobbin: BobbinOption) => {
    setEditingBobbin(bobbin.name);
    setEditBobbinName(bobbin.name);
    setEditBobbinPrice(bobbin.price.toString());
  };

  const handleSaveEditBobbin = async (originalName: string) => {
    if (!editBobbinName || !editBobbinPrice) {
      alert("Please enter bobbin name and price");
      return;
    }

    const updated = {
      ...settings,
      bobbinOptions: (settings.bobbinOptions || []).map((b) =>
        b.name === originalName
          ? { ...b, name: editBobbinName, price: parseFloat(editBobbinPrice) }
          : b
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setEditingBobbin(null);
  };

  const handleCancelEditBobbin = () => {
    setEditingBobbin(null);
    setEditBobbinName("");
    setEditBobbinPrice("");
  };

  // ─────────────────────────────────────────────────────────────────────
  // BATTING HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  const handleAddBatting = async () => {
    if (!newBattingName || !newBattingWidth || !newBattingPrice) {
      alert("Please enter batting name, width, and price per inch");
      return;
    }

    const newBatting: BattingOption = {
      name: newBattingName,
      widthInches: parseFloat(newBattingWidth),
      pricePerInch: parseFloat(newBattingPrice),
      isDefault: settings.battingOptions.length === 0,
    };

    const updated = {
      ...settings,
      battingOptions: [...settings.battingOptions, newBatting],
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setNewBattingName("");
    setNewBattingWidth("");
    setNewBattingPrice("");
  };

  const handleDeleteBatting = async (name: string, width: number) => {
    if (!confirm(`Delete batting option "${name}" (${width}")?`)) return;

    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.filter(
        (b) => !(b.name === name && b.widthInches === width)
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const handleSetDefaultBatting = async (name: string, width: number) => {
    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.map((b) => ({
        ...b,
        isDefault: b.name === name && b.widthInches === width,
      })),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const handleStartEditBatting = (batting: BattingOption) => {
    const key = `${batting.name}-${batting.widthInches}`;
    setEditingBatting(key);
    setEditBattingName(batting.name);
    setEditBattingWidth(batting.widthInches.toString());
    setEditBattingPrice(batting.pricePerInch.toString());
  };

  const handleSaveEditBatting = async (
    originalName: string,
    originalWidth: number
  ) => {
    if (!editBattingName || !editBattingWidth || !editBattingPrice) {
      alert("Please enter batting name, width, and price");
      return;
    }

    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.map((b) =>
        b.name === originalName && b.widthInches === originalWidth
          ? {
              ...b,
              name: editBattingName,
              widthInches: parseFloat(editBattingWidth),
              pricePerInch: parseFloat(editBattingPrice),
            }
          : b
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setEditingBatting(null);
  };

  const handleCancelEditBatting = () => {
    setEditingBatting(null);
    setEditBattingName("");
    setEditBattingWidth("");
    setEditBattingPrice("");
  };

  // ─────────────────────────────────────────────────────────────────────
  // DATA HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    const projects = await storage.getProjects();

    const headers = [
      "ID",
      "Stage",
      "Client First Name",
      "Client Last Name",
      "Email",
      "Phone",
      "Street",
      "City",
      "State",
      "Postal Code",
      "Country",
      "Intake Date",
      "Due Date",
      "Description",
      "Quilt Width",
      "Quilt Length",
      "Service Type",
      "Created At",
    ];

    const rows = projects.map((p) => [
      p.id,
      p.stage,
      p.clientFirstName,
      p.clientLastName,
      p.clientEmail || "",
      p.clientPhone || "",
      p.clientStreet || "",
      p.clientCity || "",
      p.clientState || "",
      p.clientPostalCode || "",
      p.clientCountry || "",
      p.intakeDate,
      p.dueDate || "",
      p.description || "",
      p.quiltWidth || "",
      p.quiltLength || "",
      p.serviceType || "",
      p.createdAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stitchqueue-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to clear ALL data? This cannot be undone!"
      )
    )
      return;
    if (
      !confirm("Really sure? All projects, settings, and data will be deleted!")
    )
      return;

    try {
      // Delete all projects from Supabase
      const deleteResult = await storage.deleteAllProjects();
      if (!deleteResult.success) {
        alert("Error deleting projects: " + deleteResult.error);
        return;
      }

      // Reset settings to defaults
      await storage.saveSettings(DEFAULT_SETTINGS);

      // Also clear localStorage just in case
      localStorage.clear();

      alert("All data cleared! Reloading...");
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Error clearing data. Check console for details.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────
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

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
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

        {/* Tier Card */}
        <TierCard
          isPaidTier={settings.isPaidTier || false}
          onToggleTier={handleToggleTier}
        />

        {/* Accordion Sections */}
        <div className="space-y-3">
          {/* Business Info */}
          <BusinessInfoSection
            settings={settings}
            isOpen={openSections.has("business")}
            onToggle={toggleSection}
            onFieldChange={handleFieldChange}
            onPhoneChange={handlePhoneChange}
            onLogoUpload={handleLogoUpload}
            onRemoveLogo={handleRemoveLogo}
          />

          {/* Pricing Rates */}
          <PricingRatesSection
            settings={settings}
            rateStrings={rateStrings}
            isOpen={openSections.has("pricing")}
            onToggle={toggleSection}
            onRateChange={handleRateChange}
            onRateBlur={handleRateBlur}
            onEnablePaidTier={handleEnablePaidTier}
          />

          {/* Bobbin Options */}
          <BobbinOptionsSection
            settings={settings}
            isOpen={openSections.has("bobbin")}
            onToggle={toggleSection}
            onEnablePaidTier={handleEnablePaidTier}
            newBobbinName={newBobbinName}
            setNewBobbinName={setNewBobbinName}
            newBobbinPrice={newBobbinPrice}
            setNewBobbinPrice={setNewBobbinPrice}
            onAddBobbin={handleAddBobbin}
            editingBobbin={editingBobbin}
            editBobbinName={editBobbinName}
            setEditBobbinName={setEditBobbinName}
            editBobbinPrice={editBobbinPrice}
            setEditBobbinPrice={setEditBobbinPrice}
            onStartEdit={handleStartEditBobbin}
            onSaveEdit={handleSaveEditBobbin}
            onCancelEdit={handleCancelEditBobbin}
            onDelete={handleDeleteBobbin}
            onSetDefault={handleSetDefaultBobbin}
          />

          {/* Batting Options */}
          <BattingOptionsSection
            settings={settings}
            isOpen={openSections.has("batting")}
            onToggle={toggleSection}
            onEnablePaidTier={handleEnablePaidTier}
            newBattingName={newBattingName}
            setNewBattingName={setNewBattingName}
            newBattingWidth={newBattingWidth}
            setNewBattingWidth={setNewBattingWidth}
            newBattingPrice={newBattingPrice}
            setNewBattingPrice={setNewBattingPrice}
            onAddBatting={handleAddBatting}
            editingBatting={editingBatting}
            editBattingName={editBattingName}
            setEditBattingName={setEditBattingName}
            editBattingWidth={editBattingWidth}
            setEditBattingWidth={setEditBattingWidth}
            editBattingPrice={editBattingPrice}
            setEditBattingPrice={setEditBattingPrice}
            onStartEdit={handleStartEditBatting}
            onSaveEdit={handleSaveEditBatting}
            onCancelEdit={handleCancelEditBatting}
            onDelete={handleDeleteBatting}
            onSetDefault={handleSetDefaultBatting}
          />

          {/* Data Section */}
          <DataSection
            isOpen={openSections.has("data")}
            onToggle={toggleSection}
            onExportCSV={handleExportCSV}
            onClearAllData={handleClearAllData}
          />
        </div>
      </main>
    </div>
  );
}

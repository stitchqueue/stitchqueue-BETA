"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import {
  storage,
  getCurrentUser,
  hasOrganization,
  DEFAULT_SETTINGS,
} from "../lib/storage";
import type { Settings, BobbinOption, BattingOption } from "../types";
import { COUNTRY_OPTIONS } from "../types";

// Phone formatting helper
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

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "business" | "pricing" | "bobbin" | "batting" | "data"
  >("business");

  // Bobbin state
  const [newBobbinName, setNewBobbinName] = useState("");
  const [newBobbinPrice, setNewBobbinPrice] = useState("");
  const [editingBobbin, setEditingBobbin] = useState<string | null>(null);
  const [editBobbinName, setEditBobbinName] = useState("");
  const [editBobbinPrice, setEditBobbinPrice] = useState("");

  // Batting state
  const [newBattingName, setNewBattingName] = useState("");
  const [newBattingWidth, setNewBattingWidth] = useState("");
  const [newBattingPrice, setNewBattingPrice] = useState("");
  const [editingBatting, setEditingBatting] = useState<string | null>(null);
  const [editBattingName, setEditBattingName] = useState("");
  const [editBattingWidth, setEditBattingWidth] = useState("");
  const [editBattingPrice, setEditBattingPrice] = useState("");

  // Pricing rate string states (to allow typing decimals)
  const [rateStrings, setRateStrings] = useState({
    lightE2E: "",
    standardE2E: "",
    lightCustom: "",
    custom: "",
    denseCustom: "",
    bindingTopAttached: "",
    bindingFullyAttached: "",
  });

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
        setRateStrings({
          lightE2E: s.pricingRates?.lightE2E?.toString() || "",
          standardE2E: s.pricingRates?.standardE2E?.toString() || "",
          lightCustom: s.pricingRates?.lightCustom?.toString() || "",
          custom: s.pricingRates?.custom?.toString() || "",
          denseCustom: s.pricingRates?.denseCustom?.toString() || "",
          bindingTopAttached:
            s.pricingRates?.bindingTopAttached?.toString() || "",
          bindingFullyAttached:
            s.pricingRates?.bindingFullyAttached?.toString() || "",
        });
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleRateChange = (field: keyof typeof rateStrings, value: string) => {
    setRateStrings((prev) => ({ ...prev, [field]: value }));
  };

  const handleRateBlur = async (field: keyof typeof rateStrings) => {
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

  const handlePhoneChange = async (value: string) => {
    const formatted = formatPhoneNumber(value);
    const updated = { ...settings, phone: formatted };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // Bobbin handlers
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

  // Batting handlers
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

  const handleFieldChange = async (field: keyof Settings, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    await storage.saveSettings(updated);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
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

        <div className="bg-white border border-line rounded-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm">
                Current Tier: {settings.isPaidTier ? "PAID" : "FREE"}
              </div>
              <div className="text-xs text-muted mt-1">
                {settings.isPaidTier
                  ? "All features unlocked"
                  : "Upgrade to unlock saved rates and email features"}
              </div>
            </div>
            <button
              onClick={async () => {
                const updated = {
                  ...settings,
                  isPaidTier: !settings.isPaidTier,
                };
                setSettings(updated);
                await storage.saveSettings(updated);
              }}
              className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold self-start sm:self-auto"
            >
              Toggle Tier (Demo)
            </button>
          </div>

          {!settings.isPaidTier && (
            <div className="mt-4 p-3 bg-gold/10 rounded-xl text-xs">
              <div className="font-bold mb-2">PAID Tier Features ($19/mo):</div>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Save pricing rates (auto-populate calculator)</li>
                <li>Save bobbin and batting options</li>
                <li>Email estimates/invoices</li>
                <li>Branded client intake form</li>
                <li>Multi-user access (up to 5 users)</li>
                <li>Advanced reports</li>
              </ul>
            </div>
          )}
        </div>

        {/* Tab navigation - horizontal scroll on mobile */}
        <div className="flex gap-2 mb-6 border-b border-line overflow-x-auto pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab("business")}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap flex-shrink-0 ${
              activeTab === "business"
                ? "text-plum border-b-2 border-plum"
                : "text-muted hover:text-plum"
            }`}
          >
            Business Info
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap flex-shrink-0 ${
              activeTab === "pricing"
                ? "text-plum border-b-2 border-plum"
                : "text-muted hover:text-plum"
            }`}
          >
            Pricing Rates
          </button>
          <button
            onClick={() => setActiveTab("bobbin")}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap flex-shrink-0 ${
              activeTab === "bobbin"
                ? "text-plum border-b-2 border-plum"
                : "text-muted hover:text-plum"
            }`}
          >
            Bobbin Options
          </button>
          <button
            onClick={() => setActiveTab("batting")}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap flex-shrink-0 ${
              activeTab === "batting"
                ? "text-plum border-b-2 border-plum"
                : "text-muted hover:text-plum"
            }`}
          >
            Batting Options
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap flex-shrink-0 ${
              activeTab === "data"
                ? "text-plum border-b-2 border-plum"
                : "text-muted hover:text-plum"
            }`}
          >
            Data Management
          </button>
        </div>

        {activeTab === "business" && (
          <div className="bg-white border border-line rounded-card p-4 sm:p-6 space-y-6">
            <h2 className="text-lg font-bold text-plum mb-4">
              Business Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings.businessName || ""}
                  onChange={(e) =>
                    handleFieldChange("businessName", e.target.value)
                  }
                  placeholder="Stitched By Susan"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={settings.street || ""}
                  onChange={(e) => handleFieldChange("street", e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>

              {/* Address grid - responsive layout */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-muted mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={settings.city || ""}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    placeholder="Spokane"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={settings.state || ""}
                    onChange={(e) => handleFieldChange("state", e.target.value)}
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
                    value={settings.postalCode || ""}
                    onChange={(e) =>
                      handleFieldChange("postalCode", e.target.value)
                    }
                    placeholder="99201"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-muted mb-2">
                    Country
                  </label>
                  <select
                    value={settings.country || "United States"}
                    onChange={(e) =>
                      handleFieldChange("country", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="susan@stitchedbysusan.com"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.phone || ""}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="509-828-2945"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={settings.website || ""}
                  onChange={(e) => handleFieldChange("website", e.target.value)}
                  placeholder="https://stitchedbysusan.com"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Business Logo
                </label>
                {settings.logoUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={settings.logoUrl}
                      alt="Business logo"
                      className="h-20 w-20 object-contain border border-line rounded-xl p-2"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="px-4 py-2 border border-line rounded-xl hover:bg-background transition-colors text-sm"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                    <p className="text-xs text-muted mt-2">
                      Max file size: 500KB. Recommended: Square image, PNG with
                      transparency.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.brandPrimaryColor || "#4e283a"}
                      onChange={(e) =>
                        handleFieldChange("brandPrimaryColor", e.target.value)
                      }
                      className="h-10 w-20 border border-line rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.brandPrimaryColor || "#4e283a"}
                      onChange={(e) =>
                        handleFieldChange("brandPrimaryColor", e.target.value)
                      }
                      placeholder="#4e283a"
                      className="flex-1 px-4 py-2 border border-line rounded-xl font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Secondary Brand Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.brandSecondaryColor || "#98823a"}
                      onChange={(e) =>
                        handleFieldChange("brandSecondaryColor", e.target.value)
                      }
                      className="h-10 w-20 border border-line rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.brandSecondaryColor || "#98823a"}
                      onChange={(e) =>
                        handleFieldChange("brandSecondaryColor", e.target.value)
                      }
                      placeholder="#98823a"
                      className="flex-1 px-4 py-2 border border-line rounded-xl font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Measurement System
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={settings.measurementSystem === "imperial"}
                      onChange={() =>
                        handleFieldChange("measurementSystem", "imperial")
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Imperial (inches)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={settings.measurementSystem === "metric"}
                      onChange={() =>
                        handleFieldChange("measurementSystem", "metric")
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Metric (centimeters)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Currency
                </label>
                <select
                  value={settings.currencyCode || "USD"}
                  onChange={(e) =>
                    handleFieldChange("currencyCode", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-line rounded-xl"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="CAD">CAD - Canadian Dollar ($)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="AUD">AUD - Australian Dollar ($)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate || 0}
                    onChange={(e) =>
                      handleFieldChange(
                        "taxRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="8.5"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Tax Label
                  </label>
                  <input
                    type="text"
                    value={settings.taxLabel || "Sales Tax"}
                    onChange={(e) =>
                      handleFieldChange("taxLabel", e.target.value)
                    }
                    placeholder="Sales Tax"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>

              <div className="border-t border-line pt-6 mt-6">
                <h3 className="text-md font-bold text-plum mb-4">
                  Estimate Numbering
                </h3>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-muted">
                    Next Estimate Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.nextEstimateNumber || 1001}
                    onChange={(e) =>
                      handleFieldChange(
                        "nextEstimateNumber",
                        parseInt(e.target.value) || 1001
                      )
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                  <p className="text-xs text-muted">
                    The next estimate you create will use this number. Change
                    this to match your accounting system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="bg-white border border-line rounded-card p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-plum">Quilting Rates</h2>
              <p className="text-sm text-muted mt-1">
                {settings.isPaidTier
                  ? "Set your pricing rates (per square inch) - values save when you click out of field"
                  : "Available in PAID tier"}
              </p>
            </div>

            {!settings.isPaidTier ? (
              <div className="p-6 bg-gold/10 rounded-xl text-center">
                <p className="text-sm text-muted mb-4">
                  Upgrade to PAID tier to save pricing rates and auto-populate
                  the calculator
                </p>
                <button
                  onClick={async () => {
                    const updated = { ...settings, isPaidTier: true };
                    setSettings(updated);
                    await storage.saveSettings(updated);
                  }}
                  className="px-6 py-3 bg-plum text-white rounded-xl font-bold"
                >
                  Enable PAID Tier (Demo)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Light Edge-to-Edge ($/sq in)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rateStrings.lightE2E}
                      onChange={(e) =>
                        handleRateChange("lightE2E", e.target.value)
                      }
                      onBlur={() => handleRateBlur("lightE2E")}
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
                      onChange={(e) =>
                        handleRateChange("standardE2E", e.target.value)
                      }
                      onBlur={() => handleRateBlur("standardE2E")}
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
                      onChange={(e) =>
                        handleRateChange("lightCustom", e.target.value)
                      }
                      onBlur={() => handleRateBlur("lightCustom")}
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
                      onChange={(e) =>
                        handleRateChange("custom", e.target.value)
                      }
                      onBlur={() => handleRateBlur("custom")}
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
                      onChange={(e) =>
                        handleRateChange("denseCustom", e.target.value)
                      }
                      onBlur={() => handleRateBlur("denseCustom")}
                      placeholder="0.04"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>

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
                          handleRateChange("bindingTopAttached", e.target.value)
                        }
                        onBlur={() => handleRateBlur("bindingTopAttached")}
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
                          handleRateChange(
                            "bindingFullyAttached",
                            e.target.value
                          )
                        }
                        onBlur={() => handleRateBlur("bindingFullyAttached")}
                        placeholder="0.20"
                        className="w-full px-4 py-2 border border-line rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "bobbin" && (
          <div className="bg-white border border-line rounded-card p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-plum">Bobbin Options</h2>
              <p className="text-sm text-muted mt-1">
                {settings.isPaidTier
                  ? "Manage your bobbin types and pricing"
                  : "Available in PAID tier"}
              </p>
            </div>

            {!settings.isPaidTier ? (
              <div className="p-6 bg-gold/10 rounded-xl text-center">
                <p className="text-sm text-muted mb-4">
                  Upgrade to PAID tier to save bobbin options
                </p>
                <button
                  onClick={async () => {
                    const updated = { ...settings, isPaidTier: true };
                    setSettings(updated);
                    await storage.saveSettings(updated);
                  }}
                  className="px-6 py-3 bg-plum text-white rounded-xl font-bold"
                >
                  Enable PAID Tier (Demo)
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-background rounded-xl">
                  <h3 className="text-sm font-bold text-plum mb-3">
                    Add Bobbin Option
                  </h3>
                  {/* Bobbin input - stack on mobile */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Bobbin name (e.g., Prewound White)"
                      value={newBobbinName}
                      onChange={(e) => setNewBobbinName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-line rounded-xl"
                    />
                    <div className="flex gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Price"
                          value={newBobbinPrice}
                          onChange={(e) => setNewBobbinPrice(e.target.value)}
                          className="w-24 sm:w-32 pl-7 pr-3 py-2 border border-line rounded-xl"
                        />
                      </div>
                      <button
                        onClick={handleAddBobbin}
                        className="px-6 py-2 bg-plum text-white rounded-xl font-bold whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(settings.bobbinOptions || []).length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">
                      No bobbin options yet. Add one above!
                    </p>
                  ) : (
                    (settings.bobbinOptions || []).map((bobbin) => (
                      <div
                        key={bobbin.name}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-line rounded-xl"
                      >
                        {editingBobbin === bobbin.name ? (
                          // Edit mode
                          <div className="flex-1 flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={editBobbinName}
                              onChange={(e) =>
                                setEditBobbinName(e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-line rounded-lg"
                            />
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                $
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={editBobbinPrice}
                                onChange={(e) =>
                                  setEditBobbinPrice(e.target.value)
                                }
                                className="w-24 pl-7 pr-3 py-2 border border-line rounded-lg"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleSaveEditBobbin(bobbin.name)
                                }
                                className="px-3 py-1 text-xs bg-plum text-white rounded-lg"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEditBobbin}
                                className="px-3 py-1 text-xs border border-line rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="flex-1">
                              <div className="font-bold text-sm">
                                {bobbin.name}
                              </div>
                              <div className="text-xs text-muted mt-1">
                                ${bobbin.price.toFixed(2)} each
                                {bobbin.isDefault && (
                                  <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold rounded text-xs font-bold">
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEditBobbin(bobbin)}
                                className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                              >
                                Edit
                              </button>
                              {!bobbin.isDefault && (
                                <button
                                  onClick={() =>
                                    handleSetDefaultBobbin(bobbin.name)
                                  }
                                  className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBobbin(bobbin.name)}
                                className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "batting" && (
          <div className="bg-white border border-line rounded-card p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-plum">Batting Options</h2>
              <p className="text-sm text-muted mt-1">
                {settings.isPaidTier
                  ? "Manage your batting options and pricing"
                  : "Available in PAID tier"}
              </p>
            </div>

            {!settings.isPaidTier ? (
              <div className="p-6 bg-gold/10 rounded-xl text-center">
                <p className="text-sm text-muted mb-4">
                  Upgrade to PAID tier to save batting options
                </p>
                <button
                  onClick={async () => {
                    const updated = { ...settings, isPaidTier: true };
                    setSettings(updated);
                    await storage.saveSettings(updated);
                  }}
                  className="px-6 py-3 bg-plum text-white rounded-xl font-bold"
                >
                  Enable PAID Tier (Demo)
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-background rounded-xl">
                  <h3 className="text-sm font-bold text-plum mb-3">
                    Add Batting Option
                  </h3>
                  {/* Batting inputs - responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Batting name (e.g., Warm & Natural)"
                      value={newBattingName}
                      onChange={(e) => setNewBattingName(e.target.value)}
                      className="sm:col-span-2 px-4 py-2 border border-line rounded-xl"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Width (in)"
                      value={newBattingWidth}
                      onChange={(e) => setNewBattingWidth(e.target.value)}
                      className="px-4 py-2 border border-line rounded-xl"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="$/inch"
                      value={newBattingPrice}
                      onChange={(e) => setNewBattingPrice(e.target.value)}
                      className="px-4 py-2 border border-line rounded-xl"
                    />
                    <button
                      onClick={handleAddBatting}
                      className="sm:col-span-2 px-6 py-2 bg-plum text-white rounded-xl font-bold"
                    >
                      Add Batting Option
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {settings.battingOptions.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">
                      No batting options yet. Add one above!
                    </p>
                  ) : (
                    settings.battingOptions.map((batting) => {
                      const key = `${batting.name}-${batting.widthInches}`;
                      return (
                        <div
                          key={key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-line rounded-xl"
                        >
                          {editingBatting === key ? (
                            // Edit mode
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <input
                                type="text"
                                value={editBattingName}
                                onChange={(e) =>
                                  setEditBattingName(e.target.value)
                                }
                                className="sm:col-span-2 px-3 py-2 border border-line rounded-lg"
                                placeholder="Name"
                              />
                              <input
                                type="text"
                                inputMode="decimal"
                                value={editBattingWidth}
                                onChange={(e) =>
                                  setEditBattingWidth(e.target.value)
                                }
                                className="px-3 py-2 border border-line rounded-lg"
                                placeholder="Width"
                              />
                              <input
                                type="text"
                                inputMode="decimal"
                                value={editBattingPrice}
                                onChange={(e) =>
                                  setEditBattingPrice(e.target.value)
                                }
                                className="px-3 py-2 border border-line rounded-lg"
                                placeholder="$/in"
                              />
                              <div className="sm:col-span-4 flex gap-2">
                                <button
                                  onClick={() =>
                                    handleSaveEditBatting(
                                      batting.name,
                                      batting.widthInches
                                    )
                                  }
                                  className="px-3 py-1 text-xs bg-plum text-white rounded-lg"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEditBatting}
                                  className="px-3 py-1 text-xs border border-line rounded-lg"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="flex-1">
                                <div className="font-bold text-sm">
                                  {batting.name} - {batting.widthInches}" wide
                                </div>
                                <div className="text-xs text-muted mt-1">
                                  ${batting.pricePerInch.toFixed(4)}/inch
                                  {batting.isDefault && (
                                    <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold rounded text-xs font-bold">
                                      DEFAULT
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStartEditBatting(batting)}
                                  className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                                >
                                  Edit
                                </button>
                                {!batting.isDefault && (
                                  <button
                                    onClick={() =>
                                      handleSetDefaultBatting(
                                        batting.name,
                                        batting.widthInches
                                      )
                                    }
                                    className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDeleteBatting(
                                      batting.name,
                                      batting.widthInches
                                    )
                                  }
                                  className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "data" && (
          <div className="bg-white border border-line rounded-card p-4 sm:p-6">
            <h2 className="text-lg font-bold text-plum mb-4">
              Data Management
            </h2>

            <div className="space-y-6">
              <div className="p-4 border border-line rounded-xl">
                <h3 className="font-bold text-sm mb-2">Export Data</h3>
                <p className="text-xs text-muted mb-4">
                  Export all your projects to a CSV file for backup or use in
                  other software.
                </p>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-plum text-white rounded-xl font-bold"
                >
                  Export to CSV
                </button>
              </div>

              <div className="p-4 border border-red-300 rounded-xl bg-red-50">
                <h3 className="font-bold text-sm text-red-600 mb-2">
                  Danger Zone
                </h3>
                <p className="text-xs text-muted mb-4">
                  Clear all data including projects, settings, and preferences.
                  This cannot be undone!
                </p>
                <button
                  onClick={handleClearAllData}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { generateId } from "../lib/utils";
import type { Settings, ThreadOption, BattingOption } from "../types";

type Tab = "business" | "pricing" | "thread" | "batting" | "data";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("business");
  const [settings, setSettings] = useState<Settings>(storage.getSettings());
  const [saved, setSaved] = useState(false);

  // Thread form
  const [newThreadName, setNewThreadName] = useState("");
  const [newThreadPrice, setNewThreadPrice] = useState("");

  // Batting form
  const [newBattingName, setNewBattingName] = useState("");
  const [newBattingWidth, setNewBattingWidth] = useState("");
  const [newBattingPrice, setNewBattingPrice] = useState("");

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const saveSettings = () => {
    storage.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateBusinessInfo = (
    field: keyof Settings,
    value: string | number
  ) => {
    setSettings({ ...settings, [field]: value });
  };

  const updatePricingRate = (
    field: keyof Settings["pricingRates"],
    value: string
  ) => {
    setSettings({
      ...settings,
      pricingRates: {
        ...settings.pricingRates,
        [field]: parseFloat(value) || 0,
      },
    });
  };

  const addThreadOption = () => {
    if (!newThreadName || !newThreadPrice) {
      alert("Please enter thread name and price");
      return;
    }

    const newThread: ThreadOption = {
      id: generateId(),
      name: newThreadName,
      price: parseFloat(newThreadPrice),
      isDefault: settings.threadOptions.length === 0,
    };

    setSettings({
      ...settings,
      threadOptions: [...settings.threadOptions, newThread],
    });

    setNewThreadName("");
    setNewThreadPrice("");
  };

  const deleteThreadOption = (id: string) => {
    if (!confirm("Delete this thread option?")) return;
    setSettings({
      ...settings,
      threadOptions: settings.threadOptions.filter((t) => t.id !== id),
    });
  };

  const setDefaultThread = (id: string) => {
    setSettings({
      ...settings,
      threadOptions: settings.threadOptions.map((t) => ({
        ...t,
        isDefault: t.id === id,
      })),
    });
  };

  const addBattingOption = () => {
    if (!newBattingName || !newBattingWidth || !newBattingPrice) {
      alert("Please enter batting name, width, and price per inch");
      return;
    }

    const newBatting: BattingOption = {
      id: generateId(),
      name: newBattingName,
      width: parseFloat(newBattingWidth),
      pricePerInch: parseFloat(newBattingPrice),
      isDefault: settings.battingOptions.length === 0,
    };

    setSettings({
      ...settings,
      battingOptions: [...settings.battingOptions, newBatting],
    });

    setNewBattingName("");
    setNewBattingWidth("");
    setNewBattingPrice("");
  };

  const deleteBattingOption = (id: string) => {
    if (!confirm("Delete this batting option?")) return;
    setSettings({
      ...settings,
      battingOptions: settings.battingOptions.filter((b) => b.id !== id),
    });
  };

  const setDefaultBatting = (id: string) => {
    setSettings({
      ...settings,
      battingOptions: settings.battingOptions.map((b) => ({
        ...b,
        isDefault: b.id === id,
      })),
    });
  };

  const exportCSV = () => {
    const projects = storage.getProjects();

    if (projects.length === 0) {
      alert("No projects to export");
      return;
    }

    try {
      const headers = [
        "Project ID",
        "Stage",
        "Client First Name",
        "Client Last Name",
        "Client Email",
        "Client Phone",
        "Intake Date",
        "Requested Date Type",
        "Requested Completion Date",
        "Description",
        "Quilt Width (in)",
        "Quilt Length (in)",
        "Quilting Type",
        "Thread Choice",
        "Batting Choice",
        "Binding Type",
        "Created At",
        "Updated At",
        "Notes Count",
      ];

      const escapeCell = (cell: any): string => {
        const str = String(cell ?? "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = projects.map((p) =>
        [
          p.id,
          p.stage,
          p.clientFirstName,
          p.clientLastName,
          p.clientEmail || "",
          p.clientPhone || "",
          p.intakeDate,
          p.requestedDateType,
          p.requestedCompletionDate || "",
          p.description || "",
          p.quiltWidth || "",
          p.quiltLength || "",
          p.quiltingType || "",
          p.threadChoice || "",
          p.battingChoice || "",
          p.bindingType || "",
          p.createdAt,
          p.updatedAt,
          (p.notes || []).length,
        ]
          .map(escapeCell)
          .join(",")
      );

      const csvContent = [headers.map(escapeCell).join(","), ...rows].join(
        "\n"
      );

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `stitchqueue_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        if (
          confirm(
            "CSV download triggered. If it didn't work, click OK to copy the CSV data to clipboard."
          )
        ) {
          navigator.clipboard
            .writeText(csvContent)
            .then(() => {
              alert(
                "CSV data copied to clipboard! Paste it into a text file and save as .csv"
              );
            })
            .catch(() => {
              prompt("Copy this CSV data:", csvContent);
            });
        }
      }, 500);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting CSV. Check console for details.");
    }
  };

  const clearAllData = () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL projects? This cannot be undone!"
      )
    ) {
      return;
    }

    if (!confirm("Really delete everything? This is your last chance!")) {
      return;
    }

    storage.saveProjects([]);
    alert("All data cleared");
    router.push("/");
  };

  const isPaid = settings.subscriptionTier === "paid";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-plum">Settings</h2>
          <div className="flex gap-3">
            {saved && (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold">
                ✓ Saved
              </span>
            )}
            <button
              onClick={saveSettings}
              className="px-6 py-2 bg-plum text-white rounded-xl hover:bg-plum/90"
            >
              Save All Changes
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Tier Toggle */}
        <div className="bg-white border border-line rounded-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg">
                Current Tier: {isPaid ? "PRO" : "FREE (Studio)"}
              </div>
              <div className="text-sm text-muted mt-1">
                {isPaid
                  ? "Email estimates/invoices, client intake form link, multi-user, overhead calculator, advanced reports"
                  : "Full workflow with manual data entry and download/print"}
              </div>
            </div>
            <button
              onClick={() => {
                setSettings({
                  ...settings,
                  subscriptionTier: isPaid ? "free" : "paid",
                });
              }}
              className="px-6 py-2 bg-gold text-white rounded-xl hover:bg-gold/90"
            >
              {isPaid ? "Switch to FREE (Demo)" : "Upgrade to PRO ($19/mo)"}
            </button>
          </div>

          {isPaid && (
            <div className="mt-4 p-4 bg-gold/10 rounded-xl">
              <div className="font-bold text-sm mb-2">PRO Features:</div>
              <ul className="text-sm text-muted space-y-1">
                <li>✉️ Email estimates & invoices to clients</li>
                <li>
                  📋 Share client intake form via link or embed on website
                </li>
                <li>👥 Multi-user access (up to 5 users)</li>
                <li>📊 Business overhead calculator</li>
                <li>📈 Advanced reports & analytics</li>
              </ul>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("business")}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap ${
              activeTab === "business"
                ? "bg-plum text-white"
                : "bg-white border border-line hover:bg-gray-50"
            }`}
          >
            Business Info
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap ${
              activeTab === "pricing"
                ? "bg-plum text-white"
                : "bg-white border border-line hover:bg-gray-50"
            }`}
          >
            Pricing Rates
          </button>
          <button
            onClick={() => setActiveTab("thread")}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap ${
              activeTab === "thread"
                ? "bg-plum text-white"
                : "bg-white border border-line hover:bg-gray-50"
            }`}
          >
            Thread Options
          </button>
          <button
            onClick={() => setActiveTab("batting")}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap ${
              activeTab === "batting"
                ? "bg-plum text-white"
                : "bg-white border border-line hover:bg-gray-50"
            }`}
          >
            Batting Options
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap ${
              activeTab === "data"
                ? "bg-plum text-white"
                : "bg-white border border-line hover:bg-gray-50"
            }`}
          >
            Data Management
          </button>
        </div>

        {/* Business Info Tab */}
        {activeTab === "business" && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) =>
                      updateBusinessInfo("businessName", e.target.value)
                    }
                    placeholder="Stitched By Susan"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.businessAddress}
                    onChange={(e) =>
                      updateBusinessInfo("businessAddress", e.target.value)
                    }
                    placeholder="123 Main St, City, State ZIP"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.businessEmail}
                      onChange={(e) =>
                        updateBusinessInfo("businessEmail", e.target.value)
                      }
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
                      value={settings.businessPhone}
                      onChange={(e) =>
                        updateBusinessInfo("businessPhone", e.target.value)
                      }
                      placeholder="(555) 123-4567"
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
                    value={settings.businessWebsite}
                    onChange={(e) =>
                      updateBusinessInfo("businessWebsite", e.target.value)
                    }
                    placeholder="https://www.stitchedbysusan.com"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Business Logo
                  </label>
                  {settings.logoUrl && (
                    <div className="mb-3 p-4 border border-line rounded-xl bg-gray-50">
                      <img
                        src={settings.logoUrl}
                        alt="Business Logo"
                        className="max-w-[200px] max-h-[100px] object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Check file size (max 500KB)
                      if (file.size > 500000) {
                        alert(
                          "Logo file is too large. Please use an image under 500KB."
                        );
                        return;
                      }

                      // Convert to base64
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        updateBusinessInfo("logoUrl", base64);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                  <div className="text-xs text-muted mt-1">
                    Upload a logo image (PNG, JPG, or SVG - max 500KB)
                  </div>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateBusinessInfo("logoUrl", "")}
                      className="mt-2 text-xs text-red-600 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Brand Colors</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.brandPrimaryColor}
                      onChange={(e) =>
                        updateBusinessInfo("brandPrimaryColor", e.target.value)
                      }
                      className="w-16 h-10 border border-line rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.brandPrimaryColor}
                      onChange={(e) =>
                        updateBusinessInfo("brandPrimaryColor", e.target.value)
                      }
                      placeholder="#4e283a"
                      className="flex-1 px-4 py-2 border border-line rounded-xl font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.brandSecondaryColor}
                      onChange={(e) =>
                        updateBusinessInfo(
                          "brandSecondaryColor",
                          e.target.value
                        )
                      }
                      className="w-16 h-10 border border-line rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.brandSecondaryColor}
                      onChange={(e) =>
                        updateBusinessInfo(
                          "brandSecondaryColor",
                          e.target.value
                        )
                      }
                      placeholder="#98823a"
                      className="flex-1 px-4 py-2 border border-line rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Measurement System */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Measurement System</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="measurementSystem"
                    value="imperial"
                    checked={settings.measurementSystem === "imperial"}
                    onChange={(e) =>
                      updateBusinessInfo("measurementSystem", e.target.value)
                    }
                  />
                  <div>
                    <div className="font-bold text-sm">Imperial (Inches)</div>
                    <div className="text-xs text-muted">
                      US standard measurement
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="measurementSystem"
                    value="metric"
                    checked={settings.measurementSystem === "metric"}
                    onChange={(e) =>
                      updateBusinessInfo("measurementSystem", e.target.value)
                    }
                  />
                  <div>
                    <div className="font-bold text-sm">
                      Metric (Centimeters)
                    </div>
                    <div className="text-xs text-muted">
                      International measurement
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Currency & Tax */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Currency & Tax</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Currency Code
                  </label>
                  <select
                    value={settings.currencyCode}
                    onChange={(e) =>
                      updateBusinessInfo("currencyCode", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxRate}
                      onChange={(e) =>
                        updateBusinessInfo(
                          "taxRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Tax Label
                    </label>
                    <input
                      type="text"
                      value={settings.taxLabel}
                      onChange={(e) =>
                        updateBusinessInfo("taxLabel", e.target.value)
                      }
                      placeholder="Sales Tax"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Rates Tab */}
        {activeTab === "pricing" && (
          <div className="bg-white border border-line rounded-card p-6">
            <h3 className="font-bold text-plum mb-4">
              Pricing Rates (Per Square Inch)
            </h3>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Light Edge to Edge
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.pricingRates.lightE2E}
                    onChange={(e) =>
                      updatePricingRate("lightE2E", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Standard Edge to Edge
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.pricingRates.standardE2E}
                    onChange={(e) =>
                      updatePricingRate("standardE2E", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Light Custom
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.pricingRates.lightCustom}
                    onChange={(e) =>
                      updatePricingRate("lightCustom", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Custom
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.pricingRates.custom}
                    onChange={(e) =>
                      updatePricingRate("custom", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Dense Custom
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.pricingRates.denseCustom}
                    onChange={(e) =>
                      updatePricingRate("denseCustom", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-line">
                <h4 className="font-bold text-plum mb-4">Binding (Per Inch)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Top Attached Only
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.pricingRates.bindingTopAttached}
                      onChange={(e) =>
                        updatePricingRate("bindingTopAttached", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Fully Attached
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.pricingRates.bindingFullyAttached}
                      onChange={(e) =>
                        updatePricingRate(
                          "bindingFullyAttached",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thread Options Tab */}
        {activeTab === "thread" && (
          <div className="bg-white border border-line rounded-card p-6">
            <h3 className="font-bold text-plum mb-4">Thread Options</h3>

            {/* Add New Thread */}
            <div className="mb-6 p-4 border-2 border-dashed border-line rounded-xl">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-muted mb-2">
                    Thread Name
                  </label>
                  <input
                    type="text"
                    value={newThreadName}
                    onChange={(e) => setNewThreadName(e.target.value)}
                    placeholder="e.g., White, Cream, So Fine #50"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newThreadPrice}
                    onChange={(e) => setNewThreadPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>
              <button
                onClick={addThreadOption}
                className="mt-4 px-4 py-2 bg-plum text-white rounded-xl hover:bg-plum/90"
              >
                + Add Thread Option
              </button>
            </div>

            {/* Thread List */}
            {settings.threadOptions.length === 0 ? (
              <p className="text-center text-muted py-8">
                No thread options yet
              </p>
            ) : (
              <div className="space-y-3">
                {settings.threadOptions.map((thread) => (
                  <div
                    key={thread.id}
                    className="flex items-center justify-between p-4 border border-line rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="font-bold">{thread.name}</div>
                      <div className="text-sm text-muted">
                        ${thread.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {thread.isDefault && (
                        <span className="px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full">
                          DEFAULT
                        </span>
                      )}
                      {!thread.isDefault && (
                        <button
                          onClick={() => setDefaultThread(thread.id)}
                          className="px-3 py-1 border border-line rounded-xl text-xs hover:bg-gray-50"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteThreadOption(thread.id)}
                        className="px-3 py-1 border border-red-300 text-red-600 rounded-xl text-xs hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Batting Options Tab */}
        {activeTab === "batting" && (
          <div className="bg-white border border-line rounded-card p-6">
            <h3 className="font-bold text-plum mb-4">Batting Options</h3>

            {/* Add New Batting */}
            <div className="mb-6 p-4 border-2 border-dashed border-line rounded-xl">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-muted mb-2">
                    Batting Name
                  </label>
                  <input
                    type="text"
                    value={newBattingName}
                    onChange={(e) => setNewBattingName(e.target.value)}
                    placeholder="e.g., Cotton 80/20, Warm & Natural"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Width (in)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBattingWidth}
                    onChange={(e) => setNewBattingWidth(e.target.value)}
                    placeholder="96"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Price/inch ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBattingPrice}
                    onChange={(e) => setNewBattingPrice(e.target.value)}
                    placeholder="0.50"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>
              <button
                onClick={addBattingOption}
                className="mt-4 px-4 py-2 bg-plum text-white rounded-xl hover:bg-plum/90"
              >
                + Add Batting Option
              </button>
            </div>

            {/* Batting List */}
            {settings.battingOptions.length === 0 ? (
              <p className="text-center text-muted py-8">
                No batting options yet
              </p>
            ) : (
              <div className="space-y-3">
                {settings.battingOptions.map((batting) => (
                  <div
                    key={batting.id}
                    className="flex items-center justify-between p-4 border border-line rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="font-bold">{batting.name}</div>
                      <div className="text-sm text-muted">
                        {batting.width}" wide • $
                        {batting.pricePerInch.toFixed(2)}/inch
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {batting.isDefault && (
                        <span className="px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full">
                          DEFAULT
                        </span>
                      )}
                      {!batting.isDefault && (
                        <button
                          onClick={() => setDefaultBatting(batting.id)}
                          className="px-3 py-1 border border-line rounded-xl text-xs hover:bg-gray-50"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteBattingOption(batting.id)}
                        className="px-3 py-1 border border-red-300 text-red-600 rounded-xl text-xs hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === "data" && (
          <div className="bg-white border border-line rounded-card p-6">
            <h3 className="font-bold text-plum mb-4">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={exportCSV}
                className="w-full px-4 py-3 border border-line rounded-xl hover:bg-gray-50 text-left"
              >
                <div className="font-bold text-sm">Export All Data (CSV)</div>
                <div className="text-xs text-muted mt-1">
                  Download all projects as CSV file
                </div>
              </button>
              <button
                onClick={clearAllData}
                className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 text-left"
              >
                <div className="font-bold text-sm">Clear All Data</div>
                <div className="text-xs text-muted mt-1">
                  Delete all projects from localStorage
                </div>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

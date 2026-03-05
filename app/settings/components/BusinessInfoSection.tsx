/**
 * BusinessInfoSection Component
 * 
 * Collects business details: name, address, contact info, logo,
 * branding colors, measurement system, currency, tax, and estimate numbering.
 * 
 * @module settings/components/BusinessInfoSection
 */

"use client";

import { COUNTRY_OPTIONS } from "../../types";
import type { Settings } from "../../types";
import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";

interface BusinessInfoSectionProps {
  settings: Settings;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
  onFieldChange: (field: keyof Settings, value: any) => void;
  onPhoneChange: (value: string) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

/**
 * Business information settings section.
 * 
 * Fields:
 * - Business name, address, city, state, postal code, country
 * - Email, phone, website
 * - Logo upload
 * - Brand colors (primary and secondary)
 * - Measurement system (imperial/metric)
 * - Currency
 * - Tax rate and label
 * - Next estimate number
 */
export default function BusinessInfoSection({
  settings,
  isOpen,
  onToggle,
  onFieldChange,
  onPhoneChange,
  onLogoUpload,
  onRemoveLogo,
}: BusinessInfoSectionProps) {
  return (
    <div>
      <AccordionHeader
        sectionKey="business"
        label="Business Info"
        icon="🏢"
        subtitle={settings.businessName || "Set up your business details"}
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        <div className="space-y-4">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-bold text-muted mb-2">
              Business Name
            </label>
            <input
              type="text"
              maxLength={100}
              value={settings.businessName || ""}
              onChange={(e) => onFieldChange("businessName", e.target.value.trimStart())}
              placeholder="Your Business Name"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-bold text-muted mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={settings.street || ""}
              onChange={(e) => onFieldChange("street", e.target.value)}
              placeholder="123 Main Street"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>

          {/* Address Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-muted mb-2">
                City
              </label>
              <input
                type="text"
                value={settings.city || ""}
                onChange={(e) => onFieldChange("city", e.target.value)}
                placeholder="Your City"
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
                onChange={(e) => onFieldChange("state", e.target.value)}
                placeholder="State"
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
                onChange={(e) => onFieldChange("postalCode", e.target.value)}
                placeholder="12345"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-muted mb-2">
                Country
              </label>
              <select
                value={settings.country || "United States"}
                onChange={(e) => onFieldChange("country", e.target.value)}
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

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => onFieldChange("email", e.target.value)}
                placeholder="you@yourbusiness.com"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Phone
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={settings.phone || ""}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9()\-+\s]/g, "");
                  onPhoneChange(cleaned);
                }}
                placeholder="555-123-4567"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-bold text-muted mb-2">
              Website
            </label>
            <input
              type="url"
              value={settings.website || ""}
              onChange={(e) => onFieldChange("website", e.target.value)}
              placeholder="https://yourbusiness.com"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          </div>

          {/* Logo */}
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
                  onClick={onRemoveLogo}
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
                  onChange={onLogoUpload}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
                <p className="text-xs text-muted mt-2">
                  Max file size: 2MB. Recommended: Square image, PNG with
                  transparency.
                </p>
              </div>
            )}
          </div>

          {/* Brand Colors */}
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
                    onFieldChange("brandPrimaryColor", e.target.value)
                  }
                  className="h-10 w-20 border border-line rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brandPrimaryColor || "#4e283a"}
                  onChange={(e) =>
                    onFieldChange("brandPrimaryColor", e.target.value)
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
                    onFieldChange("brandSecondaryColor", e.target.value)
                  }
                  className="h-10 w-20 border border-line rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brandSecondaryColor || "#98823a"}
                  onChange={(e) =>
                    onFieldChange("brandSecondaryColor", e.target.value)
                  }
                  placeholder="#98823a"
                  className="flex-1 px-4 py-2 border border-line rounded-xl font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Measurement System */}
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
                    onFieldChange("measurementSystem", "imperial")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Imperial (inches)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.measurementSystem === "metric"}
                  onChange={() => onFieldChange("measurementSystem", "metric")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Metric (centimeters)</span>
              </label>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-bold text-muted mb-2">
              Currency
            </label>
            <select
              value={settings.currencyCode || "USD"}
              onChange={(e) => onFieldChange("currencyCode", e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            >
              <option value="USD">USD - US Dollar ($)</option>
              <option value="CAD">CAD - Canadian Dollar ($)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="AUD">AUD - Australian Dollar ($)</option>
            </select>
          </div>

          {/* Estimate Numbering */}
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
                  onFieldChange(
                    "nextEstimateNumber",
                    parseInt(e.target.value) || 1001
                  )
                }
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
              <p className="text-xs text-muted">
                The next estimate you create will use this number. Change this
                to match your accounting system.
              </p>
            </div>
          </div>
        </div>
      </AccordionBody>
    </div>
  );
}

/**
 * ClientInfoSection Component
 * 
 * Collects client contact information: name, email, phone, and address.
 * Handles country-specific address formatting (US states, Canadian provinces, etc.)
 * 
 * @module calculator/components/ClientInfoSection
 */

"use client";

import { COUNTRY_OPTIONS } from "../../types";
import {
  getRegionsForCountry,
  countryHasRegionDropdown,
  getRegionLabel,
  getPostalCodeLabel,
  getPostalCodePlaceholder,
} from "../../lib/locations";

interface ClientInfoSectionProps {
  // Name fields
  clientFirstName: string;
  setClientFirstName: (value: string) => void;
  clientLastName: string;
  setClientLastName: (value: string) => void;
  
  // Contact fields
  clientEmail: string;
  setClientEmail: (value: string) => void;
  clientPhone: string;
  onPhoneChange: (value: string) => void;
  
  // Address fields
  clientStreet: string;
  setClientStreet: (value: string) => void;
  clientCity: string;
  setClientCity: (value: string) => void;
  clientState: string;
  setClientState: (value: string) => void;
  clientPostalCode: string;
  setClientPostalCode: (value: string) => void;
  clientCountry: string;
  onCountryChange: (value: string) => void;
}

/**
 * Form section for collecting client contact and address information.
 * 
 * Features:
 * - Phone number auto-formatting (XXX-XXX-XXXX)
 * - Country-aware state/province dropdown
 * - Dynamic postal code labels (ZIP Code, Postal Code, etc.)
 */
export default function ClientInfoSection({
  clientFirstName,
  setClientFirstName,
  clientLastName,
  setClientLastName,
  clientEmail,
  setClientEmail,
  clientPhone,
  onPhoneChange,
  clientStreet,
  setClientStreet,
  clientCity,
  setClientCity,
  clientState,
  setClientState,
  clientPostalCode,
  setClientPostalCode,
  clientCountry,
  onCountryChange,
}: ClientInfoSectionProps) {
  // Get location-specific labels and options based on selected country
  const regions = getRegionsForCountry(clientCountry);
  const showRegionDropdown = countryHasRegionDropdown(clientCountry);
  const regionLabel = getRegionLabel(clientCountry);
  const postalCodeLabel = getPostalCodeLabel(clientCountry);
  const postalCodePlaceholder = getPostalCodePlaceholder(clientCountry);

  return (
    <>
      <h2 className="text-lg font-bold text-plum mb-4">
        Client Information
      </h2>

      {/* Name Fields */}
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

      {/* Contact Fields */}
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
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="509-555-1234"
            className="w-full px-4 py-2 border border-line rounded-xl"
          />
        </div>
      </div>

      {/* Street Address */}
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

      {/* City, State, Postal Code, Country Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        {/* City */}
        <div className="col-span-2 sm:col-span-1">
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
        
        {/* State/Province */}
        <div>
          <label className="block text-sm font-bold text-muted mb-2">
            {regionLabel}
          </label>
          {showRegionDropdown ? (
            <select
              value={clientState}
              onChange={(e) => setClientState(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-xl"
            >
              <option value="">Select...</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={clientState}
              onChange={(e) => setClientState(e.target.value)}
              placeholder="State/Province"
              className="w-full px-4 py-2 border border-line rounded-xl"
            />
          )}
        </div>
        
        {/* Postal Code */}
        <div>
          <label className="block text-sm font-bold text-muted mb-2">
            {postalCodeLabel}
          </label>
          <input
            type="text"
            value={clientPostalCode}
            onChange={(e) => setClientPostalCode(e.target.value)}
            placeholder={postalCodePlaceholder}
            className="w-full px-4 py-2 border border-line rounded-xl"
          />
        </div>
        
        {/* Country */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-bold text-muted mb-2">
            Country
          </label>
          <select
            value={clientCountry}
            onChange={(e) => onCountryChange(e.target.value)}
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
    </>
  );
}

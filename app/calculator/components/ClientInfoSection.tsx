/**
 * ClientInfoSection Component
 * 
 * Collects client contact information: name, email, phone, and address.
 * Handles country-specific address formatting (US states, Canadian provinces, etc.)
 * Features client autocomplete for repeat clients.
 * 
 * @module calculator/components/ClientInfoSection
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { COUNTRY_OPTIONS } from "../../types";
import {
  getRegionsForCountry,
  countryHasRegionDropdown,
  getRegionLabel,
  getPostalCodeLabel,
  getPostalCodePlaceholder,
} from "../../lib/locations";
import { storage } from "../../lib/storage";
import type { Project } from "../../types";

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

interface ClientMatch {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Form section for collecting client contact and address information.
 * 
 * Features:
 * - Phone number auto-formatting (XXX-XXX-XXXX)
 * - Country-aware state/province dropdown
 * - Dynamic postal code labels (ZIP Code, Postal Code, etc.)
 * - Client autocomplete for repeat clients
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
  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchingClients, setMatchingClients] = useState<ClientMatch[]>([]);
  const [isRepeatClient, setIsRepeatClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get location-specific labels and options based on selected country
  const regions = getRegionsForCountry(clientCountry);
  const showRegionDropdown = countryHasRegionDropdown(clientCountry);
  const regionLabel = getRegionLabel(clientCountry);
  const postalCodeLabel = getPostalCodeLabel(clientCountry);
  const postalCodePlaceholder = getPostalCodePlaceholder(clientCountry);

  /**
   * Search for matching clients based on name input
   */
  const searchClients = async (firstName: string, lastName: string) => {
    if (!firstName && !lastName) {
      setMatchingClients([]);
      setShowSuggestions(false);
      return;
    }

    const projects = await storage.getProjects();
    
    // Build unique clients map (keyed by first+last name)
    const clientsMap = new Map<string, ClientMatch>();
    
    projects.forEach((project) => {
      const key = `${project.clientFirstName}-${project.clientLastName}`.toLowerCase();
      
      // Skip if already have this client or if no name
      if (clientsMap.has(key) || !project.clientFirstName || !project.clientLastName) {
        return;
      }

      // Check if this project matches the search
      const firstMatch = !firstName || 
        project.clientFirstName.toLowerCase().startsWith(firstName.toLowerCase());
      const lastMatch = !lastName || 
        project.clientLastName.toLowerCase().startsWith(lastName.toLowerCase());

      if (firstMatch && lastMatch) {
        clientsMap.set(key, {
          id: project.id,
          firstName: project.clientFirstName,
          lastName: project.clientLastName,
          email: project.clientEmail,
          phone: project.clientPhone,
          street: project.clientStreet,
          city: project.clientCity,
          state: project.clientState,
          postalCode: project.clientPostalCode,
          country: project.clientCountry,
        });
      }
    });

    const matches = Array.from(clientsMap.values());
    setMatchingClients(matches);
    setShowSuggestions(matches.length > 0);
  };

  /**
   * Debounced search effect - triggers 300ms after user stops typing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      searchClients(clientFirstName, clientLastName);
    }, 300);

    return () => clearTimeout(timer);
  }, [clientFirstName, clientLastName]);

  /**
   * Handle clicking outside dropdown to close it
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Auto-fill all client info when selecting from suggestions
   */
  const selectClient = (client: ClientMatch) => {
    setClientFirstName(client.firstName);
    setClientLastName(client.lastName);
    setClientEmail(client.email || "");
    if (client.phone) {
      onPhoneChange(client.phone);
    }
    setClientStreet(client.street || "");
    setClientCity(client.city || "");
    setClientState(client.state || "");
    setClientPostalCode(client.postalCode || "");
    if (client.country) {
      onCountryChange(client.country);
    }
    setIsRepeatClient(true);
    setShowSuggestions(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-plum">
          Client Information
        </h2>
        {isRepeatClient && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            ✓ REPEAT CLIENT
          </span>
        )}
      </div>

      {/* Name Fields with Autocomplete */}
      <div className="relative" ref={dropdownRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-muted mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={clientFirstName}
              onChange={(e) => {
                setClientFirstName(e.target.value);
                setIsRepeatClient(false);
              }}
              placeholder="Jane"
              className="w-full px-4 py-2 border border-line rounded-xl"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={clientLastName}
              onChange={(e) => {
                setClientLastName(e.target.value);
                setIsRepeatClient(false);
              }}
              placeholder="Doe"
              className="w-full px-4 py-2 border border-line rounded-xl"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && matchingClients.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-bold text-muted px-2 py-1">
                Previous Clients:
              </div>
              {matchingClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => selectClient(client)}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <div className="font-bold text-plum">
                    {client.firstName} {client.lastName}
                  </div>
                  <div className="text-xs text-muted">
                    {[client.email, client.phone, client.city, client.state]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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
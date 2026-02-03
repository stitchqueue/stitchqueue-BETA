// Location data and utilities for Country/State/Province dropdowns

// ============================================
// US STATES & TERRITORIES
// ============================================

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
  // US Territories
  { code: "AS", name: "American Samoa" },
  { code: "GU", name: "Guam" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "PR", name: "Puerto Rico" },
  { code: "VI", name: "U.S. Virgin Islands" },
] as const;

// ============================================
// CANADIAN PROVINCES & TERRITORIES
// ============================================

export const CA_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

// ============================================
// COUNTRY OPTIONS
// ============================================

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "OTHER", name: "Other" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get states/provinces for a given country
 * Returns empty array for "Other" countries (free text entry)
 */
export function getRegionsForCountry(
  countryCode: string
): { code: string; name: string }[] {
  switch (countryCode) {
    case "US":
    case "United States":
      return [...US_STATES];
    case "CA":
    case "Canada":
      return [...CA_PROVINCES];
    default:
      return [];
  }
}

/**
 * Check if a country uses a dropdown for state/province
 */
export function countryHasRegionDropdown(countryCode: string): boolean {
  return (
    countryCode === "US" ||
    countryCode === "United States" ||
    countryCode === "CA" ||
    countryCode === "Canada"
  );
}

/**
 * Get the label for the state/province field based on country
 */
export function getRegionLabel(countryCode: string): string {
  switch (countryCode) {
    case "US":
    case "United States":
      return "State";
    case "CA":
    case "Canada":
      return "Province";
    default:
      return "State/Province";
  }
}

/**
 * Get the label for the postal code field based on country
 */
export function getPostalCodeLabel(countryCode: string): string {
  switch (countryCode) {
    case "US":
    case "United States":
      return "ZIP Code";
    case "CA":
    case "Canada":
      return "Postal Code";
    default:
      return "Postal Code";
  }
}

/**
 * Get placeholder for postal code based on country
 */
export function getPostalCodePlaceholder(countryCode: string): string {
  switch (countryCode) {
    case "US":
    case "United States":
      return "99201";
    case "CA":
    case "Canada":
      return "V6B 1A1";
    default:
      return "Postal Code";
  }
}

/**
 * Convert country name to code (for migration/compatibility)
 */
export function countryNameToCode(name: string): string {
  switch (name) {
    case "United States":
      return "US";
    case "Canada":
      return "CA";
    default:
      return "OTHER";
  }
}

/**
 * Convert country code to name
 */
export function countryCodeToName(code: string): string {
  const country = COUNTRIES.find((c) => c.code === code);
  return country?.name || code;
}
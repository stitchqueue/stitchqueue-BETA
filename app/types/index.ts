export type Stage =
  | "Intake"
  | "Estimate"
  | "In Progress"
  | "Invoiced"
  | "Paid/Shipped"
  | "Archived";

export type MeasurementSystem = "imperial" | "metric";

export type RequestedDateType = "asap" | "no_date" | "specific_date";

export const STAGES: Stage[] = [
  "Intake",
  "Estimate",
  "In Progress",
  "Invoiced",
  "Paid/Shipped",
  "Archived",
];

// Country options for dropdown
export const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Mexico",
  "Ecuador",
] as const;

export type Country = (typeof COUNTRY_OPTIONS)[number] | string;

export interface Project {
  id: string;
  stage: Stage;
  intakeDate: string;
  estimateNumber?: number;
  requestedDateType: RequestedDateType;
  requestedCompletionDate?: string;
  dueDate?: string;
  // Order index for manual sorting within a stage
  orderIndex?: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail?: string;
  clientPhone?: string;
  // Address fields (separate)
  clientStreet?: string;
  clientCity?: string;
  clientState?: string;
  clientPostalCode?: string;
  clientCountry?: string;
  // Legacy single address field (for backwards compatibility)
  clientAddress?: string;
  description?: string;
  cardLabel?: string;
  quiltWidth?: number;
  quiltLength?: number;
  backingWidth?: number;
  backingLength?: number;
  serviceType?: string;
  quiltingType?: string;
  threadChoice?: string;
  battingChoice?: string;
  battingLengthAddition?: string;
  clientSuppliesBatting?: boolean;
  bindingType?: string;
  // Deposit fields
  depositType?: "percentage" | "flat";
  depositPercentage?: number;
  depositAmount?: number;
  depositPaid?: boolean;
  depositPaidDate?: string;
  depositPaidMethod?: string;
  depositPaidAmount?: number;
  // Estimate data
  estimateData?: {
    quiltingType: string;
    quiltingRate: number;
    squareInches: number;
    quiltingCost: number;
    threadName: string;
    threadCost: number;
    battingName: string;
    battingLength: number;
    battingCost: number;
    bindingType: string;
    bindingPerimeter: number;
    bindingRate: number;
    bindingCost: number;
    bobbinCount: number;
    bobbinPrice: number;
    bobbinCost: number;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    clientSuppliesBatting?: boolean;
  };
  notes?: Note[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface ThreadOption {
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface BattingOption {
  name: string;
  widthInches: number;
  pricePerInch: number;
  isDefault?: boolean;
}

export interface PricingRates {
  lightE2E?: number;
  standardE2E?: number;
  lightCustom?: number;
  custom?: number;
  denseCustom?: number;
  bindingTopAttached?: number;
  bindingFullyAttached?: number;
}

export interface Settings {
  // Business Info
  businessName?: string;
  // Address fields (separate)
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Legacy single address field (for backwards compatibility)
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;

  // Brand Colors
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;

  // Measurement & Currency
  measurementSystem: MeasurementSystem;
  currencyCode?: string;
  taxRate?: number;
  taxLabel?: string;

  // Estimate Numbering
  nextEstimateNumber: number;

  // Pricing (PAID tier only)
  pricingRates?: PricingRates;
  bobbinPrice?: number;

  // Thread & Batting Options (PAID tier only)
  threadOptions: ThreadOption[];
  battingOptions: BattingOption[];

  // Tier
  isPaidTier: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  measurementSystem: "imperial",
  currencyCode: "USD",
  taxRate: 0,
  taxLabel: "Sales Tax",
  nextEstimateNumber: 1001,
  threadOptions: [],
  battingOptions: [],
  isPaidTier: false,
  brandPrimaryColor: "#4e283a",
  brandSecondaryColor: "#98823a",
  country: "United States",
};

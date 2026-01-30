export type Stage =
  | "Intake"
  | "Estimate"
  | "In Progress"
  | "Invoiced"
  | "Paid/Shipped"
  | "Archived";

export type MeasurementSystem = "imperial" | "metric";

export type RequestedDateType = "asap" | "no_date" | "specific_date";

export interface Project {
  id: string;
  stage: Stage;
  intakeDate: string;
  estimateNumber?: number; // NEW - Estimate number assigned when estimate is created
  requestedDateType: RequestedDateType;
  requestedCompletionDate?: string;
  dueDate?: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail?: string;
  clientPhone?: string;
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
  notes: Note[];
  attachments: Attachment[];
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
  nextEstimateNumber: number; // NEW - starts at 1001, increments with each estimate

  // Pricing (PAID tier only)
  pricingRates?: PricingRates;
  bobbinPrice?: number;

  // Thread & Batting Options (PAID tier only)
  threadOptions: ThreadOption[];
  battingOptions: BattingOption[];

  // Tier
  isPaidTier: boolean;
}

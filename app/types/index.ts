export type Project = {
  id: string;
  stage: Stage;
  clientFirstName: string;
  clientLastName: string;
  clientEmail?: string;
  clientPhone?: string;
  intakeDate: string;
  requestedDateType: "asap" | "no_date" | "specific_date";
  requestedCompletionDate?: string;
  dueDate?: string;
  description?: string;
  cardLabel?: string;
  quiltWidth?: number;
  quiltLength?: number;
  quiltingType?: string;
  threadChoice?: string;
  battingChoice?: string;
  bindingType?: string;
  estimateNumber?: number;
  estimateData?: EstimateData;
  depositAmount?: number;
  depositPercent?: number;
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
};

export type EstimateData = {
  quiltWidth: number;
  quiltLength: number;
  quiltArea: number;
  quiltingType: string;
  quiltingRate: number;
  quiltingTotal: number;
  threadCost: number;
  battingChoice: string;
  battingWidth: number;
  battingPricePerInch: number;
  battingLengthAddition: number;
  battingLengthNeeded: number;
  battingTotal: number;
  clientSuppliesBatting: boolean;
  bindingType: string;
  bindingRatePerInch: number;
  bindingPerimeter: number;
  bindingTotal: number;
  subtotal: number;
  total: number;
  createdAt: string;
};

export type Stage =
  | "Intake"
  | "Estimate"
  | "In Progress"
  | "Invoiced"
  | "Paid/Shipped"
  | "Archived";

export type Note = {
  id: string;
  text: string;
  createdAt: string;
};

export const STAGES: Stage[] = [
  "Intake",
  "Estimate",
  "In Progress",
  "Invoiced",
  "Paid/Shipped",
];

// Settings Types
export type Settings = {
  // Business Info
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  businessWebsite: string;
  logoUrl: string;

  // Brand Colors
  brandPrimaryColor: string;
  brandSecondaryColor: string;

  // Measurement System
  measurementSystem: "imperial" | "metric";

  // Currency & Tax
  currencyCode: string;
  taxRate: number;
  taxLabel: string;

  // Subscription
  subscriptionTier: "free" | "paid";

  // Pricing Rates
  pricingRates: PricingRates;

  // Thread Options
  threadOptions: ThreadOption[];

  // Batting Options
  battingOptions: BattingOption[];
};

export type PricingRates = {
  lightE2E: number;
  standardE2E: number;
  lightCustom: number;
  custom: number;
  denseCustom: number;
  bindingTopAttached: number; // per inch
  bindingFullyAttached: number; // per inch
};

export type ThreadOption = {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
};

export type BattingOption = {
  id: string;
  name: string;
  width: number; // inches
  pricePerInch: number;
  isDefault: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  businessName: "",
  businessAddress: "",
  businessEmail: "",
  businessPhone: "",
  businessWebsite: "",
  logoUrl: "",
  brandPrimaryColor: "#4e283a",
  brandSecondaryColor: "#98823a",
  measurementSystem: "imperial",
  currencyCode: "USD",
  taxRate: 0,
  taxLabel: "Sales Tax",
  subscriptionTier: "free",
  pricingRates: {
    lightE2E: 0.01,
    standardE2E: 0.015,
    lightCustom: 0.02,
    custom: 0.025,
    denseCustom: 0.03,
    bindingTopAttached: 0.1,
    bindingFullyAttached: 0.2,
  },
  threadOptions: [],
  battingOptions: [],
};

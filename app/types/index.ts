export type Stage =
  | "Intake"
  | "Estimate"
  | "In Progress"
  | "Invoiced"
  | "Paid/Shipped"
  | "Archived";

export type MeasurementSystem = "imperial" | "metric";

export type RequestedDateType = "asap" | "no_date" | "specific_date";

export type InvoiceType = "regular" | "gift" | "charitable";

export const STAGES: Stage[] = [
  "Intake",
  "Estimate",
  "In Progress",
  "Invoiced",
  "Paid/Shipped",
  "Archived",
];

// Country options for dropdown (simplified - detailed data in locations.ts)
export const COUNTRY_OPTIONS = ["United States", "Canada", "Other"] as const;

export type Country = (typeof COUNTRY_OPTIONS)[number] | string;

// Extra charge for estimates/invoices (shipping, rush fees, custom charges, etc.)
export interface ExtraCharge {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
}

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
  battingChoice?: string;
  battingLengthAddition?: string;
  clientSuppliesBatting?: boolean;
  bindingType?: string;
  // Bobbin fields
  bobbinChoice?: string;
  // Extra charges (shipping, rush, custom fees)
  extraCharges?: ExtraCharge[];
  // Discount fields
  discountType?: "percentage" | "flat";
  discountValue?: number;
  discountAmount?: number;
  // Donation/Gift fields
  isDonation?: boolean;
  invoiceType?: InvoiceType;
  // Deposit fields
  depositType?: "percentage" | "flat";
  depositPercentage?: number;
  depositAmount?: number;
  depositPaid?: boolean;
  depositPaidDate?: string;
  depositPaidMethod?: string;
  depositPaidAmount?: number;
  // Final payment fields
  finalPaymentAmount?: number;
  finalPaymentDate?: string;
  finalPaymentMethod?: string;
  paidInFull?: boolean;
  // Estimate data
  estimateData?: {
    quiltArea?: number;
    quiltingType?: string;
    quiltingRate?: number;
    quiltingTotal?: number;
    squareInches?: number;
    quiltingCost?: number;
    battingName?: string;
    battingLength?: number;
    battingCost?: number;
    battingLengthNeeded?: number;
    battingTotal?: number;
    clientSuppliesBatting?: boolean;
    bindingType?: string;
    bindingPerimeter?: number;
    bindingRate?: number;
    bindingCost?: number;
    bindingRatePerInch?: number;
    bindingTotal?: number;
    // Bobbin fields
    bobbinName?: string;
    bobbinCount?: number;
    bobbinPrice?: number;
    bobbinCost?: number;
    bobbinTotal?: number;
    // Extra charges
    extraCharges?: ExtraCharge[];
    extraChargesTotal?: number;
    extraChargesTaxable?: number;
    // Discount fields
    discountType?: "percentage" | "flat";
    discountValue?: number;
    discountAmount?: number;
    // Donation fields
    isDonation?: boolean;
    invoiceType?: InvoiceType;
    mileage?: number;
    mileageTotal?: number;
    // Totals
    subtotal?: number;
    taxRate?: number;
    taxAmount?: number;
    total?: number;
    depositType?: "percentage" | "flat" | null;
    depositPercentage?: number;
    depositFlat?: number;
    depositAmount?: number;
    balanceDue?: number;
    createdAt?: string;
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

// Bobbin option for PRO tier (multiple bobbin types)
export interface BobbinOption {
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

  // Bobbin & Batting Options (PAID tier only)
  bobbinOptions: BobbinOption[];
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
  bobbinOptions: [],
  battingOptions: [],
  isPaidTier: false,
  brandPrimaryColor: "#4e283a",
  brandSecondaryColor: "#98823a",
  country: "United States",
};
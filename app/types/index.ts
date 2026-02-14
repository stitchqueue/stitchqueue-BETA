export type Stage =
  | "Estimates"
  | "In Progress"
  | "Completed"
  | "Archived";

export type MeasurementSystem = "imperial" | "metric";

export type RequestedDateType = "asap" | "no_date" | "specific_date";

export type InvoiceType = "regular" | "gift" | "charitable";

export type ProjectType = "regular" | "gift" | "charitable";

export type DeliveryMethod = "pickup" | "shipped" | "mailed";

export const STAGES: Stage[] = [
  "Estimates",
  "In Progress",
  "Completed",
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
  customQuiltingRate?: number; // For "Custom Rate" quilting type
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

  // ============================================================================
  // v4.0 NEW FIELDS - 3-Stage Workflow Checklist
  // ============================================================================
  approvalStatus?: boolean;
  approvalDate?: string;
  invoiced?: boolean;
  invoicedAmount?: number;
  invoicedDate?: string;
  paid?: boolean;
  paidAmount?: number;
  paidDate?: string;
  delivered?: boolean;
  deliveryMethod?: DeliveryMethod;
  deliveryDate?: string;
  balanceRemaining?: number;
  donatedValue?: number;
  projectType?: ProjectType;

  // ============================================================================
  // DEPRECATED FIELDS (v4.0) - kept for backward compatibility
  // ============================================================================
  // Tax fields (dual rate system) - DEPRECATED: QuickBooks handles tax
  taxExempt?: boolean;              // Tax-exempt sales (out of state, etc.)
  taxPrimaryRate?: number;          // Primary tax rate (%) - copied from Settings or overridden
  taxPrimaryAmount?: number;        // Calculated primary tax amount
  taxSecondaryRate?: number;        // Secondary tax rate (%) - only if enabled
  taxSecondaryAmount?: number;      // Calculated secondary tax amount
  taxTotalAmount?: number;          // Sum of primary + secondary
  // Final payment fields - DEPRECATED: Simplified to paid checkbox
  finalPaymentAmount?: number;
  finalPaymentDate?: string;
  finalPaymentMethod?: string;
  paidInFull?: boolean;

  // ============================================================================
  // CURRENT FIELDS (unchanged)
  // ============================================================================
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
    quiltArea?: number;
    quiltingType?: string;
    quiltingRate?: number;
    quiltingTotal?: number;
    battingLengthNeeded?: number;
    battingTotal?: number;
    clientSuppliesBatting?: boolean;
    bindingPerimeter?: number;
    bindingRatePerInch?: number;
    bindingTotal?: number;
    bobbinName?: string;
    bobbinCount?: number;
    bobbinPrice?: number;
    bobbinTotal?: number;
    extraCharges?: ExtraCharge[];
    extraChargesTotal?: number;
    extraChargesTaxable?: number;
    discountType?: "percentage" | "flat" | null;
    discountValue?: number;
    discountAmount?: number;
    isDonation?: boolean;
    subtotal?: number;
    // Tax snapshot at estimate time
    taxExempt?: boolean;
    taxPrimaryRate?: number;
    taxPrimaryLabel?: string;
    taxPrimaryAmount?: number;
    taxSecondaryRate?: number;
    taxSecondaryLabel?: string;
    taxSecondaryAmount?: number;
    taxTotalAmount?: number;
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

  // Tax Configuration (Dual Rate System) - DEPRECATED in v4.0
  taxPrimaryRate?: number;          // Primary tax rate (e.g., 5.0 for GST or 7.5 for Sales Tax)
  taxPrimaryLabel?: string;         // Label for primary tax (e.g., "GST", "Sales Tax")
  taxSecondaryEnabled?: boolean;    // Enable secondary tax (for dual-rate systems)
  taxSecondaryRate?: number;        // Secondary tax rate (e.g., 7.0 for PST)
  taxSecondaryLabel?: string;       // Label for secondary tax (e.g., "PST", "Provincial Tax")

  // Legacy single tax field (backwards compatibility)
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

  // Default tax configuration (single-rate US style) - DEPRECATED in v4.0
  taxPrimaryRate: 0,
  taxPrimaryLabel: "Sales Tax",
  taxSecondaryEnabled: false,
  taxSecondaryRate: 0,
  taxSecondaryLabel: "Provincial Tax",

  // Legacy fields for backwards compatibility
  taxRate: 0,
  taxLabel: "Sales Tax",

  nextEstimateNumber: 1001,
  bobbinOptions: [],
  battingOptions: [],
  isPaidTier: true,
  brandPrimaryColor: "#4e283a",
  brandSecondaryColor: "#98823a",
};

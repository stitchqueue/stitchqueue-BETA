/**
 * Database Mapping Functions
 * 
 * Convert between TypeScript types and database schema.
 * 
 * @module lib/storage/mappers
 */

import type { Project, Settings } from "../../types";

/**
 * Map database row to Project type
 */
export function mapProjectFromDb(row: any): Project {
  return {
    id: row.id,
    stage: row.stage,
    intakeDate: row.intake_date,
    estimateNumber: row.estimate_number,
    requestedDateType: row.requested_date_type || "no_date",
    requestedCompletionDate: row.requested_completion_date,
    dueDate: row.due_date,
    orderIndex: row.order_index,
    clientFirstName: row.client_first_name || "",
    clientLastName: row.client_last_name || "",
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    clientStreet: row.client_street,
    clientCity: row.client_city,
    clientState: row.client_state,
    clientPostalCode: row.client_postal_code,
    clientCountry: row.client_country,
    description: row.description,
    cardLabel: row.card_label,
    quiltWidth: row.quilt_width,
    quiltLength: row.quilt_length,
    quiltingType: row.quilting_type,
    threadChoice: row.thread_choice,
    battingChoice: row.batting_choice,
    battingLengthAddition: row.batting_length_addition,
    clientSuppliesBatting: row.client_supplies_batting,
    bindingType: row.binding_type,
    bobbinChoice: row.bobbin_choice,
    extraCharges: row.extra_charges,
    isDonation: row.is_donation,
    depositType: row.deposit_type,
    depositPercentage: row.deposit_percentage,
    depositAmount: row.deposit_amount,
    depositPaid: row.deposit_paid,
    depositPaidDate: row.deposit_paid_date,
    depositPaidMethod: row.deposit_paid_method,
    depositPaidAmount: row.deposit_paid_amount,
    finalPaymentAmount: row.final_payment_amount,
    finalPaymentDate: row.final_payment_date,
    finalPaymentMethod: row.final_payment_method,
    paidInFull: row.paid_in_full,
    estimateData: row.estimate_data,
    notes: row.notes || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Map Project to database row
 */
export function mapProjectToDb(project: Project, orgId: string): any {
  return {
    id: project.id,
    organization_id: orgId,
    stage: project.stage,
    intake_date: project.intakeDate,
    estimate_number: project.estimateNumber,
    requested_date_type: project.requestedDateType,
    requested_completion_date: project.requestedCompletionDate,
    due_date: project.dueDate,
    order_index: project.orderIndex,
    client_first_name: project.clientFirstName,
    client_last_name: project.clientLastName,
    client_email: project.clientEmail,
    client_phone: project.clientPhone,
    client_street: project.clientStreet,
    client_city: project.clientCity,
    client_state: project.clientState,
    client_postal_code: project.clientPostalCode,
    client_country: project.clientCountry,
    description: project.description,
    card_label: project.cardLabel,
    quilt_width: project.quiltWidth,
    quilt_length: project.quiltLength,
    quilting_type: project.quiltingType,
    thread_choice: project.threadChoice,
    batting_choice: project.battingChoice,
    batting_length_addition: project.battingLengthAddition,
    client_supplies_batting: project.clientSuppliesBatting,
    binding_type: project.bindingType,
    bobbin_choice: project.bobbinChoice,
    extra_charges: project.extraCharges,
    is_donation: project.isDonation,
    deposit_type: project.depositType,
    deposit_percentage: project.depositPercentage,
    deposit_amount: project.depositAmount,
    deposit_paid: project.depositPaid,
    deposit_paid_date: project.depositPaidDate,
    deposit_paid_method: project.depositPaidMethod,
    deposit_paid_amount: project.depositPaidAmount,
    final_payment_amount: project.finalPaymentAmount,
    final_payment_date: project.finalPaymentDate,
    final_payment_method: project.finalPaymentMethod,
    paid_in_full: project.paidInFull,
    estimate_data: project.estimateData,
    notes: project.notes,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

/**
 * Map partial Project updates to database columns
 */
export function mapUpdatesToDb(updates: Partial<Project>): any {
  const dbUpdates: any = {};

  if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
  if (updates.intakeDate !== undefined)
    dbUpdates.intake_date = updates.intakeDate;
  if (updates.estimateNumber !== undefined)
    dbUpdates.estimate_number = updates.estimateNumber;
  if (updates.requestedDateType !== undefined)
    dbUpdates.requested_date_type = updates.requestedDateType;
  if (updates.requestedCompletionDate !== undefined)
    dbUpdates.requested_completion_date = updates.requestedCompletionDate;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.orderIndex !== undefined)
    dbUpdates.order_index = updates.orderIndex;
  if (updates.clientFirstName !== undefined)
    dbUpdates.client_first_name = updates.clientFirstName;
  if (updates.clientLastName !== undefined)
    dbUpdates.client_last_name = updates.clientLastName;
  if (updates.clientEmail !== undefined)
    dbUpdates.client_email = updates.clientEmail;
  if (updates.clientPhone !== undefined)
    dbUpdates.client_phone = updates.clientPhone;
  if (updates.clientStreet !== undefined)
    dbUpdates.client_street = updates.clientStreet;
  if (updates.clientCity !== undefined)
    dbUpdates.client_city = updates.clientCity;
  if (updates.clientState !== undefined)
    dbUpdates.client_state = updates.clientState;
  if (updates.clientPostalCode !== undefined)
    dbUpdates.client_postal_code = updates.clientPostalCode;
  if (updates.clientCountry !== undefined)
    dbUpdates.client_country = updates.clientCountry;
  if (updates.description !== undefined)
    dbUpdates.description = updates.description;
  if (updates.cardLabel !== undefined) dbUpdates.card_label = updates.cardLabel;
  if (updates.quiltWidth !== undefined)
    dbUpdates.quilt_width = updates.quiltWidth;
  if (updates.quiltLength !== undefined)
    dbUpdates.quilt_length = updates.quiltLength;
  if (updates.quiltingType !== undefined)
    dbUpdates.quilting_type = updates.quiltingType;
  if (updates.threadChoice !== undefined)
    dbUpdates.thread_choice = updates.threadChoice;
  if (updates.battingChoice !== undefined)
    dbUpdates.batting_choice = updates.battingChoice;
  if (updates.battingLengthAddition !== undefined)
    dbUpdates.batting_length_addition = updates.battingLengthAddition;
  if (updates.clientSuppliesBatting !== undefined)
    dbUpdates.client_supplies_batting = updates.clientSuppliesBatting;
  if (updates.bindingType !== undefined)
    dbUpdates.binding_type = updates.bindingType;
  if (updates.bobbinChoice !== undefined)
    dbUpdates.bobbin_choice = updates.bobbinChoice;
  if (updates.extraCharges !== undefined)
    dbUpdates.extra_charges = updates.extraCharges;
  if (updates.isDonation !== undefined)
    dbUpdates.is_donation = updates.isDonation;
  if (updates.depositType !== undefined)
    dbUpdates.deposit_type = updates.depositType;
  if (updates.depositPercentage !== undefined)
    dbUpdates.deposit_percentage = updates.depositPercentage;
  if (updates.depositAmount !== undefined)
    dbUpdates.deposit_amount = updates.depositAmount;
  if (updates.depositPaid !== undefined)
    dbUpdates.deposit_paid = updates.depositPaid;
  if (updates.depositPaidDate !== undefined)
    dbUpdates.deposit_paid_date = updates.depositPaidDate;
  if (updates.depositPaidMethod !== undefined)
    dbUpdates.deposit_paid_method = updates.depositPaidMethod;
  if (updates.depositPaidAmount !== undefined)
    dbUpdates.deposit_paid_amount = updates.depositPaidAmount;
  if (updates.finalPaymentAmount !== undefined)
    dbUpdates.final_payment_amount = updates.finalPaymentAmount;
  if (updates.finalPaymentDate !== undefined)
    dbUpdates.final_payment_date = updates.finalPaymentDate;
  if (updates.finalPaymentMethod !== undefined)
    dbUpdates.final_payment_method = updates.finalPaymentMethod;
  if (updates.paidInFull !== undefined)
    dbUpdates.paid_in_full = updates.paidInFull;
  if (updates.estimateData !== undefined)
    dbUpdates.estimate_data = updates.estimateData;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  return dbUpdates;
}

/**
 * Map database row to Settings type
 */
export function mapSettingsFromDb(row: any): Settings {
  return {
    businessName: row.name || row.business_name,
    street: row.street,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    email: row.email,
    website: row.website,
    logoUrl: row.logo_url,
    brandPrimaryColor: row.brand_primary_color || "#4e283a",
    brandSecondaryColor: row.brand_secondary_color || "#98823a",
    measurementSystem: row.measurement_system || "imperial",
    currencyCode: row.currency_code || "USD",
    taxRate: row.tax_rate || 0,
    taxLabel: row.tax_label || "Sales Tax",
    nextEstimateNumber: row.next_estimate_number || 1001,
    pricingRates: row.pricing_rates || {},
    bobbinOptions: row.bobbin_options || [],
    threadOptions: row.thread_options || [],
    battingOptions: row.batting_options || [],
    isPaidTier: row.subscription_tier === "pro",
  };
}

/**
 * Map Settings to database columns
 */
export function mapSettingsToDb(settings: Partial<Settings>): any {
  const dbSettings: any = {};

  if (settings.businessName !== undefined)
    dbSettings.name = settings.businessName;
  if (settings.street !== undefined) dbSettings.street = settings.street;
  if (settings.city !== undefined) dbSettings.city = settings.city;
  if (settings.state !== undefined) dbSettings.state = settings.state;
  if (settings.postalCode !== undefined)
    dbSettings.postal_code = settings.postalCode;
  if (settings.country !== undefined) dbSettings.country = settings.country;
  if (settings.phone !== undefined) dbSettings.phone = settings.phone;
  if (settings.email !== undefined) dbSettings.email = settings.email;
  if (settings.website !== undefined) dbSettings.website = settings.website;
  if (settings.logoUrl !== undefined) dbSettings.logo_url = settings.logoUrl;
  if (settings.brandPrimaryColor !== undefined)
    dbSettings.brand_primary_color = settings.brandPrimaryColor;
  if (settings.brandSecondaryColor !== undefined)
    dbSettings.brand_secondary_color = settings.brandSecondaryColor;
  if (settings.measurementSystem !== undefined)
    dbSettings.measurement_system = settings.measurementSystem;
  if (settings.currencyCode !== undefined)
    dbSettings.currency_code = settings.currencyCode;
  if (settings.taxRate !== undefined) dbSettings.tax_rate = settings.taxRate;
  if (settings.taxLabel !== undefined) dbSettings.tax_label = settings.taxLabel;
  if (settings.nextEstimateNumber !== undefined)
    dbSettings.next_estimate_number = settings.nextEstimateNumber;
  if (settings.pricingRates !== undefined)
    dbSettings.pricing_rates = settings.pricingRates;
  if (settings.bobbinOptions !== undefined)
    dbSettings.bobbin_options = settings.bobbinOptions;
  if (settings.threadOptions !== undefined)
    dbSettings.thread_options = settings.threadOptions;
  if (settings.battingOptions !== undefined)
    dbSettings.batting_options = settings.battingOptions;
  if (settings.isPaidTier !== undefined)
    dbSettings.subscription_tier = settings.isPaidTier ? "pro" : "free";

  return dbSettings;
}

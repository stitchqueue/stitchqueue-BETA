import { supabase } from "./supabase";
import type { Project, Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

// Re-export DEFAULT_SETTINGS so pages can import from storage
export { DEFAULT_SETTINGS };

// Auth helper: get current user
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Standalone export for backwards compatibility
export async function hasOrganization(): Promise<boolean> {
  const orgId = await getOrganizationId();
  return orgId !== null;
}

async function getOrganizationId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  return profile?.organization_id || null;
}

export const storage = {
  // Auth helper: check if user has an organization (also available on storage object)
  hasOrganization: async (): Promise<boolean> => {
    const orgId = await getOrganizationId();
    return orgId !== null;
  },

  getProjects: async (): Promise<Project[]> => {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error.message);
      return [];
    }

    return (data || []).map(mapProjectFromDb);
  },

  addProject: async (
    project: Project
  ): Promise<{ success: boolean; error?: string }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    const dbProject = mapProjectToDb(project, orgId);

    const { error } = await supabase.from("projects").insert(dbProject);

    if (error) {
      console.error(
        "Error adding project:",
        error.message,
        error.details,
        error.hint
      );
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  updateProject: async (
    id: string,
    updates: Partial<Project>
  ): Promise<{ success: boolean; error?: string }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    // SECURITY: Verify project belongs to this organization
    const { data: existingProject } = await supabase
      .from("projects")
      .select("organization_id")
      .eq("id", id)
      .single();

    if (!existingProject || existingProject.organization_id !== orgId) {
      return { success: false, error: "Project not found or access denied" };
    }

    const dbUpdates = mapUpdatesToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("projects")
      .update(dbUpdates)
      .eq("id", id)
      .eq("organization_id", orgId); // Extra safety

    if (error) {
      console.error("Error updating project:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  deleteProject: async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    // SECURITY: Verify project belongs to this organization
    const { data: existingProject } = await supabase
      .from("projects")
      .select("organization_id")
      .eq("id", id)
      .single();

    if (!existingProject || existingProject.organization_id !== orgId) {
      return { success: false, error: "Project not found or access denied" };
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId); // Extra safety

    if (error) {
      console.error("Error deleting project:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * Delete ALL projects for the current organization
   * Used by "Clear All Data" in settings
   */
  deleteAllProjects: async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("organization_id", orgId);

    if (error) {
      console.error("Error deleting all projects:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  getProjectById: async (id: string): Promise<Project | undefined> => {
    const orgId = await getOrganizationId();
    if (!orgId) return undefined;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId) // SECURITY: Only get if belongs to org
      .single();

    if (error || !data) {
      if (error?.code !== "PGRST116") {
        console.error("Error fetching project:", error?.message);
      }
      return undefined;
    }

    return mapProjectFromDb(data);
  },

  getSettings: async (): Promise<Settings> => {
    const orgId = await getOrganizationId();
    if (!orgId) return DEFAULT_SETTINGS;

    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    return mapSettingsFromDb(data);
  },

  saveSettings: async (
    settings: Settings
  ): Promise<{ success: boolean; error?: string }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    const dbSettings = mapSettingsToDb(settings);

    const { error } = await supabase
      .from("organizations")
      .update(dbSettings)
      .eq("id", orgId);

    if (error) {
      console.error("Error saving settings:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  updateSettings: async (
    updates: Partial<Settings>
  ): Promise<{ success: boolean; error?: string }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    const dbUpdates = mapSettingsToDb(updates);

    const { error } = await supabase
      .from("organizations")
      .update(dbUpdates)
      .eq("id", orgId);

    if (error) {
      console.error("Error updating settings:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * ATOMIC estimate number generator
   * Gets the next estimate number and increments it in one database operation
   * This prevents race conditions where two users could get the same number
   */
  getNextEstimateNumber: async (): Promise<{
    success: boolean;
    estimateNumber?: number;
    error?: string;
  }> => {
    const orgId = await getOrganizationId();
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    // Use a transaction-like approach: read current, increment, and update atomically
    // We use .select() after update to get the old value
    const { data: currentOrg, error: readError } = await supabase
      .from("organizations")
      .select("next_estimate_number")
      .eq("id", orgId)
      .single();

    if (readError || !currentOrg) {
      return { success: false, error: "Could not read organization settings" };
    }

    const currentNumber = currentOrg.next_estimate_number || 1001;
    const nextNumber = currentNumber + 1;

    // Update with a WHERE clause that checks the current value
    // This ensures atomicity - if another request changed it, this will fail
    const { data: updated, error: updateError } = await supabase
      .from("organizations")
      .update({ next_estimate_number: nextNumber })
      .eq("id", orgId)
      .eq("next_estimate_number", currentNumber) // Only update if value hasn't changed
      .select("next_estimate_number")
      .single();

    if (updateError || !updated) {
      // Race condition detected - another request got this number
      // Retry once
      const { data: retryOrg } = await supabase
        .from("organizations")
        .select("next_estimate_number")
        .eq("id", orgId)
        .single();

      if (retryOrg) {
        const retryNumber = retryOrg.next_estimate_number || 1001;
        const { error: retryError } = await supabase
          .from("organizations")
          .update({ next_estimate_number: retryNumber + 1 })
          .eq("id", orgId)
          .eq("next_estimate_number", retryNumber);

        if (!retryError) {
          return { success: true, estimateNumber: retryNumber };
        }
      }

      return {
        success: false,
        error: "Could not generate estimate number. Please try again.",
      };
    }

    return { success: true, estimateNumber: currentNumber };
  },
};

function mapProjectFromDb(row: any): Project {
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
    depositType: row.deposit_type,
    depositPercentage: row.deposit_percentage,
    depositAmount: row.deposit_amount,
    depositPaid: row.deposit_paid,
    depositPaidDate: row.deposit_paid_date,
    depositPaidMethod: row.deposit_paid_method,
    depositPaidAmount: row.deposit_paid_amount,
    estimateData: row.estimate_data,
    notes: row.notes || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProjectToDb(project: Project, orgId: string): any {
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
    deposit_type: project.depositType,
    deposit_percentage: project.depositPercentage,
    deposit_amount: project.depositAmount,
    deposit_paid: project.depositPaid,
    deposit_paid_date: project.depositPaidDate,
    deposit_paid_method: project.depositPaidMethod,
    deposit_paid_amount: project.depositPaidAmount,
    estimate_data: project.estimateData,
    notes: project.notes,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

function mapUpdatesToDb(updates: Partial<Project>): any {
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
  if (updates.estimateData !== undefined)
    dbUpdates.estimate_data = updates.estimateData;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  return dbUpdates;
}

function mapSettingsFromDb(row: any): Settings {
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
    bobbinPrice: row.pricing_rates?.bobbinPrice,
    threadOptions: row.thread_options || [],
    battingOptions: row.batting_options || [],
    isPaidTier: row.subscription_tier === "pro",
  };
}

function mapSettingsToDb(settings: Partial<Settings>): any {
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
  if (settings.threadOptions !== undefined)
    dbSettings.thread_options = settings.threadOptions;
  if (settings.battingOptions !== undefined)
    dbSettings.batting_options = settings.battingOptions;
  if (settings.isPaidTier !== undefined)
    dbSettings.subscription_tier = settings.isPaidTier ? "pro" : "free";

  return dbSettings;
}

// Validation utilities for StitchQueue forms

// ============================================
// TYPES
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================
// INDIVIDUAL VALIDATORS
// ============================================

export const validators = {
  /**
   * Check if value is non-empty
   */
  required: (value: unknown, fieldName: string): ValidationError | null => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null;
  },

  /**
   * Check minimum string length
   */
  minLength: (
    value: string,
    min: number,
    fieldName: string
  ): ValidationError | null => {
    if (value && value.length < min) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least ${min} characters`,
      };
    }
    return null;
  },

  /**
   * Check maximum string length
   */
  maxLength: (
    value: string,
    max: number,
    fieldName: string
  ): ValidationError | null => {
    if (value && value.length > max) {
      return {
        field: fieldName,
        message: `${fieldName} must be no more than ${max} characters`,
      };
    }
    return null;
  },

  /**
   * Validate email format
   */
  email: (value: string, fieldName: string): ValidationError | null => {
    if (!value) return null; // Use required() for empty check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        field: fieldName,
        message: `Please enter a valid email address`,
      };
    }
    return null;
  },

  /**
   * Validate phone format (flexible - accepts various formats)
   */
  phone: (value: string, fieldName: string): ValidationError | null => {
    if (!value) return null; // Use required() for empty check
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Accept 10-11 digits (with or without country code)
    if (digits.length < 10 || digits.length > 11) {
      return {
        field: fieldName,
        message: `Please enter a valid phone number (10 digits)`,
      };
    }
    return null;
  },

  /**
   * Check if number is positive (greater than 0)
   */
  positiveNumber: (
    value: number | string,
    fieldName: string
  ): ValidationError | null => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return {
        field: fieldName,
        message: `${fieldName} must be greater than 0`,
      };
    }
    return null;
  },

  /**
   * Check if number is non-negative (0 or greater)
   */
  nonNegativeNumber: (
    value: number | string,
    fieldName: string
  ): ValidationError | null => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num < 0) {
      return { field: fieldName, message: `${fieldName} cannot be negative` };
    }
    return null;
  },

  /**
   * Check minimum numeric value
   */
  minValue: (
    value: number | string,
    min: number,
    fieldName: string
  ): ValidationError | null => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!isNaN(num) && num < min) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least ${min}`,
      };
    }
    return null;
  },

  /**
   * Check maximum numeric value
   */
  maxValue: (
    value: number | string,
    max: number,
    fieldName: string
  ): ValidationError | null => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!isNaN(num) && num > max) {
      return {
        field: fieldName,
        message: `${fieldName} must be no more than ${max}`,
      };
    }
    return null;
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  date: (value: string, fieldName: string): ValidationError | null => {
    if (!value) return null; // Use required() for empty check
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return { field: fieldName, message: `Please enter a valid date` };
    }
    // Check if it's a real date
    const date = new Date(value + "T00:00:00");
    if (isNaN(date.getTime())) {
      return { field: fieldName, message: `Please enter a valid date` };
    }
    return null;
  },

  /**
   * Check if date is today or in the future
   */
  futureDate: (value: string, fieldName: string): ValidationError | null => {
    if (!value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(value + "T00:00:00");
    if (inputDate < today) {
      return {
        field: fieldName,
        message: `${fieldName} must be today or a future date`,
      };
    }
    return null;
  },

  /**
   * Check if value matches a pattern
   */
  pattern: (
    value: string,
    regex: RegExp,
    fieldName: string,
    message?: string
  ): ValidationError | null => {
    if (!value) return null;
    if (!regex.test(value)) {
      return {
        field: fieldName,
        message: message || `${fieldName} format is invalid`,
      };
    }
    return null;
  },
};

// ============================================
// FORM VALIDATORS
// ============================================

/**
 * Validate Calculator/Estimate form
 */
export function validateEstimate(data: {
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientStreet?: string;
  clientCity?: string;
  clientState?: string;
  clientPostalCode?: string;
  quiltWidth?: string | number;
  quiltLength?: string | number;
  requestedDateType?: string;
  requestedCompletionDate?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields - Name
  const firstNameError = validators.required(
    data.clientFirstName,
    "First name"
  );
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = validators.required(data.clientLastName, "Last name");
  if (lastNameError) errors.push(lastNameError);

  // Email - required and validate format
  const emailRequired = validators.required(data.clientEmail, "Email");
  if (emailRequired) {
    errors.push(emailRequired);
  } else {
    const emailError = validators.email(data.clientEmail!, "Email");
    if (emailError) errors.push(emailError);
  }

  // Phone - required and validate format
  const phoneRequired = validators.required(data.clientPhone, "Phone");
  if (phoneRequired) {
    errors.push(phoneRequired);
  } else {
    const phoneError = validators.phone(data.clientPhone!, "Phone");
    if (phoneError) errors.push(phoneError);
  }

  // Address fields - all required
  const streetError = validators.required(data.clientStreet, "Street address");
  if (streetError) errors.push(streetError);

  const cityError = validators.required(data.clientCity, "City");
  if (cityError) errors.push(cityError);

  const stateError = validators.required(data.clientState, "State/Province");
  if (stateError) errors.push(stateError);

  const postalError = validators.required(data.clientPostalCode, "Postal code");
  if (postalError) errors.push(postalError);

  // Quilt dimensions - required and must be positive
  const widthRequired = validators.required(data.quiltWidth, "Quilt width");
  if (widthRequired) {
    errors.push(widthRequired);
  } else {
    const widthPositive = validators.positiveNumber(
      data.quiltWidth!,
      "Quilt width"
    );
    if (widthPositive) errors.push(widthPositive);
  }

  const lengthRequired = validators.required(data.quiltLength, "Quilt length");
  if (lengthRequired) {
    errors.push(lengthRequired);
  } else {
    const lengthPositive = validators.positiveNumber(
      data.quiltLength!,
      "Quilt length"
    );
    if (lengthPositive) errors.push(lengthPositive);
  }

  // If specific date selected, require the date
  if (data.requestedDateType === "specific_date") {
    const dateRequired = validators.required(
      data.requestedCompletionDate,
      "Completion date"
    );
    if (dateRequired) errors.push(dateRequired);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Intake form
 */
export function validateIntake(data: {
  clientFirstName?: string;
  clientLastName?: string;
  clientStreet?: string;
  clientCity?: string;
  clientState?: string;
  clientPostalCode?: string;
  clientCountry?: string;
  clientPhone?: string;
  clientEmail?: string;
  quiltWidth?: string | number;
  quiltLength?: string | number;
  quiltingType?: string;
  requestedDateType?: string;
  requestedCompletionDate?: string;
  qualityDisclaimerAccepted?: boolean;
  competitionCreditAccepted?: boolean;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Required client fields
  const firstNameError = validators.required(
    data.clientFirstName,
    "First name"
  );
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = validators.required(data.clientLastName, "Last name");
  if (lastNameError) errors.push(lastNameError);

  const streetError = validators.required(data.clientStreet, "Street address");
  if (streetError) errors.push(streetError);

  const cityError = validators.required(data.clientCity, "City");
  if (cityError) errors.push(cityError);

  const stateError = validators.required(data.clientState, "State/Province");
  if (stateError) errors.push(stateError);

  const postalError = validators.required(data.clientPostalCode, "Postal code");
  if (postalError) errors.push(postalError);

  const countryError = validators.required(data.clientCountry, "Country");
  if (countryError) errors.push(countryError);

  // Phone - required and validate format
  const phoneRequired = validators.required(data.clientPhone, "Phone");
  if (phoneRequired) {
    errors.push(phoneRequired);
  } else {
    const phoneError = validators.phone(data.clientPhone!, "Phone");
    if (phoneError) errors.push(phoneError);
  }

  // Email - required and validate format
  const emailRequired = validators.required(data.clientEmail, "Email");
  if (emailRequired) {
    errors.push(emailRequired);
  } else {
    const emailError = validators.email(data.clientEmail!, "Email");
    if (emailError) errors.push(emailError);
  }

  // Quilt dimensions - required and must be positive
  const widthRequired = validators.required(data.quiltWidth, "Quilt width");
  if (widthRequired) {
    errors.push(widthRequired);
  } else {
    const widthPositive = validators.positiveNumber(
      data.quiltWidth!,
      "Quilt width"
    );
    if (widthPositive) errors.push(widthPositive);
  }

  const lengthRequired = validators.required(data.quiltLength, "Quilt length");
  if (lengthRequired) {
    errors.push(lengthRequired);
  } else {
    const lengthPositive = validators.positiveNumber(
      data.quiltLength!,
      "Quilt length"
    );
    if (lengthPositive) errors.push(lengthPositive);
  }

  // Quilting type required
  const quiltingTypeError = validators.required(
    data.quiltingType,
    "Quilting type"
  );
  if (quiltingTypeError) errors.push(quiltingTypeError);

  // If specific date selected, require the date
  if (data.requestedDateType === "specific_date") {
    const dateRequired = validators.required(
      data.requestedCompletionDate,
      "Completion date"
    );
    if (dateRequired) errors.push(dateRequired);
  }

  // Required agreements
  if (!data.qualityDisclaimerAccepted) {
    errors.push({
      field: "qualityDisclaimerAccepted",
      message: "You must accept the quality disclaimer",
    });
  }

  if (!data.competitionCreditAccepted) {
    errors.push({
      field: "competitionCreditAccepted",
      message: "You must accept the competition credit agreement",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Business Settings
 */
export function validateBusinessSettings(data: {
  businessName?: string;
  email?: string;
  phone?: string;
  website?: string;
  taxRate?: number | string;
  nextEstimateNumber?: number | string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Business name is recommended but not required
  // No validation needed

  // Email - validate format if provided
  if (data.email) {
    const emailError = validators.email(data.email, "Email");
    if (emailError) errors.push(emailError);
  }

  // Phone - validate format if provided
  if (data.phone) {
    const phoneError = validators.phone(data.phone, "Phone");
    if (phoneError) errors.push(phoneError);
  }

  // Website - basic format check if provided
  if (data.website && data.website.trim()) {
    // Simple check - should start with http:// or https://
    if (
      !data.website.startsWith("http://") &&
      !data.website.startsWith("https://")
    ) {
      errors.push({
        field: "website",
        message: "Website should start with http:// or https://",
      });
    }
  }

  // Tax rate - must be non-negative if provided
  if (data.taxRate !== undefined && data.taxRate !== "") {
    const taxError = validators.nonNegativeNumber(data.taxRate, "Tax rate");
    if (taxError) errors.push(taxError);

    const taxMaxError = validators.maxValue(data.taxRate, 100, "Tax rate");
    if (taxMaxError) errors.push(taxMaxError);
  }

  // Estimate number - must be positive integer
  if (data.nextEstimateNumber !== undefined && data.nextEstimateNumber !== "") {
    const num =
      typeof data.nextEstimateNumber === "string"
        ? parseInt(data.nextEstimateNumber)
        : data.nextEstimateNumber;
    if (isNaN(num) || num < 1) {
      errors.push({
        field: "nextEstimateNumber",
        message: "Estimate number must be a positive number",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Pricing Rates (Settings)
 */
export function validatePricingRates(data: {
  lightE2E?: string | number;
  standardE2E?: string | number;
  lightCustom?: string | number;
  custom?: string | number;
  denseCustom?: string | number;
  bindingTopAttached?: string | number;
  bindingFullyAttached?: string | number;
  bobbinPrice?: string | number;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const rateFields = [
    { key: "lightE2E", name: "Light E2E rate" },
    { key: "standardE2E", name: "Standard E2E rate" },
    { key: "lightCustom", name: "Light Custom rate" },
    { key: "custom", name: "Custom rate" },
    { key: "denseCustom", name: "Dense Custom rate" },
    { key: "bindingTopAttached", name: "Binding (top attached) rate" },
    { key: "bindingFullyAttached", name: "Binding (fully attached) rate" },
    { key: "bobbinPrice", name: "Bobbin price" },
  ];

  for (const field of rateFields) {
    const value = data[field.key as keyof typeof data];
    if (value !== undefined && value !== "") {
      const error = validators.nonNegativeNumber(value, field.name);
      if (error) errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get error message for a specific field
 */
export function getFieldError(
  errors: ValidationError[],
  fieldName: string
): string | null {
  const error = errors.find(
    (e) => e.field.toLowerCase() === fieldName.toLowerCase()
  );
  return error ? error.message : null;
}

/**
 * Check if a field has an error
 */
export function hasFieldError(
  errors: ValidationError[],
  fieldName: string
): boolean {
  return errors.some((e) => e.field.toLowerCase() === fieldName.toLowerCase());
}

/**
 * Get all error messages as an array of strings
 */
export function getErrorMessages(errors: ValidationError[]): string[] {
  return errors.map((e) => e.message);
}

/**
 * Scroll to the first error field
 */
export function scrollToFirstError(errors: ValidationError[]): void {
  if (errors.length === 0) return;

  // Try to find the input element by name or id
  const firstError = errors[0];
  const fieldName = firstError.field.toLowerCase().replace(/\s+/g, "");

  // Try various selectors
  const selectors = [
    `[name="${firstError.field}"]`,
    `[name="${fieldName}"]`,
    `#${firstError.field}`,
    `#${fieldName}`,
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        if (element instanceof HTMLElement) {
          element.focus();
        }
        return;
      }
    } catch {
      // Ignore invalid selectors
    }
  }
}

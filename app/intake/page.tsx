"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { generateId, getTodayDate } from "../lib/utils";
import {
  validateIntake,
  getFieldError,
  hasFieldError,
  scrollToFirstError,
  ValidationError,
} from "../lib/validation";
import {
  FormField,
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
  FormErrorSummary,
  ValidationToast,
  SuccessToast,
} from "../components/FormField";
import type { Project, Settings } from "../types";
import { COUNTRY_OPTIONS, DEFAULT_SETTINGS } from "../types";
import {
  getRegionsForCountry,
  countryHasRegionDropdown,
  getRegionLabel,
  getPostalCodeLabel,
  getPostalCodePlaceholder,
} from "../lib/locations";

// Phone formatting helper
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

export default function IntakePage() {
  const router = useRouter();

  // Settings state (for thread/batting options)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientFirstName: "",
    clientLastName: "",
    clientStreet: "",
    clientCity: "",
    clientState: "",
    clientPostalCode: "",
    clientCountry: "United States",
    clientEmail: "",
    clientPhone: "",
    requestedDateType: "no_date" as "asap" | "no_date" | "specific_date",
    requestedCompletionDate: "",
    description: "",
    quiltWidth: "",
    quiltLength: "",
    backingWidth: "",
    backingLength: "",
    seamDirection: "",
    quiltingType: "",
    threadChoice: "",
    threadNotes: "",
    battingChoice: "",
    clientSuppliesBatting: false,
    bindingType: "",
    notes: "",
    photoReleaseGranted: true,
    photoReleaseKeepPrivate: false,
    qualityDisclaimerAccepted: false,
    competitionCreditAccepted: false,
  });

  const [showBackingWarning, setShowBackingWarning] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await storage.getSettings();
        setSettings(savedSettings);
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Check if we have thread/batting options
  const hasThreadOptions =
    settings.bobbinOptions && settings.bobbinOptions.length > 0;
  const hasBattingOptions =
    settings.battingOptions && settings.battingOptions.length > 0;

  // Get regions for selected country
  const regions = getRegionsForCountry(formData.clientCountry);
  const showRegionDropdown = countryHasRegionDropdown(formData.clientCountry);
  const regionLabel = getRegionLabel(formData.clientCountry);
  const postalCodeLabel = getPostalCodeLabel(formData.clientCountry);
  const postalCodePlaceholder = getPostalCodePlaceholder(formData.clientCountry);

  // Update form data helper
  const updateFormData = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    // Clear field error when user types
    clearFieldError(field);
  };

  // Handle country change - reset state when country changes
  const handleCountryChange = (newCountry: string) => {
    setFormData({
      ...formData,
      clientCountry: newCountry,
      clientState: "", // Reset state when country changes
    });
    clearFieldError("clientCountry");
    clearFieldError("clientState");
  };

  // Clear field error helper
  const clearFieldError = (fieldName: string) => {
    // Map form field names to validation field names
    const fieldMap: Record<string, string> = {
      clientFirstName: "First name",
      clientLastName: "Last name",
      clientStreet: "Street address",
      clientCity: "City",
      clientState: "State/Province",
      clientPostalCode: "Postal code",
      clientCountry: "Country",
      clientEmail: "Email",
      clientPhone: "Phone",
      quiltWidth: "Quilt width",
      quiltLength: "Quilt length",
      quiltingType: "Quilting type",
      requestedCompletionDate: "Completion date",
      qualityDisclaimerAccepted: "qualityDisclaimerAccepted",
      competitionCreditAccepted: "competitionCreditAccepted",
    };

    const validationFieldName = fieldMap[fieldName] || fieldName;

    if (hasFieldError(errors, validationFieldName)) {
      setErrors(
        errors.filter(
          (e) => e.field.toLowerCase() !== validationFieldName.toLowerCase()
        )
      );
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, clientPhone: formatted });
    clearFieldError("clientPhone");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return; // Prevent double-submit

    // Validate the form
    const validationResult = validateIntake({
      clientFirstName: formData.clientFirstName,
      clientLastName: formData.clientLastName,
      clientStreet: formData.clientStreet,
      clientCity: formData.clientCity,
      clientState: formData.clientState,
      clientPostalCode: formData.clientPostalCode,
      clientCountry: formData.clientCountry,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      quiltWidth: formData.quiltWidth,
      quiltLength: formData.quiltLength,
      quiltingType: formData.quiltingType,
      requestedDateType: formData.requestedDateType,
      requestedCompletionDate: formData.requestedCompletionDate,
      qualityDisclaimerAccepted: formData.qualityDisclaimerAccepted,
      competitionCreditAccepted: formData.competitionCreditAccepted,
    });

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setShowErrorToast(true);
      scrollToFirstError(validationResult.errors);
      return;
    }

    // Clear any previous errors
    setErrors([]);

    const intakeDate = getTodayDate();

    // Use UUID for Supabase compatibility
    const id = crypto.randomUUID();

    const newProject: Project = {
      id,
      stage: "Estimates",
      clientFirstName: formData.clientFirstName,
      clientLastName: formData.clientLastName,
      clientEmail: formData.clientEmail || undefined,
      clientPhone: formData.clientPhone || undefined,
      clientStreet: formData.clientStreet || undefined,
      clientCity: formData.clientCity || undefined,
      clientState: formData.clientState || undefined,
      clientPostalCode: formData.clientPostalCode || undefined,
      clientCountry: formData.clientCountry || undefined,
      intakeDate,
      requestedDateType: formData.requestedDateType,
      requestedCompletionDate: formData.requestedCompletionDate || undefined,
      description: formData.description || undefined,
      cardLabel: formData.description?.substring(0, 50) || undefined,
      quiltWidth: formData.quiltWidth ? Number(formData.quiltWidth) : undefined,
      quiltLength: formData.quiltLength
        ? Number(formData.quiltLength)
        : undefined,
      quiltingType: formData.quiltingType || undefined,
      threadChoice: formData.threadChoice || undefined,
      battingChoice: formData.battingChoice || undefined,
      bindingType: formData.bindingType || undefined,
      clientSuppliesBatting: formData.clientSuppliesBatting,
      notes: formData.notes
        ? [
            {
              id: generateId(),
              text: formData.notes,
              createdAt: new Date().toISOString(),
            },
          ]
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await storage.addProject(newProject);

      // Show success message and navigate
      setShowSuccessToast(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
      setSaving(false);
    }
  };

  // Check backing size warning
  const checkBackingSize = () => {
    const quiltW = parseFloat(formData.quiltWidth) || 0;
    const quiltL = parseFloat(formData.quiltLength) || 0;
    const backingW = parseFloat(formData.backingWidth) || 0;
    const backingL = parseFloat(formData.backingLength) || 0;

    if (quiltW && quiltL && backingW && backingL) {
      const needsWarning = backingW < quiltW + 8 || backingL < quiltL + 8;
      setShowBackingWarning(needsWarning);
    } else {
      setShowBackingWarning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-plum">New Project Intake</h2>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {/* Error Summary */}
        <FormErrorSummary errors={errors} />

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-line rounded-card p-6 space-y-6"
        >
          {/* Client Information */}
          <div>
            <h3 className="font-bold text-plum mb-4">Client Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  required
                  error={getFieldError(errors, "First name")}
                >
                  <ValidatedInput
                    type="text"
                    value={formData.clientFirstName}
                    onChange={(e) =>
                      updateFormData("clientFirstName", e.target.value)
                    }
                    hasError={hasFieldError(errors, "First name")}
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  required
                  error={getFieldError(errors, "Last name")}
                >
                  <ValidatedInput
                    type="text"
                    value={formData.clientLastName}
                    onChange={(e) =>
                      updateFormData("clientLastName", e.target.value)
                    }
                    hasError={hasFieldError(errors, "Last name")}
                  />
                </FormField>
              </div>

              {/* Address Fields */}
              <FormField
                label="Street Address"
                required
                error={getFieldError(errors, "Street address")}
              >
                <ValidatedInput
                  type="text"
                  value={formData.clientStreet}
                  onChange={(e) =>
                    updateFormData("clientStreet", e.target.value)
                  }
                  placeholder="123 Main Street"
                  hasError={hasFieldError(errors, "Street address")}
                />
              </FormField>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <FormField
                    label="City"
                    required
                    error={getFieldError(errors, "City")}
                  >
                    <ValidatedInput
                      type="text"
                      value={formData.clientCity}
                      onChange={(e) =>
                        updateFormData("clientCity", e.target.value)
                      }
                      placeholder="Your City"
                      hasError={hasFieldError(errors, "City")}
                    />
                  </FormField>
                </div>

                <FormField
                  label={regionLabel}
                  required
                  error={getFieldError(errors, "State/Province")}
                >
                  {showRegionDropdown ? (
                    <ValidatedSelect
                      value={formData.clientState}
                      onChange={(e) =>
                        updateFormData("clientState", e.target.value)
                      }
                      hasError={hasFieldError(errors, "State/Province")}
                    >
                      <option value="">Select...</option>
                      {regions.map((region) => (
                        <option key={region.code} value={region.code}>
                          {region.name}
                        </option>
                      ))}
                    </ValidatedSelect>
                  ) : (
                    <ValidatedInput
                      type="text"
                      value={formData.clientState}
                      onChange={(e) =>
                        updateFormData("clientState", e.target.value)
                      }
                      placeholder="State/Province"
                      hasError={hasFieldError(errors, "State/Province")}
                    />
                  )}
                </FormField>

                <FormField
                  label={postalCodeLabel}
                  required
                  error={getFieldError(errors, "Postal code")}
                >
                  <ValidatedInput
                    type="text"
                    value={formData.clientPostalCode}
                    onChange={(e) =>
                      updateFormData("clientPostalCode", e.target.value)
                    }
                    placeholder={postalCodePlaceholder}
                    hasError={hasFieldError(errors, "Postal code")}
                  />
                </FormField>

                <FormField
                  label="Country"
                  required
                  error={getFieldError(errors, "Country")}
                >
                  <ValidatedSelect
                    value={formData.clientCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    hasError={hasFieldError(errors, "Country")}
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </ValidatedSelect>
                </FormField>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Phone"
                  required
                  error={getFieldError(errors, "Phone")}
                >
                  <ValidatedInput
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="555-123-4567"
                    hasError={hasFieldError(errors, "Phone")}
                  />
                </FormField>

                <FormField
                  label="Email"
                  required
                  error={getFieldError(errors, "Email")}
                >
                  <ValidatedInput
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      updateFormData("clientEmail", e.target.value)
                    }
                    hasError={hasFieldError(errors, "Email")}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Date Options */}
          <div>
            <FormField
              label="Requested Completion Date"
              required
              error={getFieldError(errors, "Completion date")}
            >
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="dateType"
                    value="asap"
                    checked={formData.requestedDateType === "asap"}
                    onChange={() => {
                      updateFormData("requestedDateType", "asap");
                      clearFieldError("requestedCompletionDate");
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-bold">
                      ASAP <span className="text-red-500">PRIORITY</span>
                    </div>
                    <div className="text-sm text-muted">
                      Rush priority — I need this ASAP
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="dateType"
                    value="no_date"
                    checked={formData.requestedDateType === "no_date"}
                    onChange={() => {
                      updateFormData("requestedDateType", "no_date");
                      clearFieldError("requestedCompletionDate");
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-bold">No Set Date</div>
                    <div className="text-sm text-muted">
                      Quilter will assign based on their schedule
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="dateType"
                    value="specific_date"
                    checked={formData.requestedDateType === "specific_date"}
                    onChange={() =>
                      updateFormData("requestedDateType", "specific_date")
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-bold">Select a Date</div>
                    <div className="text-sm text-muted mb-2">
                      I have a specific deadline in mind
                    </div>
                    {formData.requestedDateType === "specific_date" && (
                      <ValidatedInput
                        type="date"
                        value={formData.requestedCompletionDate}
                        onChange={(e) =>
                          updateFormData(
                            "requestedCompletionDate",
                            e.target.value
                          )
                        }
                        hasError={hasFieldError(errors, "Completion date")}
                      />
                    )}
                  </div>
                </label>
              </div>
            </FormField>
          </div>

          {/* Quilt Details */}
          <div>
            <h3 className="font-bold text-plum mb-4">Quilt Details</h3>
            <div className="space-y-4">
              <FormField label="Quilt Description">
                <ValidatedTextarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  rows={3}
                  placeholder="e.g., Queen wedding quilt, hand-pieced, double ring pattern"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Quilt Top Size (Width × Length in inches)"
                  required
                  error={
                    getFieldError(errors, "Quilt width") ||
                    getFieldError(errors, "Quilt length")
                  }
                >
                  <div className="flex gap-2 items-center">
                    <ValidatedInput
                      type="number"
                      step="0.01"
                      value={formData.quiltWidth}
                      onChange={(e) => {
                        updateFormData("quiltWidth", e.target.value);
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Width"
                      hasError={hasFieldError(errors, "Quilt width")}
                    />
                    <span className="text-muted">×</span>
                    <ValidatedInput
                      type="number"
                      step="0.01"
                      value={formData.quiltLength}
                      onChange={(e) => {
                        updateFormData("quiltLength", e.target.value);
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Length"
                      hasError={hasFieldError(errors, "Quilt length")}
                    />
                  </div>
                </FormField>

                <FormField label="Backing Size (Width × Length in inches)">
                  <div className="flex gap-2 items-center">
                    <ValidatedInput
                      type="number"
                      step="0.01"
                      value={formData.backingWidth}
                      onChange={(e) => {
                        updateFormData("backingWidth", e.target.value);
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Width"
                    />
                    <span className="text-muted">×</span>
                    <ValidatedInput
                      type="number"
                      step="0.01"
                      value={formData.backingLength}
                      onChange={(e) => {
                        updateFormData("backingLength", e.target.value);
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Length"
                    />
                  </div>
                  {showBackingWarning && (
                    <div className="mt-2 text-xs text-red-600 font-bold">
                      ⚠️ Backing should be at least 4" larger on all sides (8"
                      total per dimension)
                    </div>
                  )}
                </FormField>
              </div>

              <FormField label="Seam Direction">
                <ValidatedSelect
                  value={formData.seamDirection}
                  onChange={(e) =>
                    updateFormData("seamDirection", e.target.value)
                  }
                >
                  <option value="">Select...</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                  <option value="quilter_choice">Quilter's Choice</option>
                </ValidatedSelect>
              </FormField>

              <FormField
                label="Quilting Type"
                required
                error={getFieldError(errors, "Quilting type")}
              >
                <ValidatedSelect
                  value={formData.quiltingType}
                  onChange={(e) =>
                    updateFormData("quiltingType", e.target.value)
                  }
                  hasError={hasFieldError(errors, "Quilting type")}
                >
                  <option value="">Select...</option>
                  <option value="light_e2e">Light Edge to Edge</option>
                  <option value="standard_e2e">Standard Edge to Edge</option>
                  <option value="light_custom">Light Custom</option>
                  <option value="custom">Custom</option>
                  <option value="dense_custom">Dense Custom</option>
                </ValidatedSelect>
              </FormField>
            </div>
          </div>

          {/* Thread */}
          <div>
            <h3 className="font-bold text-plum mb-4">Thread</h3>
            <div className="space-y-4">
              <FormField label="Thread Choice">
                {hasThreadOptions ? (
                  <ValidatedSelect
                    value={formData.threadChoice}
                    onChange={(e) =>
                      updateFormData("threadChoice", e.target.value)
                    }
                  >
                    <option value="">Select thread...</option>
                    {settings.bobbinOptions.map((thread) => (
                      <option key={thread.name} value={thread.name}>
                        {thread.name}
                      </option>
                    ))}
                    <option value="other">Other (see notes)</option>
                  </ValidatedSelect>
                ) : (
                  <ValidatedInput
                    type="text"
                    value={formData.threadChoice}
                    onChange={(e) =>
                      updateFormData("threadChoice", e.target.value)
                    }
                    placeholder="e.g., White, Cream, Match fabric"
                  />
                )}
              </FormField>

              <FormField label="Thread Notes">
                <ValidatedTextarea
                  value={formData.threadNotes}
                  onChange={(e) =>
                    updateFormData("threadNotes", e.target.value)
                  }
                  rows={2}
                  placeholder="Any special thread requirements or preferences"
                />
              </FormField>
            </div>
          </div>

          {/* Batting */}
          <div>
            <h3 className="font-bold text-plum mb-4">Batting</h3>
            <div className="space-y-4">
              <FormField label="Batting Choice">
                {hasBattingOptions ? (
                  <ValidatedSelect
                    value={formData.battingChoice}
                    onChange={(e) =>
                      updateFormData("battingChoice", e.target.value)
                    }
                  >
                    <option value="">Select batting...</option>
                    {settings.battingOptions.map((batting) => (
                      <option
                        key={`${batting.name}-${batting.widthInches}`}
                        value={batting.name}
                      >
                        {batting.name} ({batting.widthInches}" wide)
                      </option>
                    ))}
                    <option value="other">Other (see notes)</option>
                  </ValidatedSelect>
                ) : (
                  <ValidatedInput
                    type="text"
                    value={formData.battingChoice}
                    onChange={(e) =>
                      updateFormData("battingChoice", e.target.value)
                    }
                    placeholder="e.g., Cotton, Polyester, Wool, Blend"
                  />
                )}
              </FormField>

              <div>
                <label className="flex items-center gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.clientSuppliesBatting}
                    onChange={(e) =>
                      updateFormData("clientSuppliesBatting", e.target.checked)
                    }
                  />
                  <div>
                    <div className="font-bold text-sm">
                      Client Supplies Own Batting
                    </div>
                    <div className="text-xs text-muted">
                      Batting cost will be $0
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Binding */}
          <div>
            <h3 className="font-bold text-plum mb-4">Binding</h3>
            <FormField label="Binding Type">
              <ValidatedSelect
                value={formData.bindingType}
                onChange={(e) => updateFormData("bindingType", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="no_binding">No Binding</option>
                <option value="top_attached">Top Attached Only</option>
                <option value="fully_attached">Fully Attached</option>
              </ValidatedSelect>
            </FormField>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-bold text-plum mb-4">Notes</h3>
            <ValidatedTextarea
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              rows={3}
              placeholder="Any special instructions, concerns, or additional information"
            />
          </div>

          {/* Agreements */}
          <div>
            <h3 className="font-bold text-plum mb-4">Agreements</h3>
            <div className="space-y-4">
              <div className="p-4 border border-line rounded-xl">
                <label className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.photoReleaseGranted}
                    onChange={(e) =>
                      updateFormData("photoReleaseGranted", e.target.checked)
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-bold text-sm">
                      Photo/Identity Release
                    </div>
                    <div className="text-xs text-muted mt-1">
                      I grant permission for photos of my quilt to be used for
                      marketing purposes
                    </div>
                  </div>
                </label>

                {formData.photoReleaseGranted && (
                  <label className="flex items-start gap-3 ml-7">
                    <input
                      type="checkbox"
                      checked={formData.photoReleaseKeepPrivate}
                      onChange={(e) =>
                        updateFormData(
                          "photoReleaseKeepPrivate",
                          e.target.checked
                        )
                      }
                      className="mt-1"
                    />
                    <div className="text-xs text-muted">
                      Please keep my identity private (don't tag me or mention
                      my name)
                    </div>
                  </label>
                )}
              </div>

              <label
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 ${
                  hasFieldError(errors, "qualityDisclaimerAccepted")
                    ? "border-red-300 bg-red-50"
                    : "border-line"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.qualityDisclaimerAccepted}
                  onChange={(e) =>
                    updateFormData(
                      "qualityDisclaimerAccepted",
                      e.target.checked
                    )
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm">
                    Quality Disclaimer <span className="text-red-500">*</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    I understand that quilting may reveal imperfections in
                    piecing, fabric choices, or construction that were not
                    visible before quilting
                  </div>
                  {hasFieldError(errors, "qualityDisclaimerAccepted") && (
                    <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getFieldError(errors, "qualityDisclaimerAccepted")}
                    </div>
                  )}
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 ${
                  hasFieldError(errors, "competitionCreditAccepted")
                    ? "border-red-300 bg-red-50"
                    : "border-line"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.competitionCreditAccepted}
                  onChange={(e) =>
                    updateFormData(
                      "competitionCreditAccepted",
                      e.target.checked
                    )
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm">
                    Show & Competition Credit{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    I agree to give credit to the quilter if entering this quilt
                    in shows or competitions
                  </div>
                  {hasFieldError(errors, "competitionCreditAccepted") && (
                    <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getFieldError(errors, "competitionCreditAccepted")}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4 border-t border-line">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-line rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 bg-plum text-white rounded-xl ${
                saving ? "opacity-50 cursor-not-allowed" : "hover:bg-plum/90"
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : (
                "Save Project"
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Toast Notifications */}
      <ValidationToast
        show={showErrorToast}
        message="Please fix the errors above"
        onClose={() => setShowErrorToast(false)}
      />
      <SuccessToast
        show={showSuccessToast}
        message="Project saved successfully!"
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
}
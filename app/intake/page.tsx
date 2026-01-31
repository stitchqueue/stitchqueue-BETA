"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import { generateId, getTodayDate, generateProjectId } from "../lib/utils";
import type { Project } from "../types";
import { COUNTRY_OPTIONS } from "../types";

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

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, clientPhone: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate agreements
    if (
      !formData.qualityDisclaimerAccepted ||
      !formData.competitionCreditAccepted
    ) {
      alert("Please accept all required agreements to continue.");
      return;
    }

    const intakeDate = getTodayDate();
    const id = generateProjectId(
      formData.clientFirstName,
      formData.clientLastName,
      intakeDate
    );

    const newProject: Project = {
      id,
      stage: "Intake",
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

    storage.addProject(newProject);
    router.push("/");
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

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-line rounded-card p-6 space-y-6"
        >
          {/* Client Information */}
          <div>
            <h3 className="font-bold text-plum mb-4">Client Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientFirstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientFirstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientLastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientLastName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientStreet}
                  onChange={(e) =>
                    setFormData({ ...formData, clientStreet: e.target.value })
                  }
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-muted mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientCity}
                    onChange={(e) =>
                      setFormData({ ...formData, clientCity: e.target.value })
                    }
                    placeholder="Spokane"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientState}
                    onChange={(e) =>
                      setFormData({ ...formData, clientState: e.target.value })
                    }
                    placeholder="WA"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientPostalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientPostalCode: e.target.value,
                      })
                    }
                    placeholder="99201"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Country *
                  </label>
                  <select
                    required
                    value={formData.clientCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientCountry: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="509-828-2945"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Options */}
          <div>
            <label className="block text-sm font-bold text-muted mb-2">
              Requested Completion Date *
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="dateType"
                  value="asap"
                  checked={formData.requestedDateType === "asap"}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedDateType: "asap" })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-bold">
                    ASAP <span className="text-due">PRIORITY</span>
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
                  onChange={(e) =>
                    setFormData({ ...formData, requestedDateType: "no_date" })
                  }
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedDateType: "specific_date",
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold">Select a Date</div>
                  <div className="text-sm text-muted mb-2">
                    I have a specific deadline in mind
                  </div>
                  {formData.requestedDateType === "specific_date" && (
                    <input
                      type="date"
                      value={formData.requestedCompletionDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestedCompletionDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Quilt Details */}
          <div>
            <h3 className="font-bold text-plum mb-4">Quilt Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Quilt Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                  placeholder="e.g., Queen wedding quilt, hand-pieced, double ring pattern"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Quilt Top Size * (Width × Length in inches)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.quiltWidth}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          quiltWidth: e.target.value,
                        });
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Width"
                      className="flex-1 px-4 py-2 border border-line rounded-xl"
                    />
                    <span className="text-muted">×</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.quiltLength}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          quiltLength: e.target.value,
                        });
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Length"
                      className="flex-1 px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Backing Size (Width × Length in inches)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.backingWidth}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          backingWidth: e.target.value,
                        });
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Width"
                      className="flex-1 px-4 py-2 border border-line rounded-xl"
                    />
                    <span className="text-muted">×</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.backingLength}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          backingLength: e.target.value,
                        });
                        setTimeout(checkBackingSize, 100);
                      }}
                      placeholder="Length"
                      className="flex-1 px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  {showBackingWarning && (
                    <div className="mt-2 text-xs text-red-600 font-bold">
                      ⚠️ Backing should be at least 4" larger on all sides (8"
                      total per dimension)
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Seam Direction
                </label>
                <select
                  value={formData.seamDirection}
                  onChange={(e) =>
                    setFormData({ ...formData, seamDirection: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-line rounded-xl"
                >
                  <option value="">Select...</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                  <option value="quilter_choice">Quilter's Choice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Quilting Type *
                </label>
                <select
                  required
                  value={formData.quiltingType}
                  onChange={(e) =>
                    setFormData({ ...formData, quiltingType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-line rounded-xl"
                >
                  <option value="">Select...</option>
                  <option value="light_e2e">Light Edge to Edge</option>
                  <option value="standard_e2e">Standard Edge to Edge</option>
                  <option value="light_custom">Light Custom</option>
                  <option value="custom">Custom</option>
                  <option value="dense_custom">Dense Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thread */}
          <div>
            <h3 className="font-bold text-plum mb-4">Thread</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Thread Choice
                </label>
                <input
                  type="text"
                  value={formData.threadChoice}
                  onChange={(e) =>
                    setFormData({ ...formData, threadChoice: e.target.value })
                  }
                  placeholder="e.g., White, Cream, Match fabric"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Thread Notes
                </label>
                <textarea
                  value={formData.threadNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, threadNotes: e.target.value })
                  }
                  rows={2}
                  placeholder="Any special thread requirements or preferences"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Batting */}
          <div>
            <h3 className="font-bold text-plum mb-4">Batting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Batting Choice
                </label>
                <input
                  type="text"
                  value={formData.battingChoice}
                  onChange={(e) =>
                    setFormData({ ...formData, battingChoice: e.target.value })
                  }
                  placeholder="e.g., Cotton, Polyester, Wool, Blend"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.clientSuppliesBatting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientSuppliesBatting: e.target.checked,
                      })
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
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Binding Type
              </label>
              <select
                value={formData.bindingType}
                onChange={(e) =>
                  setFormData({ ...formData, bindingType: e.target.value })
                }
                className="w-full px-4 py-2 border border-line rounded-xl"
              >
                <option value="">Select...</option>
                <option value="no_binding">No Binding</option>
                <option value="top_attached">Top Attached Only</option>
                <option value="fully_attached">Fully Attached</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-bold text-plum mb-4">Notes</h3>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="Any special instructions, concerns, or additional information"
              className="w-full px-4 py-2 border border-line rounded-xl"
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
                      setFormData({
                        ...formData,
                        photoReleaseGranted: e.target.checked,
                      })
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
                        setFormData({
                          ...formData,
                          photoReleaseKeepPrivate: e.target.checked,
                        })
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

              <label className="flex items-start gap-3 p-4 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  required
                  checked={formData.qualityDisclaimerAccepted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualityDisclaimerAccepted: e.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm">Quality Disclaimer *</div>
                  <div className="text-xs text-muted mt-1">
                    I understand that quilting may reveal imperfections in
                    piecing, fabric choices, or construction that were not
                    visible before quilting
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-line rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  required
                  checked={formData.competitionCreditAccepted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      competitionCreditAccepted: e.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm">
                    Show & Competition Credit *
                  </div>
                  <div className="text-xs text-muted mt-1">
                    I agree to give credit to the quilter if entering this quilt
                    in shows or competitions
                  </div>
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
              className="px-6 py-2 bg-plum text-white rounded-xl hover:bg-plum/90"
            >
              Save Project
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

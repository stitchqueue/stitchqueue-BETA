"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { storage } from "../lib/storage";
import type { Project, EstimateData } from "../types";

export default function CalculatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    quiltWidth: "",
    quiltLength: "",
    quiltingType: "standard_e2e",
    quiltingRate: "0.015",
    threadCost: "0",
    battingChoice: "none",
    battingWidth: "96",
    battingPricePerInch: "0.50",
    battingLengthAddition: "4",
    clientSuppliesBatting: false,
    bindingType: "no_binding",
    bindingRatePerInch: "0.10",
  });

  const [totals, setTotals] = useState({
    quiltArea: 0,
    quiltingTotal: 0,
    threadTotal: 0,
    battingLengthNeeded: 0,
    battingTotal: 0,
    bindingPerimeter: 0,
    bindingTotal: 0,
    subtotal: 0,
    total: 0,
  });

  useEffect(() => {
    if (projectId) {
      const proj = storage.getProjectById(decodeURIComponent(projectId));
      if (proj) {
        setProject(proj);
        // Pre-fill dimensions from project if available
        if (proj.quiltWidth && proj.quiltLength) {
          setFormData((prev) => ({
            ...prev,
            quiltWidth: String(proj.quiltWidth),
            quiltLength: String(proj.quiltLength),
          }));
        }
      }
    }
  }, [projectId]);

  useEffect(() => {
    calculateTotals();
  }, [formData]);

  const calculateTotals = () => {
    const width = parseFloat(formData.quiltWidth) || 0;
    const length = parseFloat(formData.quiltLength) || 0;

    if (width === 0 || length === 0) {
      setTotals({
        quiltArea: 0,
        quiltingTotal: 0,
        threadTotal: 0,
        battingLengthNeeded: 0,
        battingTotal: 0,
        bindingPerimeter: 0,
        bindingTotal: 0,
        subtotal: 0,
        total: 0,
      });
      return;
    }

    // Quilt area and quilting cost
    const area = width * length;
    const rate = parseFloat(formData.quiltingRate) || 0;
    const quiltingTotal = area * rate;

    // Thread cost
    const threadTotal = parseFloat(formData.threadCost) || 0;

    // Batting calculation
    let battingTotal = 0;
    let battingLengthNeeded = 0;

    if (!formData.clientSuppliesBatting && formData.battingChoice !== "none") {
      const battingWidth = parseFloat(formData.battingWidth) || 0;
      const battingAddition = parseFloat(formData.battingLengthAddition) || 0;
      battingLengthNeeded = length + battingAddition;
      const battingPricePerInch = parseFloat(formData.battingPricePerInch) || 0;
      battingTotal = battingLengthNeeded * battingPricePerInch;
    }

    // Binding calculation (per-inch - v2.7)
    let bindingTotal = 0;
    let bindingPerimeter = 0;

    if (formData.bindingType !== "no_binding") {
      bindingPerimeter = (width + length) * 2;
      const bindingRate = parseFloat(formData.bindingRatePerInch) || 0;
      bindingTotal = bindingPerimeter * bindingRate;
    }

    // Totals
    const subtotal = quiltingTotal + threadTotal + battingTotal + bindingTotal;
    const total = subtotal;

    setTotals({
      quiltArea: area,
      quiltingTotal,
      threadTotal,
      battingLengthNeeded,
      battingTotal,
      bindingPerimeter,
      bindingTotal,
      subtotal,
      total,
    });
  };

  const saveEstimate = () => {
    if (!project) {
      alert(
        "No project selected. Please create a project first from the intake form."
      );
      return;
    }

    if (totals.total === 0) {
      alert("Please enter quilt dimensions to create an estimate.");
      return;
    }

    const estimateData: EstimateData = {
      quiltWidth: parseFloat(formData.quiltWidth),
      quiltLength: parseFloat(formData.quiltLength),
      quiltArea: totals.quiltArea,
      quiltingType: formData.quiltingType,
      quiltingRate: parseFloat(formData.quiltingRate),
      quiltingTotal: totals.quiltingTotal,
      threadCost: parseFloat(formData.threadCost),
      battingChoice: formData.battingChoice,
      battingWidth: parseFloat(formData.battingWidth),
      battingPricePerInch: parseFloat(formData.battingPricePerInch),
      battingLengthAddition: parseFloat(formData.battingLengthAddition),
      battingLengthNeeded: totals.battingLengthNeeded,
      battingTotal: totals.battingTotal,
      clientSuppliesBatting: formData.clientSuppliesBatting,
      bindingType: formData.bindingType,
      bindingRatePerInch: parseFloat(formData.bindingRatePerInch),
      bindingPerimeter: totals.bindingPerimeter,
      bindingTotal: totals.bindingTotal,
      subtotal: totals.subtotal,
      total: totals.total,
      createdAt: new Date().toISOString(),
    };

    // Update project with estimate and move to Estimate stage
    storage.updateProject(project.id, {
      estimateData,
      stage: "Estimate",
      quiltWidth: parseFloat(formData.quiltWidth),
      quiltLength: parseFloat(formData.quiltLength),
    });

    alert("Estimate saved!");
    router.push(`/project/${encodeURIComponent(project.id)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-plum">Pricing Calculator</h2>
            {project && (
              <p className="text-sm text-muted mt-1">
                For: {project.clientFirstName} {project.clientLastName}
              </p>
            )}
          </div>
          <button
            onClick={() =>
              project
                ? router.push(`/project/${encodeURIComponent(project.id)}`)
                : router.push("/")
            }
            className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {!project && (
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-6">
            <p className="text-sm font-bold text-gold">
              ⚠️ No project selected. Create a project from the intake form
              first, then create an estimate from the project page.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Quilt Dimensions */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Quilt Dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Width (inches)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quiltWidth}
                    onChange={(e) =>
                      setFormData({ ...formData, quiltWidth: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Length (inches)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quiltLength}
                    onChange={(e) =>
                      setFormData({ ...formData, quiltLength: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>
              {totals.quiltArea > 0 && (
                <div className="mt-3 text-sm text-muted">
                  Area: {totals.quiltArea.toFixed(2)} sq in
                </div>
              )}
            </div>

            {/* Quilting */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Quilting</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Quilting Type
                  </label>
                  <select
                    value={formData.quiltingType}
                    onChange={(e) =>
                      setFormData({ ...formData, quiltingType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    <option value="light_e2e">Light Edge to Edge</option>
                    <option value="standard_e2e">Standard Edge to Edge</option>
                    <option value="light_custom">Light Custom</option>
                    <option value="custom">Custom</option>
                    <option value="dense_custom">Dense Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Rate per sq in ($)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.quiltingRate}
                    onChange={(e) =>
                      setFormData({ ...formData, quiltingRate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Thread */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Thread</h3>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Thread Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.threadCost}
                  onChange={(e) =>
                    setFormData({ ...formData, threadCost: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            </div>

            {/* Batting */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Batting</h3>

              <div className="mb-4">
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
                      Client Supplies Batting
                    </div>
                    <div className="text-xs text-muted">
                      Batting cost will be $0
                    </div>
                  </div>
                </label>
              </div>

              {!formData.clientSuppliesBatting && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Batting Type
                    </label>
                    <select
                      value={formData.battingChoice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          battingChoice: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    >
                      <option value="none">None</option>
                      <option value="cotton">Cotton</option>
                      <option value="poly">Polyester</option>
                      <option value="wool">Wool</option>
                      <option value="blend">Blend</option>
                    </select>
                  </div>

                  {formData.battingChoice !== "none" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-muted mb-2">
                            Width (in)
                          </label>
                          <input
                            type="number"
                            value={formData.battingWidth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                battingWidth: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-line rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-muted mb-2">
                            Price/inch ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.battingPricePerInch}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                battingPricePerInch: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-line rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-muted mb-2">
                          Length Addition (inches)
                        </label>
                        <select
                          value={formData.battingLengthAddition}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              battingLengthAddition: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-line rounded-xl"
                        >
                          <option value="2">2"</option>
                          <option value="4">4"</option>
                          <option value="6">6"</option>
                          <option value="8">8"</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Binding */}
            <div className="bg-white border border-line rounded-card p-6">
              <h3 className="font-bold text-plum mb-4">Binding (Per-Inch)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Binding Type
                  </label>
                  <select
                    value={formData.bindingType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newRate = "0";
                      if (newType === "top_attached") newRate = "0.10";
                      if (newType === "fully_attached") newRate = "0.20";
                      setFormData({
                        ...formData,
                        bindingType: newType,
                        bindingRatePerInch: newRate,
                      });
                    }}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    <option value="no_binding">No Binding</option>
                    <option value="top_attached">Top Attached Only</option>
                    <option value="fully_attached">Fully Attached</option>
                  </select>
                </div>

                {formData.bindingType !== "no_binding" && (
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Rate per inch ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.bindingRatePerInch}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bindingRatePerInch: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                    {totals.bindingPerimeter > 0 && (
                      <div className="mt-2 text-sm text-muted">
                        Perimeter: {totals.bindingPerimeter.toFixed(2)} inches
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Estimate Preview */}
          <div>
            <div className="bg-white border border-line rounded-card p-6 sticky top-24">
              <h3 className="font-bold text-plum mb-4">Estimate</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-3 border-b border-line">
                  <span className="text-muted">Quilting</span>
                  <span className="font-medium">
                    ${totals.quiltingTotal.toFixed(2)}
                  </span>
                </div>

                {totals.threadTotal > 0 && (
                  <div className="flex justify-between pb-3 border-b border-line">
                    <span className="text-muted">Thread</span>
                    <span className="font-medium">
                      ${totals.threadTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {totals.battingTotal > 0 && (
                  <div className="flex justify-between pb-3 border-b border-line">
                    <span className="text-muted">
                      Batting ({totals.battingLengthNeeded.toFixed(0)}")
                    </span>
                    <span className="font-medium">
                      ${totals.battingTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {formData.clientSuppliesBatting && (
                  <div className="flex justify-between pb-3 border-b border-line">
                    <span className="text-muted">
                      Batting (Client Supplied)
                    </span>
                    <span className="font-medium">$0.00</span>
                  </div>
                )}

                {totals.bindingTotal > 0 && (
                  <div className="flex justify-between pb-3 border-b border-line">
                    <span className="text-muted">
                      Binding ({totals.bindingPerimeter.toFixed(0)}" × $
                      {formData.bindingRatePerInch})
                    </span>
                    <span className="font-medium">
                      ${totals.bindingTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-3 text-lg font-bold">
                  <span className="text-plum">Total</span>
                  <span className="text-plum">${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-line">
                <button
                  onClick={saveEstimate}
                  disabled={!project || totals.total === 0}
                  className="w-full px-6 py-3 bg-plum text-white rounded-xl hover:bg-plum/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

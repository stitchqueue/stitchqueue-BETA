"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { storage } from "../../lib/storage";
import type { Project, Settings } from "../../types";

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Payment recording state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication first
        const hasOrg = await storage.hasOrganization();
        if (!hasOrg) {
          router.push("/");
          return;
        }
        setIsAuthenticated(true);

        // Load project and settings
        const [proj, savedSettings] = await Promise.all([
          storage.getProjectById(decodeURIComponent(projectId)),
          storage.getSettings(),
        ]);
        setProject(proj || null);
        setSettings(savedSettings);

        // Pre-fill payment amount with balance due
        if (proj?.estimateData?.total) {
          const depositPaid = proj.depositPaid
            ? proj.depositPaidAmount || proj.depositAmount || 0
            : 0;
          const finalPaid = proj.paidInFull ? proj.finalPaymentAmount || 0 : 0;
          const balanceDue = proj.estimateData.total - depositPaid - finalPaid;
          setPaymentAmount(balanceDue.toFixed(2));
        }
      } catch (error) {
        console.error("Error loading invoice data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currencyCode || "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format business address from separate fields
  const formatBusinessAddress = () => {
    const parts = [];
    if (settings?.street) parts.push(settings.street);
    if (settings?.city || settings?.state || settings?.postalCode) {
      const cityStateZip = [
        settings?.city,
        settings?.state,
        settings?.postalCode,
      ]
        .filter(Boolean)
        .join(", ");
      if (cityStateZip) parts.push(cityStateZip);
    }
    // Fallback to legacy address field
    if (parts.length === 0 && settings?.address) {
      parts.push(settings.address);
    }
    return parts.join(", ");
  };

  // Format client address from separate fields
  const formatClientAddress = () => {
    const parts = [];
    if (project?.clientStreet) parts.push(project.clientStreet);
    if (
      project?.clientCity ||
      project?.clientState ||
      project?.clientPostalCode
    ) {
      const cityStateZip = [
        project?.clientCity,
        project?.clientState,
        project?.clientPostalCode,
      ]
        .filter(Boolean)
        .join(", ");
      if (cityStateZip) parts.push(cityStateZip);
    }
    if (project?.clientCountry && project.clientCountry !== "United States") {
      parts.push(project.clientCountry);
    }
    // Fallback to legacy address field
    if (parts.length === 0 && project?.clientAddress) {
      parts.push(project.clientAddress);
    }
    return parts;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRecordFinalPayment = async () => {
    if (!project) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setUpdating(true);
    try {
      const estimate = project.estimateData;
      const depositPaid = project.depositPaid
        ? project.depositPaidAmount || project.depositAmount || 0
        : 0;
      const balanceDue = (estimate?.total || 0) - depositPaid;
      const isPaidInFull = amount >= balanceDue - 0.01; // Allow for rounding

      await storage.updateProject(project.id, {
        finalPaymentAmount: amount,
        finalPaymentDate: paymentDate,
        finalPaymentMethod: paymentMethod,
        paidInFull: isPaidInFull,
        // Automatically advance to Paid/Shipped if paid in full and currently Invoiced
        ...(isPaidInFull && project.stage === "Invoiced"
          ? { stage: "Paid/Shipped" }
          : {}),
      });

      setProject({
        ...project,
        finalPaymentAmount: amount,
        finalPaymentDate: paymentDate,
        finalPaymentMethod: paymentMethod,
        paidInFull: isPaidInFull,
        ...(isPaidInFull && project.stage === "Invoiced"
          ? { stage: "Paid/Shipped" }
          : {}),
      });

      setShowPaymentForm(false);
      alert(
        isPaidInFull
          ? "Payment recorded! Project marked as Paid/Shipped."
          : "Partial payment recorded."
      );
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleClearFinalPayment = async () => {
    if (!project) return;
    if (!confirm("Clear the final payment record?")) return;

    setUpdating(true);
    try {
      await storage.updateProject(project.id, {
        finalPaymentAmount: undefined,
        finalPaymentDate: undefined,
        finalPaymentMethod: undefined,
        paidInFull: false,
      });

      const estimate = project.estimateData;
      const depositPaid = project.depositPaid
        ? project.depositPaidAmount || project.depositAmount || 0
        : 0;

      setProject({
        ...project,
        finalPaymentAmount: undefined,
        finalPaymentDate: undefined,
        finalPaymentMethod: undefined,
        paidInFull: false,
      });

      // Reset the payment amount field
      if (estimate?.total) {
        setPaymentAmount((estimate.total - depositPaid).toFixed(2));
      }
    } catch (error) {
      console.error("Error clearing payment:", error);
      alert("Failed to clear payment. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum mx-auto mb-4"></div>
          <p className="text-muted">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Redirecting...</div>
      </div>
    );
  }

  if (!project || !settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Invoice not found.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-line rounded-xl hover:bg-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project.estimateData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">
            No estimate data found for this project.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-line rounded-xl hover:bg-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const estimate = project.estimateData;
  const invoiceNumber = project.estimateNumber || "—";
  const invoiceDate = new Date().toISOString().split("T")[0];

  const subtotal = estimate.subtotal || 0;
  const taxAmount = estimate.taxAmount || 0;
  const total = estimate.total || 0;
  const depositPaid = project.depositPaid
    ? project.depositPaidAmount || project.depositAmount || 0
    : 0;
  const finalPaid = project.paidInFull ? project.finalPaymentAmount || 0 : 0;
  const amountDue = total - depositPaid - finalPaid;

  const lineItems: { description: string; amount: number }[] = [];

  if (estimate.quiltingTotal && estimate.quiltingTotal > 0) {
    lineItems.push({
      description: `Quilting - ${(estimate.quiltArea || 0).toLocaleString()} sq in × $${
        estimate.quiltingRate || 0
      }/sq in`,
      amount: estimate.quiltingTotal,
    });
  }

  if (estimate.threadCost && estimate.threadCost > 0) {
    lineItems.push({
      description: `Thread - ${project.threadChoice || "Standard"}`,
      amount: estimate.threadCost,
    });
  }

  if (estimate.battingTotal && estimate.battingTotal > 0) {
    lineItems.push({
      description: `Batting - ${
        estimate.battingLengthNeeded?.toFixed(0) || "0"
      }" length`,
      amount: estimate.battingTotal,
    });
  }

  if (estimate.clientSuppliesBatting) {
    lineItems.push({
      description: "Batting (Client Supplied)",
      amount: 0,
    });
  }

  if (estimate.bindingTotal && estimate.bindingTotal > 0) {
    lineItems.push({
      description: `Binding - ${
        estimate.bindingPerimeter?.toFixed(0) || "0"
      }" × $${estimate.bindingRatePerInch || 0}/in`,
      amount: estimate.bindingTotal,
    });
  }

  if (estimate.bobbinTotal && estimate.bobbinTotal > 0) {
    lineItems.push({
      description: `Bobbins (${estimate.bobbinCount || 1})`,
      amount: estimate.bobbinTotal,
    });
  }

  const businessAddress = formatBusinessAddress();
  const clientAddressLines = formatClientAddress();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - hidden when printing */}
      <div className="print:hidden bg-white border-b border-line sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
          >
            ← Back to Project
          </button>
          <div className="flex gap-2">
            {project.paidInFull && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold">
                ✓ PAID IN FULL
              </span>
            )}
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-plum text-white rounded-xl font-bold hover:bg-plum/90"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 print:p-0 print:max-w-none">
        {/* Payment Recording Section - hidden when printing */}
        {!project.paidInFull && amountDue > 0 && (
          <div className="print:hidden bg-white border border-line rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-plum">Payment Due</h3>
                <p className="text-2xl font-bold text-plum">
                  {formatCurrency(amountDue)}
                </p>
              </div>
              {!showPaymentForm && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                  💵 Record Payment
                </button>
              )}
            </div>

            {showPaymentForm && (
              <div className="mt-4 pt-4 border-t border-line">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-line rounded-xl"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-xl"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Check">Check</option>
                      <option value="Venmo">Venmo</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Square">Square</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleRecordFinalPayment}
                    disabled={updating}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Payment"}
                  </button>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 border border-line rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paid confirmation - hidden when printing */}
        {project.paidInFull && project.finalPaymentAmount && (
          <div className="print:hidden bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-700">✓ Payment Received</h3>
                <p className="text-sm text-green-600">
                  {formatCurrency(project.finalPaymentAmount)} paid on{" "}
                  {formatDate(project.finalPaymentDate || "")}
                  {project.finalPaymentMethod &&
                    ` via ${project.finalPaymentMethod}`}
                </p>
              </div>
              <button
                onClick={handleClearFinalPayment}
                disabled={updating}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear payment
              </button>
            </div>
          </div>
        )}

        {/* Invoice Document */}
        <div
          ref={invoiceRef}
          className="bg-white shadow-lg print:shadow-none rounded-lg print:rounded-none p-6 print:p-8"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {/* Header - Logo beside business info */}
          <div
            className="flex justify-between items-start mb-4 pb-4 border-b-2"
            style={{ borderColor: settings.brandPrimaryColor || "#4e283a" }}
          >
            <div className="flex items-start gap-4">
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{ color: settings.brandPrimaryColor || "#4e283a" }}
                >
                  {settings.businessName || "Your Business Name"}
                </h1>
                <div className="text-xs text-gray-600 mt-1">
                  {[
                    businessAddress,
                    settings.phone,
                    settings.email,
                    settings.website,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2
                className="text-2xl font-bold"
                style={{ color: settings.brandPrimaryColor || "#4e283a" }}
              >
                INVOICE
              </h2>
              <div className="text-xs mt-1 space-y-0.5">
                <div>
                  <span className="text-gray-500">Invoice #:</span>{" "}
                  <span className="font-bold">{invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>{" "}
                  {formatDate(invoiceDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Bill To and Project Details */}
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: settings.brandSecondaryColor || "#98823a" }}
              >
                Bill To
              </div>
              <div className="font-bold">
                {project.clientFirstName} {project.clientLastName}
              </div>
              {clientAddressLines.length > 0 && (
                <div className="text-xs text-gray-600 mt-0.5">
                  {clientAddressLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {[project.clientEmail, project.clientPhone]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: settings.brandSecondaryColor || "#98823a" }}
              >
                Project Details
              </div>
              {project.quiltWidth && project.quiltLength && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Quilt:</span>{" "}
                  {project.quiltWidth}" × {project.quiltLength}"
                </div>
              )}
              {project.quiltingType && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Type:</span>{" "}
                  {project.quiltingType}
                </div>
              )}
              {project.description && (
                <div className="text-xs text-gray-600 max-w-xs">
                  {project.description}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table - Compact */}
          <table className="w-full mb-4 text-sm">
            <thead>
              <tr
                className="text-left text-xs uppercase tracking-wide"
                style={{
                  backgroundColor: settings.brandPrimaryColor || "#4e283a",
                  color: "white",
                }}
              >
                <th className="py-2 px-3 rounded-tl">Description</th>
                <th className="py-2 px-3 text-right rounded-tr">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-2 px-3">{item.description}</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals - Compact, right aligned */}
          <div className="flex justify-end mb-4">
            <div className="w-64">
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {taxAmount > 0 && (
                <div className="flex justify-between py-1 text-sm border-t border-gray-100">
                  <span className="text-gray-600">
                    {settings.taxLabel || "Tax"} ({estimate.taxRate}%)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              )}

              <div
                className="flex justify-between py-2 text-base font-bold border-t-2"
                style={{ borderColor: settings.brandPrimaryColor || "#4e283a" }}
              >
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {depositPaid > 0 && (
                <div className="flex justify-between py-1.5 text-sm bg-green-50 px-2 rounded mt-1">
                  <span className="text-green-700">
                    Deposit Paid
                    {project.depositPaidDate &&
                      ` (${formatDate(project.depositPaidDate)})`}
                    {project.depositPaidMethod &&
                      ` - ${project.depositPaidMethod}`}
                  </span>
                  <span className="font-medium text-green-700">
                    -{formatCurrency(depositPaid)}
                  </span>
                </div>
              )}

              {finalPaid > 0 && (
                <div className="flex justify-between py-1.5 text-sm bg-green-50 px-2 rounded mt-1">
                  <span className="text-green-700">
                    Payment Received
                    {project.finalPaymentDate &&
                      ` (${formatDate(project.finalPaymentDate)})`}
                    {project.finalPaymentMethod &&
                      ` - ${project.finalPaymentMethod}`}
                  </span>
                  <span className="font-medium text-green-700">
                    -{formatCurrency(finalPaid)}
                  </span>
                </div>
              )}

              <div
                className={`flex justify-between py-2 text-lg font-bold mt-1 px-2 rounded ${
                  amountDue <= 0 ? "bg-green-600" : ""
                }`}
                style={
                  amountDue > 0
                    ? {
                        backgroundColor:
                          settings.brandPrimaryColor || "#4e283a",
                        color: "white",
                      }
                    : { color: "white" }
                }
              >
                <span>{amountDue <= 0 ? "Paid in Full" : "Amount Due"}</span>
                <span>
                  {amountDue <= 0 ? "✓" : formatCurrency(amountDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Compact */}
          <div className="border-t border-gray-200 pt-3 text-center text-xs text-gray-500">
            <p className="font-medium">Thank you for your business!</p>
            <p>
              Payment is due upon receipt unless otherwise arranged.
              {settings.email && ` Questions? Contact us at ${settings.email}`}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: letter;
            margin: 0.4in;
          }
        }
      `}</style>
    </div>
  );
}
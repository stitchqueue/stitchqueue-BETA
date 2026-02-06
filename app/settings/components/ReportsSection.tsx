/**
 * ReportsSection Component
 * 
 * Full-featured reports and data management section.
 * Includes revenue reports, materials usage, client analysis,
 * tax summary, CSV export, and danger zone.
 * 
 * @module settings/components/ReportsSection
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { storage } from "../../lib/storage";
import type { Settings } from "../../types";
import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";

interface ReportsSectionProps {
  settings: Settings;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
}

type ReportType = "revenue" | "payments" | "materials" | "clients" | "tax";
type DateRangeType = "month" | "quarter" | "year" | "custom";

// Modal types for drill-down
type ModalType = 
  | "revenue" 
  | "quilting" 
  | "materials" 
  | "donations"
  | "deposits" 
  | "finalPayments" 
  | "outstanding" 
  | "pendingDeposits"
  | "totalCash";

interface ModalState {
  isOpen: boolean;
  title: string;
  type: ModalType | null;
  data: any[];
}

/**
 * Full reports and data management section.
 * 
 * Features:
 * - Revenue reports with breakdown
 * - Materials usage tracking
 * - Client analysis
 * - Tax summary for donations
 * - CSV export
 * - Clear all data (danger zone)
 */
export default function ReportsSection({
  settings,
  isOpen,
  onToggle,
}: ReportsSectionProps) {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<ReportType>("revenue");
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Modal state for drill-down
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    type: null,
    data: [],
  });

  const openModal = (title: string, type: ModalType, data: any[]) => {
    setModal({ isOpen: true, title, type, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: "", type: null, data: [] });
  };

  // ─────────────────────────────────────────────────────────────────────
  // DATE RANGE HELPERS
  // ─────────────────────────────────────────────────────────────────────
  const getDateRange = useCallback(() => {
    const now = new Date();
    let startDate: string;
    let endDate: string;

    switch (dateRange) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
          .toISOString()
          .split("T")[0];
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0)
          .toISOString()
          .split("T")[0];
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
        endDate = new Date(now.getFullYear(), 11, 31)
          .toISOString()
          .split("T")[0];
        break;
      case "custom":
        startDate =
          customStartDate ||
          new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
        endDate = customEndDate || new Date().toISOString().split("T")[0];
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        endDate = new Date().toISOString().split("T")[0];
    }

    return { startDate, endDate };
  }, [dateRange, customStartDate, customEndDate]);

  // ─────────────────────────────────────────────────────────────────────
  // FORMAT HELPERS
  // ─────────────────────────────────────────────────────────────────────
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currencyCode || "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ─────────────────────────────────────────────────────────────────────
  // LOAD REPORT DATA
  // ─────────────────────────────────────────────────────────────────────
  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      switch (selectedReport) {
        case "revenue":
          const revenueData = await storage.getRevenueAnalytics(
            startDate,
            endDate
          );
          setReportData(revenueData);
          break;
        case "payments":
          const paymentsData = await storage.getPaymentAnalytics(
            startDate,
            endDate
          );
          setReportData(paymentsData);
          break;
        case "materials":
          const materialsData = await storage.getMaterialsAnalytics(
            startDate,
            endDate
          );
          setReportData(materialsData);
          break;
        case "clients":
          const clientData = await storage.getClientAnalytics();
          setReportData(clientData);
          break;
        case "tax":
          const currentYear = new Date().getFullYear();
          const taxData = await storage.getTaxSummary(currentYear);
          setReportData(taxData);
          break;
        default:
          setReportData(null);
      }
    } catch (error) {
      console.error("Error loading report data:", error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedReport, getDateRange]);

  useEffect(() => {
    if (isOpen) {
      loadReportData();
    }
  }, [isOpen, loadReportData]);

  // ─────────────────────────────────────────────────────────────────────
  // EXPORT HANDLERS
  // ─────────────────────────────────────────────────────────────────────
  const exportReportData = () => {
    if (!reportData) return;

    let csvContent = "";
    let filename = "";
    const { startDate, endDate } = getDateRange();

    switch (selectedReport) {
      case "revenue":
        filename = `revenue-report-${startDate}-${endDate}.csv`;
        csvContent = [
          ["Revenue Report", `${startDate} to ${endDate}`],
          [],
          ["Metric", "Value"],
          ["Total Revenue", reportData.totalRevenue],
          ["Quilting Revenue", reportData.quiltingRevenue],
          ["Batting Revenue", reportData.battingRevenue],
          ["Bobbin Revenue", reportData.bobbinRevenue],
          ["Extra Charges", reportData.extraChargesRevenue],
          ["Donation Value", reportData.donationValue],
          ["Project Count", reportData.projectCount],
          ["Average Project Value", reportData.averageProjectValue],
        ]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");
        break;

      case "payments":
        filename = `payments-report-${startDate}-${endDate}.csv`;
        const paymentRows = (reportData.recentPayments || []).map(
          (payment: any) => [
            payment.clientName,
            payment.type === "deposit" ? "Deposit" : "Final Payment",
            payment.amount,
            payment.date,
            payment.method || "",
          ]
        );
        csvContent = [
          ["Payments Report", `${startDate} to ${endDate}`],
          [],
          ["Summary", ""],
          ["Total Cash Received", reportData.totalCashReceived || 0],
          ["Deposits Received", reportData.depositsReceived || 0],
          ["Deposit Count", reportData.depositCount || 0],
          ["Final Payments Received", reportData.finalPaymentsReceived || 0],
          ["Final Payment Count", reportData.finalPaymentCount || 0],
          [],
          ["Outstanding", ""],
          ["Outstanding Balances", reportData.outstandingBalances || 0],
          ["Pending Deposits", reportData.pendingDeposits || 0],
          ["Pending Deposit Count", reportData.pendingDepositCount || 0],
          [],
          ["Recent Payments"],
          ["Client", "Type", "Amount", "Date", "Method"],
          ...paymentRows,
        ]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");
        break;

      case "materials":
        filename = `materials-report-${startDate}-${endDate}.csv`;
        csvContent = [
          ["Materials Usage Report", `${startDate} to ${endDate}`],
          [],
          ["Bobbin Metrics", ""],
          ["Bobbins Sold", reportData.bobbinsSold || 0],
          ["Bobbin Revenue", reportData.bobbinRevenue || 0],
          [],
          ["Batting Metrics", ""],
          ["Yards Used", (reportData.battingYardsUsed || 0).toFixed(1)],
          ["Batting Revenue", reportData.battingRevenue || 0],
        ]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");
        break;

      case "clients":
        filename = `client-report-${new Date().toISOString().split("T")[0]}.csv`;
        const clientRows = (reportData.topClientsByRevenue || []).map(
          (client: any) => [
            client.name,
            client.email || "",
            client.projectCount,
            client.totalRevenue,
            client.lastProjectDate,
          ]
        );
        csvContent = [
          ["Client Analysis Report"],
          [],
          ["Total Unique Clients", reportData.totalUniqueClients || 0],
          [
            "Repeat Client Percentage",
            `${(reportData.repeatClientPercentage || 0).toFixed(1)}%`,
          ],
          [],
          ["Top Clients by Revenue"],
          ["Name", "Email", "Project Count", "Total Revenue", "Last Project"],
          ...clientRows,
        ]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");
        break;

      case "tax":
        const year = new Date().getFullYear();
        filename = `tax-summary-${year}.csv`;
        csvContent = [
          [`Tax Summary ${year}`],
          [],
          ["Donation Summary", ""],
          ["Total Donations", reportData.donationCount || 0],
          ["Total Donation Value", reportData.totalDonationValue || 0],
          [],
          ["Tax Deductions", ""],
          ["Materials (Deductible)", reportData.materialsDonatedValue || 0],
          ["Services (Non-Deductible)", reportData.servicesDonatedValue || 0],
          [],
          ["Charitable Mileage", ""],
          ["Miles Driven", reportData.charitableMileage || 0],
          ["Mileage Deduction", reportData.charitableMileageValue || 0],
        ]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAllCSV = async () => {
    const projects = await storage.getProjects();

    const headers = [
      "ID",
      "Stage",
      "Client First Name",
      "Client Last Name",
      "Email",
      "Phone",
      "Street",
      "City",
      "State",
      "Postal Code",
      "Country",
      "Intake Date",
      "Due Date",
      "Description",
      "Quilt Width",
      "Quilt Length",
      "Is Donation",
      "Total Value",
      "Created At",
    ];

    const rows = projects.map((p) => [
      p.id,
      p.stage,
      p.clientFirstName,
      p.clientLastName,
      p.clientEmail || "",
      p.clientPhone || "",
      p.clientStreet || "",
      p.clientCity || "",
      p.clientState || "",
      p.clientPostalCode || "",
      p.clientCountry || "",
      p.intakeDate,
      p.dueDate || "",
      p.description || "",
      p.quiltWidth || "",
      p.quiltLength || "",
      p.isDonation ? "Yes" : "No",
      p.estimateData?.total || "",
      p.createdAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stitchqueue-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to clear ALL data? This cannot be undone!"
      )
    )
      return;
    if (
      !confirm(
        "Really sure? All projects, settings, and data will be deleted!"
      )
    )
      return;

    try {
      const deleteResult = await storage.deleteAllProjects();
      if (!deleteResult.success) {
        alert("Error deleting projects: " + deleteResult.error);
        return;
      }

      localStorage.clear();
      alert("All data cleared! Reloading...");
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Error clearing data. Check console for details.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div>
      <AccordionHeader
        sectionKey="data"
        label="Reports & Data"
        icon="📊"
        subtitle="Business analytics and data management"
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        <div className="space-y-6">
          {/* Report Type Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "revenue" as ReportType, label: "Revenue", icon: "💰" },
              { key: "payments" as ReportType, label: "Payments", icon: "💵" },
              { key: "materials" as ReportType, label: "Materials", icon: "🧵" },
              { key: "clients" as ReportType, label: "Clients", icon: "👥" },
              { key: "tax" as ReportType, label: "Tax Summary", icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedReport(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  selectedReport === tab.key
                    ? "bg-plum text-white"
                    : "bg-background border border-line hover:bg-white"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Range Selector (not shown for clients or tax) */}
          {selectedReport !== "clients" && selectedReport !== "tax" && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted">Date Range:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "month" as DateRangeType, label: "This Month" },
                  { key: "quarter" as DateRangeType, label: "This Quarter" },
                  { key: "year" as DateRangeType, label: "This Year" },
                  { key: "custom" as DateRangeType, label: "Custom" },
                ].map((range) => (
                  <button
                    key={range.key}
                    onClick={() => setDateRange(range.key)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      dateRange === range.key
                        ? "bg-gold text-white"
                        : "bg-background border border-line hover:bg-white"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {dateRange === "custom" && (
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-line rounded-lg text-sm"
                  />
                  <span className="text-sm text-muted">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-line rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Report Content */}
          <div className="border border-line rounded-xl p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum mr-3"></div>
                <span className="text-muted">Loading report...</span>
              </div>
            ) : reportData ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-plum">
                    {selectedReport === "revenue" && "Revenue Report"}
                    {selectedReport === "payments" && "Payments Report"}
                    {selectedReport === "materials" && "Materials Usage Report"}
                    {selectedReport === "clients" && "Client Analysis"}
                    {selectedReport === "tax" &&
                      `Tax Summary ${new Date().getFullYear()}`}
                  </h3>
                  <button
                    onClick={exportReportData}
                    className="px-4 py-2 border border-plum text-plum rounded-xl text-sm font-bold hover:bg-plum hover:text-white transition-colors"
                  >
                    Export CSV
                  </button>
                </div>

                {/* Revenue Report */}
                {selectedReport === "revenue" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => openModal(
                          "Total Revenue",
                          "revenue",
                          reportData.revenueDetails || []
                        )}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl text-left hover:bg-green-100 transition-colors cursor-pointer"
                      >
                        <div className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">
                          Total Revenue
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {formatCurrency(reportData.totalRevenue)}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {reportData.projectCount} projects completed • Click for details
                        </div>
                      </button>

                      <button
                        onClick={() => openModal(
                          "Quilting Services",
                          "quilting",
                          reportData.quiltingDetails || []
                        )}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <div className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1">
                          Quilting Services
                        </div>
                        <div className="text-xl font-bold text-blue-700">
                          {formatCurrency(reportData.quiltingRevenue)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {reportData.totalRevenue > 0
                            ? (
                                (reportData.quiltingRevenue /
                                  reportData.totalRevenue) *
                                100
                              ).toFixed(0)
                            : 0}
                          % of total • Click for details
                        </div>
                      </button>

                      <button
                        onClick={() => openModal(
                          "Materials Income",
                          "materials",
                          reportData.materialsDetails || []
                        )}
                        className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        <div className="text-purple-600 text-xs font-bold uppercase tracking-wide mb-1">
                          Materials Income
                        </div>
                        <div className="text-xl font-bold text-purple-700">
                          {formatCurrency(
                            reportData.battingRevenue + reportData.bobbinRevenue
                          )}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                          Batting + Bobbins • Click for details
                        </div>
                      </button>

                      <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl">
                        <div className="text-gold text-xs font-bold uppercase tracking-wide mb-1">
                          Average Project
                        </div>
                        <div
                          className="text-xl font-bold"
                          style={{ color: "#98823a" }}
                        >
                          {formatCurrency(reportData.averageProjectValue)}
                        </div>
                        <div className="text-xs text-gold mt-1">
                          Per completed project
                        </div>
                      </div>
                    </div>

                    {reportData.donationValue > 0 && (
                      <button
                        onClick={() => openModal(
                          "Charitable Donations",
                          "donations",
                          reportData.donationDetails || []
                        )}
                        className="w-full p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold text-purple-700 mb-2">
                          🎁 Charitable Donations
                        </h4>
                        <div className="text-lg font-bold text-purple-600">
                          {formatCurrency(reportData.donationValue)}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                          Total value of donated services and materials • Click for details
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Payments Report */}
                {selectedReport === "payments" && (
                  <div className="space-y-6">
                    {/* Cash Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => {
                          // Combine deposits and final payments for total cash view
                          const allPayments = [
                            ...(reportData.depositDetails || []).map((d: any) => ({ ...d, type: "deposit" })),
                            ...(reportData.finalPaymentDetails || []).map((d: any) => ({ ...d, type: "final" })),
                          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          openModal("Total Cash Received", "totalCash", allPayments);
                        }}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl text-left hover:bg-green-100 transition-colors cursor-pointer"
                      >
                        <div className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">
                          Total Cash Received
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {formatCurrency(reportData.totalCashReceived || 0)}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Deposits + Final Payments • Click for details
                        </div>
                      </button>

                      <button
                        onClick={() => openModal(
                          "Deposits Received",
                          "deposits",
                          reportData.depositDetails || []
                        )}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <div className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1">
                          Deposits Received
                        </div>
                        <div className="text-xl font-bold text-blue-700">
                          {formatCurrency(reportData.depositsReceived || 0)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {reportData.depositCount || 0} deposits • Click for details
                        </div>
                      </button>

                      <button
                        onClick={() => openModal(
                          "Final Payments",
                          "finalPayments",
                          reportData.finalPaymentDetails || []
                        )}
                        className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        <div className="text-purple-600 text-xs font-bold uppercase tracking-wide mb-1">
                          Final Payments
                        </div>
                        <div className="text-xl font-bold text-purple-700">
                          {formatCurrency(reportData.finalPaymentsReceived || 0)}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                          {reportData.finalPaymentCount || 0} payments • Click for details
                        </div>
                      </button>

                      <button
                        onClick={() => openModal(
                          "Outstanding Balances",
                          "outstanding",
                          reportData.outstandingDetails || []
                        )}
                        className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-left hover:bg-orange-100 transition-colors cursor-pointer"
                      >
                        <div className="text-orange-600 text-xs font-bold uppercase tracking-wide mb-1">
                          Outstanding Balances
                        </div>
                        <div className="text-xl font-bold text-orange-700">
                          {formatCurrency(reportData.outstandingBalances || 0)}
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          Active projects • Click for details
                        </div>
                      </button>
                    </div>

                    {/* Pending Deposits Alert */}
                    {(reportData.pendingDepositCount || 0) > 0 && (
                      <button
                        onClick={() => openModal(
                          "Pending Deposits",
                          "pendingDeposits",
                          reportData.pendingDepositDetails || []
                        )}
                        className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left hover:bg-yellow-100 transition-colors cursor-pointer"
                      >
                        <h4 className="font-bold text-yellow-700 mb-2">
                          ⏳ Pending Deposits
                        </h4>
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-lg font-bold text-yellow-700">
                              {formatCurrency(reportData.pendingDeposits || 0)}
                            </div>
                            <div className="text-xs text-yellow-600">
                              {reportData.pendingDepositCount} project{(reportData.pendingDepositCount || 0) !== 1 ? "s" : ""} awaiting deposit • Click for details
                            </div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Recent Payments */}
                    <div>
                      <h4 className="font-bold text-plum mb-4">
                        Recent Payments
                      </h4>
                      {(reportData.recentPayments || []).length > 0 ? (
                        <div className="space-y-2">
                          {(reportData.recentPayments || []).map(
                            (payment: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => router.push(`/project/${payment.projectId}`)}
                                className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                              >
                                <div className="flex-1">
                                  <div className="font-bold text-sm">
                                    {payment.clientName}
                                  </div>
                                  <div className="text-xs text-muted">
                                    {payment.type === "deposit" ? "💵 Deposit" : "✅ Final Payment"}
                                    {payment.method && ` • ${payment.method}`}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`font-bold ${payment.type === "deposit" ? "text-blue-600" : "text-green-600"}`}>
                                    {formatCurrency(payment.amount)}
                                  </div>
                                  <div className="text-xs text-muted">
                                    {formatDate(payment.date)}
                                  </div>
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-muted py-8">
                          <div className="text-4xl mb-2">💵</div>
                          <div className="font-bold mb-2">No Payments Yet</div>
                          <div className="text-sm">
                            Payments will appear here as they are recorded.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Materials Report */}
                {selectedReport === "materials" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-bold text-plum">🧵 Bobbin Sales</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted">Bobbins Sold</span>
                            <span className="font-bold">
                              {reportData.bobbinsSold || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Bobbin Revenue</span>
                            <span className="font-bold">
                              {formatCurrency(reportData.bobbinRevenue || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">
                              Avg Price per Bobbin
                            </span>
                            <span className="font-bold">
                              {(reportData.bobbinsSold || 0) > 0
                                ? formatCurrency(
                                    (reportData.bobbinRevenue || 0) /
                                      reportData.bobbinsSold
                                  )
                                : "$0.00"}
                            </span>
                          </div>
                        </div>

                        {reportData.popularBobbinTypes &&
                          reportData.popularBobbinTypes.length > 0 && (
                            <div className="mt-4">
                              <div className="text-sm font-bold text-muted mb-2">
                                Popular Bobbin Types
                              </div>
                              <div className="space-y-1">
                                {reportData.popularBobbinTypes.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-sm"
                                    >
                                      <span>{item.name}</span>
                                      <span className="text-muted">
                                        {item.count} sold
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-plum">🛏️ Batting Usage</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted">Yards Used</span>
                            <span className="font-bold">
                              {(reportData.battingYardsUsed || 0).toFixed(1)} yds
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Batting Revenue</span>
                            <span className="font-bold">
                              {formatCurrency(reportData.battingRevenue || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">
                              Avg Price per Yard
                            </span>
                            <span className="font-bold">
                              {(reportData.battingYardsUsed || 0) > 0
                                ? formatCurrency(
                                    (reportData.battingRevenue || 0) /
                                      reportData.battingYardsUsed
                                  )
                                : "$0.00"}
                            </span>
                          </div>
                        </div>

                        {reportData.popularBattingTypes &&
                          reportData.popularBattingTypes.length > 0 && (
                            <div className="mt-4">
                              <div className="text-sm font-bold text-muted mb-2">
                                Popular Batting Types
                              </div>
                              <div className="space-y-1">
                                {reportData.popularBattingTypes.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-sm"
                                    >
                                      <span>{item.name}</span>
                                      <span className="text-muted">
                                        {item.count} projects
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Analysis */}
                {selectedReport === "clients" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          {reportData.totalUniqueClients || 0}
                        </div>
                        <div className="text-blue-600 text-sm font-bold">
                          Total Clients
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-700">
                          {(reportData.repeatClientPercentage || 0).toFixed(0)}%
                        </div>
                        <div className="text-green-600 text-sm font-bold">
                          Repeat Clients
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                        <div className="text-2xl font-bold text-purple-700">
                          {(reportData.topClientsByRevenue || []).length}
                        </div>
                        <div className="text-purple-600 text-sm font-bold">
                          Top Clients
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-plum mb-4">
                        Top Clients by Revenue
                      </h4>
                      <div className="space-y-2">
                        {(reportData.topClientsByRevenue || []).map(
                          (client: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border border-line rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="font-bold text-sm">
                                  {client.name}
                                </div>
                                {client.email && (
                                  <div className="text-xs text-muted">
                                    {client.email}
                                  </div>
                                )}
                                <div className="text-xs text-muted mt-1">
                                  Last project:{" "}
                                  {formatDate(client.lastProjectDate)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">
                                  {formatCurrency(client.totalRevenue || 0)}
                                </div>
                                <div className="text-xs text-muted">
                                  {client.projectCount || 0} project
                                  {(client.projectCount || 0) !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        {(reportData.topClientsByRevenue || []).length === 0 && (
                          <div className="text-center text-muted py-8">
                            No client data available yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax Summary */}
                {selectedReport === "tax" && (
                  <div className="space-y-6">
                    {reportData.donationCount > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                            <h4 className="font-bold text-purple-700 mb-3">
                              🎁 Donation Summary
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted">
                                  Total Donations
                                </span>
                                <span className="font-bold">
                                  {reportData.donationCount}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">Total Value</span>
                                <span className="font-bold">
                                  {formatCurrency(reportData.totalDonationValue)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <h4 className="font-bold text-green-700 mb-3">
                              📋 Tax Deductions
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted">
                                  Materials (Deductible)
                                </span>
                                <span className="font-bold text-green-600">
                                  {formatCurrency(
                                    reportData.materialsDonatedValue
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">
                                  Services (Non-Deductible)
                                </span>
                                <span className="font-bold text-gray-500">
                                  {formatCurrency(
                                    reportData.servicesDonatedValue
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {reportData.charitableMileage > 0 && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <h4 className="font-bold text-blue-700 mb-3">
                              🚗 Charitable Mileage
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted">Miles Driven</span>
                                <span className="font-bold">
                                  {reportData.charitableMileage} miles
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">
                                  Deductible Value
                                </span>
                                <span className="font-bold text-blue-600">
                                  {formatCurrency(
                                    reportData.charitableMileageValue
                                  )}
                                </span>
                              </div>
                              <div className="text-xs text-blue-600 mt-2">
                                @ $0.14 per mile (IRS charitable rate)
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl">
                          <h4 className="font-bold text-gold mb-2">
                            💰 Total Tax-Deductible Value
                          </h4>
                          <div
                            className="text-2xl font-bold"
                            style={{ color: "#98823a" }}
                          >
                            {formatCurrency(
                              reportData.materialsDonatedValue +
                                reportData.charitableMileageValue
                            )}
                          </div>
                          <div className="text-xs text-gold mt-2">
                            Materials donated + charitable mileage. Consult your
                            tax advisor.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted py-8">
                        <div className="text-4xl mb-2">🎁</div>
                        <div className="font-bold mb-2">No Donations Yet</div>
                        <div className="text-sm">
                          Mark projects as donations to track tax-deductible
                          contributions.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted py-8">
                <div className="text-4xl mb-2">📊</div>
                <div className="font-bold mb-2">No Data Available</div>
                <div className="text-sm">
                  Complete some projects to see reporting data.
                </div>
              </div>
            )}
          </div>

          {/* Data Management Section */}
          <div className="border-t border-line pt-6 space-y-4">
            <h3 className="font-bold text-plum">Data Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-line rounded-xl">
                <h4 className="font-bold text-sm mb-2">Export All Data</h4>
                <p className="text-xs text-muted mb-4">
                  Export all projects to CSV for backup or external use.
                </p>
                <button
                  onClick={handleExportAllCSV}
                  className="px-4 py-2 bg-plum text-white rounded-xl font-bold text-sm"
                >
                  Export Projects CSV
                </button>
              </div>

              <div className="p-4 border border-red-300 rounded-xl bg-red-50">
                <h4 className="font-bold text-sm text-red-600 mb-2">
                  Danger Zone
                </h4>
                <p className="text-xs text-muted mb-4">
                  Clear all data including projects and settings. Cannot be
                  undone!
                </p>
                <button
                  onClick={handleClearAllData}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Drill-Down Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-line">
                <h3 className="text-lg font-bold text-plum">{modal.title}</h3>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {modal.data.length === 0 ? (
                  <div className="text-center text-muted py-8">
                    No items to display.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Revenue Details */}
                    {modal.type === "revenue" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            Quilting: {formatCurrency(item.quiltingAmount)} • Materials: {formatCurrency(item.materialsAmount)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(item.amount)}</div>
                          <div className="text-xs text-muted">{formatDate(item.date)}</div>
                        </div>
                      </button>
                    ))}

                    {/* Quilting Details */}
                    {modal.type === "quilting" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            {item.quiltSize} • {item.quiltingType}
                          </div>
                        </div>
                        <div className="font-bold text-blue-600">{formatCurrency(item.amount)}</div>
                      </button>
                    ))}

                    {/* Materials Details */}
                    {modal.type === "materials" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            Batting: {formatCurrency(item.battingAmount)} • Bobbins: {formatCurrency(item.bobbinAmount)}
                          </div>
                        </div>
                        <div className="font-bold text-purple-600">{formatCurrency(item.totalAmount)}</div>
                      </button>
                    ))}

                    {/* Donation Details */}
                    {modal.type === "donations" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">{formatDate(item.date)}</div>
                        </div>
                        <div className="font-bold text-purple-600">{formatCurrency(item.amount)}</div>
                      </button>
                    ))}

                    {/* Deposit Details */}
                    {modal.type === "deposits" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            {formatDate(item.date)}{item.method && ` • ${item.method}`}
                          </div>
                        </div>
                        <div className="font-bold text-blue-600">{formatCurrency(item.amount)}</div>
                      </button>
                    ))}

                    {/* Final Payment Details */}
                    {modal.type === "finalPayments" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            {formatDate(item.date)}{item.method && ` • ${item.method}`}
                          </div>
                        </div>
                        <div className="font-bold text-green-600">{formatCurrency(item.amount)}</div>
                      </button>
                    ))}

                    {/* Total Cash Details (combines deposits + final) */}
                    {modal.type === "totalCash" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            {item.type === "deposit" ? "💵 Deposit" : "✅ Final"} • {formatDate(item.date)}
                          </div>
                        </div>
                        <div className={`font-bold ${item.type === "deposit" ? "text-blue-600" : "text-green-600"}`}>
                          {formatCurrency(item.amount)}
                        </div>
                      </button>
                    ))}

                    {/* Outstanding Balance Details */}
                    {modal.type === "outstanding" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            Total: {formatCurrency(item.totalAmount)} • Paid: {formatCurrency(item.paidAmount)} • Stage: {item.stage}
                          </div>
                        </div>
                        <div className="font-bold text-orange-600">{formatCurrency(item.balanceAmount)}</div>
                      </button>
                    ))}

                    {/* Pending Deposit Details */}
                    {modal.type === "pendingDeposits" && modal.data.map((item: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          closeModal();
                          router.push(`/project/${item.projectId}`);
                        }}
                        className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                      >
                        <div>
                          <div className="font-bold text-sm">{item.clientName}</div>
                          <div className="text-xs text-muted">
                            Total: {formatCurrency(item.totalAmount)} • Stage: {item.stage}
                          </div>
                        </div>
                        <div className="font-bold text-yellow-600">{formatCurrency(item.expectedDeposit)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-line bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">
                    {modal.data.length} item{modal.data.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-plum text-white rounded-xl font-bold text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AccordionBody>
    </div>
  );
}
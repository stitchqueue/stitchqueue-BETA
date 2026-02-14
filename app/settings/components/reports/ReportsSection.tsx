/**
 * ReportsSection Component (Main Orchestrator)
 * 
 * Coordinates all report functionality with sub-components and utilities.
 * Manages state, data loading, and export operations.
 * 
 * @module settings/components/ReportsSection
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { storage } from "../../../lib/storage";
import { FeatureGate, isFeatureEnabled } from "../../../lib/featureFlags";
import type { Settings } from "../../../types";
import { AccordionHeader, AccordionBody, SectionKey } from "../Accordion";

// Import utilities
import {
  getDateRange,
  type DateRangeType,
  exportRevenueCSV,
  exportPaymentsCSV,
  exportMaterialsCSV,
  exportClientsCSV,
  exportTaxCSV,
  exportRevenuePDF,
  exportPaymentsPDF,
  exportMaterialsPDF,
  exportClientsPDF,
  exportTaxPDF,
} from "./utils";

// Import components
import ReportTypeTabs, { type ReportType } from "./ReportTypeTabs";
import DateRangeSelector from "./DateRangeSelector";
import ExportMenu from "./ExportMenu";
import RevenueReport from "./RevenueReport";
import PaymentsReport from "./PaymentsReport";
import { MaterialsReport, ClientsReport } from "./MaterialsAndClientReports";
import TaxReport from "./TaxReport";
import ReportModal, { type ModalType } from "./ReportModal";
import DataManagement from "./DataManagement";

interface ReportsSectionProps {
  settings: Settings;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  type: ModalType | null;
  data: any[];
}

/**
 * Main reports section orchestrator
 * Manages report selection, data loading, and export operations
 */
export default function ReportsSection({
  settings,
  isOpen,
  onToggle,
}: ReportsSectionProps) {
  // Report state
  const [selectedReport, setSelectedReport] = useState<ReportType>("revenue");
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // UI state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    type: null,
    data: [],
  });

  // Modal controls
  const openModal = (title: string, type: ModalType, data: any[]) => {
    setModal({ isOpen: true, title, type, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: "", type: null, data: [] });
  };

  // Load report data
  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const range = getDateRange(dateRange, customStartDate, customEndDate);
      const { startDate, endDate } = range;

      switch (selectedReport) {
        case "revenue":
          const revenueData = await storage.getRevenueAnalytics(startDate, endDate);
          setReportData(revenueData);
          break;
        case "payments":
          const paymentsData = await storage.getPaymentAnalytics(startDate, endDate);
          setReportData(paymentsData);
          break;
        case "materials":
          const materialsData = await storage.getMaterialsAnalytics(startDate, endDate);
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
  }, [selectedReport, dateRange, customStartDate, customEndDate]);

  // Load data when section opens or report changes
  useEffect(() => {
    if (isOpen) {
      loadReportData();
    }
  }, [isOpen, loadReportData]);

  // Export handlers
  const handleExportCSV = () => {
    if (!reportData) return;
    const range = getDateRange(dateRange, customStartDate, customEndDate);

    switch (selectedReport) {
      case "revenue":
        exportRevenueCSV(reportData, range);
        break;
      case "payments":
        exportPaymentsCSV(reportData, range);
        break;
      case "materials":
        exportMaterialsCSV(reportData, range);
        break;
      case "clients":
        exportClientsCSV(reportData);
        break;
      case "tax":
        exportTaxCSV(reportData);
        break;
    }
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    const range = getDateRange(dateRange, customStartDate, customEndDate);

    switch (selectedReport) {
      case "revenue":
        exportRevenuePDF(reportData, range, settings);
        break;
      case "payments":
        exportPaymentsPDF(reportData, range, settings);
        break;
      case "materials":
        exportMaterialsPDF(reportData, range, settings);
        break;
      case "clients":
        exportClientsPDF(reportData, settings);
        break;
      case "tax":
        exportTaxPDF(reportData, settings);
        break;
    }
    setShowExportMenu(false);
  };

  // Render report content
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum mr-3"></div>
          <span className="text-muted">Loading report...</span>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center text-muted py-8">
          <div className="text-4xl mb-2">📊</div>
          <div className="font-bold mb-2">No Data Available</div>
          <div className="text-sm">Complete some projects to see reporting data.</div>
        </div>
      );
    }

    switch (selectedReport) {
      case "revenue":
        return (
          <RevenueReport
            reportData={reportData}
            currencyCode={settings.currencyCode || "USD"}
            onOpenModal={openModal}
          />
        );
      case "payments":
        return (
          <PaymentsReport
            reportData={reportData}
            currencyCode={settings.currencyCode || "USD"}
            onOpenModal={openModal}
          />
        );
      case "materials":
        return (
          <MaterialsReport
            reportData={reportData}
            currencyCode={settings.currencyCode || "USD"}
          />
        );
      case "clients":
        return (
          <ClientsReport
            reportData={reportData}
            currencyCode={settings.currencyCode || "USD"}
          />
        );
      case "tax":
        return (
          <TaxReport
            reportData={reportData}
            currencyCode={settings.currencyCode || "USD"}
          />
        );
      default:
        return null;
    }
  };

  // Dynamic label: show "Reports & Data" when reports enabled, "Data Management" when hidden
  const sectionLabel = isFeatureEnabled("ENABLE_FINANCIAL_REPORTS")
    ? "Reports & Data"
    : "Data Management";
  const sectionSubtitle = isFeatureEnabled("ENABLE_FINANCIAL_REPORTS")
    ? "Business analytics and data management"
    : "Export data and manage your account";

  return (
    <div>
      <AccordionHeader
        sectionKey="data"
        label={sectionLabel}
        icon="📊"
        subtitle={sectionSubtitle}
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        <div className="space-y-6">
          {/* v4.0 DEPRECATED - Financial reports hidden by ENABLE_FINANCIAL_REPORTS flag */}
          {/* QuickBooks/Xero handles revenue, cash flow, and financial analytics */}
          <FeatureGate flag="ENABLE_FINANCIAL_REPORTS">
            {/* Report Type Selector */}
            <ReportTypeTabs
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
            />

            {/* Date Range Selector (not shown for clients or tax) */}
            {selectedReport !== "clients" && selectedReport !== "tax" && (
              <DateRangeSelector
                dateRange={dateRange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onSelectRange={setDateRange}
                onCustomStartChange={setCustomStartDate}
                onCustomEndChange={setCustomEndDate}
              />
            )}

            {/* Report Content Container */}
            <div className="border border-line rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-plum">
                  {selectedReport === "revenue" && "Revenue Report"}
                  {selectedReport === "payments" && "Payments Report"}
                  {selectedReport === "materials" && "Materials Usage Report"}
                  {selectedReport === "clients" && "Client Analysis"}
                  {selectedReport === "tax" && `Tax Summary ${new Date().getFullYear()}`}
                </h3>
                <ExportMenu
                  isOpen={showExportMenu}
                  onToggle={() => setShowExportMenu(!showExportMenu)}
                  onExportCSV={handleExportCSV}
                  onExportPDF={handleExportPDF}
                />
              </div>

              {renderReportContent()}
            </div>
          </FeatureGate>

          {/* Data Management Section - always visible */}
          <DataManagement />
        </div>

        {/* Report Detail Modal */}
        <FeatureGate flag="ENABLE_FINANCIAL_REPORTS">
          <ReportModal
            modal={modal}
            currencyCode={settings.currencyCode || "USD"}
            onClose={closeModal}
          />
        </FeatureGate>
      </AccordionBody>
    </div>
  );
}

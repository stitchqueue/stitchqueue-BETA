/**
 * Revenue Report Display Component
 * 
 * Displays revenue analytics with summary cards and project details.
 * 
 * @module settings/components/reports/RevenueReport
 */

"use client";

import { formatCurrency } from "./utils";
import type { ModalType } from "./ReportModal";

interface RevenueReportProps {
  reportData: any;
  currencyCode: string;
  onOpenModal: (title: string, type: ModalType, data: any[]) => void;
}

/**
 * Revenue report with clickable summary cards
 */
export default function RevenueReport({
  reportData,
  currencyCode,
  onOpenModal,
}: RevenueReportProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() =>
            onOpenModal(
              "Total Revenue",
              "revenue",
              reportData.revenueDetails || []
            )
          }
          className="p-4 bg-green-50 border border-green-200 rounded-xl text-left hover:bg-green-100 transition-colors cursor-pointer"
        >
          <div className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">
            Total Revenue
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(reportData.totalRevenue, currencyCode)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {reportData.projectCount} projects completed • Click for details
          </div>
        </button>

        <button
          onClick={() =>
            onOpenModal(
              "Quilting Services",
              "quilting",
              reportData.quiltingDetails || []
            )
          }
          className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <div className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1">
            Quilting Services
          </div>
          <div className="text-xl font-bold text-blue-700">
            {formatCurrency(reportData.quiltingRevenue, currencyCode)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {reportData.totalRevenue > 0
              ? ((reportData.quiltingRevenue / reportData.totalRevenue) * 100).toFixed(0)
              : 0}
            % of total • Click for details
          </div>
        </button>

        <button
          onClick={() =>
            onOpenModal(
              "Materials Income",
              "materials",
              reportData.materialsDetails || []
            )
          }
          className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100 transition-colors cursor-pointer"
        >
          <div className="text-purple-600 text-xs font-bold uppercase tracking-wide mb-1">
            Materials Income
          </div>
          <div className="text-xl font-bold text-purple-700">
            {formatCurrency(
              reportData.battingRevenue + reportData.bobbinRevenue,
              currencyCode
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
          <div className="text-xl font-bold" style={{ color: "#98823a" }}>
            {formatCurrency(reportData.averageProjectValue, currencyCode)}
          </div>
          <div className="text-xs text-gold mt-1">Per completed project</div>
        </div>
      </div>

      {/* Donations Card (if applicable) */}
      {reportData.donationValue > 0 && (
        <button
          onClick={() =>
            onOpenModal(
              "Charitable Donations",
              "donations",
              reportData.donationDetails || []
            )
          }
          className="w-full p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100 transition-colors cursor-pointer"
        >
          <h4 className="font-bold text-purple-700 mb-2">
            🎁 Charitable Donations
          </h4>
          <div className="text-lg font-bold text-purple-600">
            {formatCurrency(reportData.donationValue, currencyCode)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Total value of donated services and materials • Click for details
          </div>
        </button>
      )}
    </div>
  );
}

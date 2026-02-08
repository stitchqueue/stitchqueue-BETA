/**
 * Tax Summary Report Display Component
 * 
 * Displays tax-deductible donations and charitable mileage.
 * 
 * @module settings/components/reports/TaxReport
 */

"use client";

import { formatCurrency } from "./utils";

interface TaxReportProps {
  reportData: any;
  currencyCode: string;
}

/**
 * Tax summary report for charitable donations
 */
export default function TaxReport({
  reportData,
  currencyCode,
}: TaxReportProps) {
  if (reportData.donationCount === 0) {
    return (
      <div className="text-center text-muted py-8">
        <div className="text-4xl mb-2">🎁</div>
        <div className="font-bold mb-2">No Donations Yet</div>
        <div className="text-sm">
          Mark projects as donations to track tax-deductible contributions.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donation Summary */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <h4 className="font-bold text-purple-700 mb-3">
            🎁 Donation Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Total Donations</span>
              <span className="font-bold">{reportData.donationCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Total Value</span>
              <span className="font-bold">
                {formatCurrency(reportData.totalDonationValue, currencyCode)}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Deductions */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <h4 className="font-bold text-green-700 mb-3">📋 Tax Deductions</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Materials (Deductible)</span>
              <span className="font-bold text-green-600">
                {formatCurrency(reportData.materialsDonatedValue, currencyCode)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Services (Non-Deductible)</span>
              <span className="font-bold text-gray-500">
                {formatCurrency(reportData.servicesDonatedValue, currencyCode)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charitable Mileage */}
      {reportData.charitableMileage > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-bold text-blue-700 mb-3">🚗 Charitable Mileage</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Miles Driven</span>
              <span className="font-bold">
                {reportData.charitableMileage} miles
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Deductible Value</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(reportData.charitableMileageValue, currencyCode)}
              </span>
            </div>
            <div className="text-xs text-blue-600 mt-2">
              @ $0.14 per mile (IRS charitable rate)
            </div>
          </div>
        </div>
      )}

      {/* Total Deductible */}
      <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl">
        <h4 className="font-bold text-gold mb-2">
          💰 Total Tax-Deductible Value
        </h4>
        <div className="text-2xl font-bold" style={{ color: "#98823a" }}>
          {formatCurrency(
            reportData.materialsDonatedValue + reportData.charitableMileageValue,
            currencyCode
          )}
        </div>
        <div className="text-xs text-gold mt-2">
          Materials donated + charitable mileage. Consult your tax advisor.
        </div>
      </div>
    </div>
  );
}

/**
 * Payments Report Display Component
 * 
 * Displays payment analytics including cash flow, deposits, and outstanding balances.
 * 
 * @module settings/components/reports/PaymentsReport
 */

"use client";

import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "./utils";
import type { ModalType } from "./ReportModal";

interface PaymentsReportProps {
  reportData: any;
  currencyCode: string;
  onOpenModal: (title: string, type: ModalType, data: any[]) => void;
}

/**
 * Payments report with cash flow summary and payment details
 */
export default function PaymentsReport({
  reportData,
  currencyCode,
  onOpenModal,
}: PaymentsReportProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Cash Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            // Combine deposits and final payments for total cash view
            const allPayments = [
              ...(reportData.depositDetails || []).map((d: any) => ({
                ...d,
                type: "deposit",
              })),
              ...(reportData.finalPaymentDetails || []).map((d: any) => ({
                ...d,
                type: "final",
              })),
            ].sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            onOpenModal("Total Cash Received", "totalCash", allPayments);
          }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl text-left hover:bg-green-100 transition-colors cursor-pointer"
        >
          <div className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">
            Total Cash Received
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(reportData.totalCashReceived || 0, currencyCode)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Deposits + Final Payments • Click for details
          </div>
        </button>

        <button
          onClick={() =>
            onOpenModal(
              "Deposits Received",
              "deposits",
              reportData.depositDetails || []
            )
          }
          className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <div className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1">
            Deposits Received
          </div>
          <div className="text-xl font-bold text-blue-700">
            {formatCurrency(reportData.depositsReceived || 0, currencyCode)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {reportData.depositCount || 0} deposits • Click for details
          </div>
        </button>

        <button
          onClick={() =>
            onOpenModal(
              "Final Payments",
              "finalPayments",
              reportData.finalPaymentDetails || []
            )
          }
          className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-left hover:bg-purple-100 transition-colors cursor-pointer"
        >
          <div className="text-purple-600 text-xs font-bold uppercase tracking-wide mb-1">
            Final Payments
          </div>
          <div className="text-xl font-bold text-purple-700">
            {formatCurrency(reportData.finalPaymentsReceived || 0, currencyCode)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {reportData.finalPaymentCount || 0} payments • Click for details
          </div>
        </button>

        <button
          onClick={() =>
            onOpenModal(
              "Outstanding Balances",
              "outstanding",
              reportData.outstandingDetails || []
            )
          }
          className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-left hover:bg-orange-100 transition-colors cursor-pointer"
        >
          <div className="text-orange-600 text-xs font-bold uppercase tracking-wide mb-1">
            Outstanding Balances
          </div>
          <div className="text-xl font-bold text-orange-700">
            {formatCurrency(reportData.outstandingBalances || 0, currencyCode)}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Active projects • Click for details
          </div>
        </button>
      </div>

      {/* Pending Deposits Alert */}
      {(reportData.pendingDepositCount || 0) > 0 && (
        <button
          onClick={() =>
            onOpenModal(
              "Pending Deposits",
              "pendingDeposits",
              reportData.pendingDepositDetails || []
            )
          }
          className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left hover:bg-yellow-100 transition-colors cursor-pointer"
        >
          <h4 className="font-bold text-yellow-700 mb-2">⏳ Pending Deposits</h4>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-lg font-bold text-yellow-700">
                {formatCurrency(reportData.pendingDeposits || 0, currencyCode)}
              </div>
              <div className="text-xs text-yellow-600">
                {reportData.pendingDepositCount} project
                {(reportData.pendingDepositCount || 0) !== 1 ? "s" : ""} awaiting
                deposit • Click for details
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Recent Payments */}
      <div>
        <h4 className="font-bold text-plum mb-4">Recent Payments</h4>
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
                    <div className="font-bold text-sm">{payment.clientName}</div>
                    <div className="text-xs text-muted">
                      {payment.type === "deposit" ? "💵 Deposit" : "✅ Final Payment"}
                      {payment.method && ` • ${payment.method}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        payment.type === "deposit"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(payment.amount, currencyCode)}
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
  );
}

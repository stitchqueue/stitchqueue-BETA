/**
 * Report Modal Component
 * 
 * Modal for drilling down into report details with clickable project links.
 * 
 * @module settings/components/reports/ReportModal
 */

"use client";

import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "./utils";

export type ModalType =
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

interface ReportModalProps {
  modal: ModalState;
  currencyCode: string;
  onClose: () => void;
}

/**
 * Modal for displaying detailed report data with project links
 */
export default function ReportModal({
  modal,
  currencyCode,
  onClose,
}: ReportModalProps) {
  const router = useRouter();

  if (!modal.isOpen) return null;

  const handleProjectClick = (projectId: string) => {
    onClose();
    router.push(`/project/${projectId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="text-lg font-bold text-plum">{modal.title}</h3>
          <button
            onClick={onClose}
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
              {modal.type === "revenue" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        Quilting: {formatCurrency(item.quiltingAmount, currencyCode)} •
                        Materials: {formatCurrency(item.materialsAmount, currencyCode)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(item.amount, currencyCode)}
                      </div>
                      <div className="text-xs text-muted">
                        {formatDate(item.date)}
                      </div>
                    </div>
                  </button>
                ))}

              {/* Quilting Details */}
              {modal.type === "quilting" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        {item.quiltSize} • {item.quiltingType}
                      </div>
                    </div>
                    <div className="font-bold text-blue-600">
                      {formatCurrency(item.amount, currencyCode)}
                    </div>
                  </button>
                ))}

              {/* Materials Details */}
              {modal.type === "materials" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        Batting: {formatCurrency(item.battingAmount, currencyCode)} •
                        Bobbins: {formatCurrency(item.bobbinAmount, currencyCode)}
                      </div>
                    </div>
                    <div className="font-bold text-purple-600">
                      {formatCurrency(item.totalAmount, currencyCode)}
                    </div>
                  </button>
                ))}

              {/* Donation Details */}
              {modal.type === "donations" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        {formatDate(item.date)}
                      </div>
                    </div>
                    <div className="font-bold text-purple-600">
                      {formatCurrency(item.amount, currencyCode)}
                    </div>
                  </button>
                ))}

              {/* Deposit Details */}
              {modal.type === "deposits" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        {formatDate(item.date)}
                        {item.method && ` • ${item.method}`}
                      </div>
                    </div>
                    <div className="font-bold text-blue-600">
                      {formatCurrency(item.amount, currencyCode)}
                    </div>
                  </button>
                ))}

              {/* Final Payment Details */}
              {modal.type === "finalPayments" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        {formatDate(item.date)}
                        {item.method && ` • ${item.method}`}
                      </div>
                    </div>
                    <div className="font-bold text-green-600">
                      {formatCurrency(item.amount, currencyCode)}
                    </div>
                  </button>
                ))}

              {/* Total Cash Details (combines deposits + final) */}
              {modal.type === "totalCash" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        {item.type === "deposit" ? "💵 Deposit" : "✅ Final"} •{" "}
                        {formatDate(item.date)}
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        item.type === "deposit"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(item.amount, currencyCode)}
                    </div>
                  </button>
                ))}

              {/* Outstanding Balance Details */}
              {modal.type === "outstanding" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        Total: {formatCurrency(item.totalAmount, currencyCode)} • Paid:{" "}
                        {formatCurrency(item.paidAmount, currencyCode)} • Stage:{" "}
                        {item.stage}
                      </div>
                    </div>
                    <div className="font-bold text-orange-600">
                      {formatCurrency(item.balanceAmount, currencyCode)}
                    </div>
                  </button>
                ))}

              {/* Pending Deposit Details */}
              {modal.type === "pendingDeposits" &&
                modal.data.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleProjectClick(item.projectId)}
                    className="w-full flex items-center justify-between p-3 border border-line rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-bold text-sm">{item.clientName}</div>
                      <div className="text-xs text-muted">
                        Total: {formatCurrency(item.totalAmount, currencyCode)} •
                        Stage: {item.stage}
                      </div>
                    </div>
                    <div className="font-bold text-yellow-600">
                      {formatCurrency(item.expectedDeposit, currencyCode)}
                    </div>
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
              onClick={onClose}
              className="px-4 py-2 bg-plum text-white rounded-xl font-bold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CSV Export Utilities
 * 
 * Functions for exporting report data to CSV format.
 * 
 * @module settings/components/reports/utils/csvExport
 */

import type { DateRange } from "./dateHelpers";

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Convert array of rows to CSV string
 */
function arrayToCSV(rows: any[][]): string {
  return rows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
}

/**
 * Export revenue report to CSV
 */
export function exportRevenueCSV(
  reportData: any,
  dateRange: DateRange
): void {
  const { startDate, endDate } = dateRange;
  const filename = `revenue-report-${startDate}-${endDate}.csv`;

  const csvContent = arrayToCSV([
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
  ]);

  downloadCSV(csvContent, filename);
}

/**
 * Export payments report to CSV
 */
export function exportPaymentsCSV(
  reportData: any,
  dateRange: DateRange
): void {
  const { startDate, endDate } = dateRange;
  const filename = `payments-report-${startDate}-${endDate}.csv`;

  const paymentRows = (reportData.recentPayments || []).map(
    (payment: any) => [
      payment.clientName,
      payment.type === "deposit" ? "Deposit" : "Final Payment",
      payment.amount,
      payment.date,
      payment.method || "",
    ]
  );

  const csvContent = arrayToCSV([
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
  ]);

  downloadCSV(csvContent, filename);
}

/**
 * Export materials report to CSV
 */
export function exportMaterialsCSV(
  reportData: any,
  dateRange: DateRange
): void {
  const { startDate, endDate } = dateRange;
  const filename = `materials-report-${startDate}-${endDate}.csv`;

  const csvContent = arrayToCSV([
    ["Materials Usage Report", `${startDate} to ${endDate}`],
    [],
    ["Bobbin Metrics", ""],
    ["Bobbins Sold", reportData.bobbinsSold || 0],
    ["Bobbin Revenue", reportData.bobbinRevenue || 0],
    [],
    ["Batting Metrics", ""],
    ["Yards Used", (reportData.battingYardsUsed || 0).toFixed(1)],
    ["Batting Revenue", reportData.battingRevenue || 0],
  ]);

  downloadCSV(csvContent, filename);
}

/**
 * Export client analysis to CSV
 */
export function exportClientsCSV(reportData: any): void {
  const filename = `client-report-${new Date().toISOString().split("T")[0]}.csv`;

  const clientRows = (reportData.topClientsByRevenue || []).map(
    (client: any) => [
      client.name,
      client.email || "",
      client.projectCount,
      client.totalRevenue,
      client.lastProjectDate,
    ]
  );

  const csvContent = arrayToCSV([
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
  ]);

  downloadCSV(csvContent, filename);
}

/**
 * Export tax summary to CSV
 */
export function exportTaxCSV(reportData: any): void {
  const year = new Date().getFullYear();
  const filename = `tax-summary-${year}.csv`;

  const csvContent = arrayToCSV([
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
  ]);

  downloadCSV(csvContent, filename);
}

/**
 * Export all projects to CSV
 */
export function exportAllProjectsCSV(projects: any[]): void {
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

  const csv = arrayToCSV([headers, ...rows]);
  const filename = `stitchqueue-export-${new Date().toISOString().split("T")[0]}.csv`;

  downloadCSV(csv, filename);
}

/**
 * PDF Export Utilities
 * 
 * Functions for exporting report data to PDF format using jsPDF.
 * 
 * @module settings/components/reports/utils/pdfExport
 */

import { jsPDF } from "jspdf";
import type { Settings } from "@/app/types";
import type { DateRange } from "./dateHelpers";
import { getTodayDate } from "../../../../lib/utils";

/**
 * PDF Generation Configuration
 */
interface PDFConfig {
  margin: number;
  pageWidth: number;
  pageHeight: number;
}

/**
 * Initialize PDF document with header
 */
function initializePDF(
  settings: Settings,
  title: string,
  subtitle?: string
): { doc: jsPDF; config: PDFConfig; yPos: number } {
  const doc = new jsPDF();
  const config: PDFConfig = {
    margin: 20,
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
  };
  let yPos = 20;

  // Business name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(78, 40, 58); // Plum color
  doc.text(settings?.businessName || "StitchQueue", config.margin, yPos);
  yPos += 10;

  // Report title
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(title, config.margin, yPos);
  yPos += 8;

  // Subtitle (date range or year)
  if (subtitle) {
    doc.setFontSize(10);
    doc.text(subtitle, config.margin, yPos);
  }
  yPos += 5;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(config.margin, yPos, config.pageWidth - config.margin, yPos);
  yPos += 15;

  doc.setTextColor(0, 0, 0);

  return { doc, config, yPos };
}

/**
 * Check if new page is needed and add if necessary
 */
function checkPageBreak(
  doc: jsPDF,
  yPos: number,
  neededSpace: number,
  pageHeight: number
): number {
  if (yPos + neededSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return yPos;
}

/**
 * Add footer to all pages
 */
function addFooters(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }
}

/**
 * Format currency for PDF
 */
function pdfFormatCurrency(amount: number, currencyCode: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/**
 * Export revenue report to PDF
 */
export function exportRevenuePDF(
  reportData: any,
  dateRange: DateRange,
  settings: Settings
): void {
  const { startDate, endDate } = dateRange;
  const { doc, config, yPos: startYPos } = initializePDF(
    settings,
    "Revenue Report",
    `Period: ${startDate} to ${endDate}`
  );
  let yPos = startYPos;

  // Summary section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", config.margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const summaryItems = [
    ["Total Revenue:", pdfFormatCurrency(reportData.totalRevenue || 0, settings.currencyCode)],
    ["Quilting Services:", pdfFormatCurrency(reportData.quiltingRevenue || 0, settings.currencyCode)],
    ["Batting Revenue:", pdfFormatCurrency(reportData.battingRevenue || 0, settings.currencyCode)],
    ["Bobbin Revenue:", pdfFormatCurrency(reportData.bobbinRevenue || 0, settings.currencyCode)],
    ["Extra Charges:", pdfFormatCurrency(reportData.extraChargesRevenue || 0, settings.currencyCode)],
    ["Donation Value:", pdfFormatCurrency(reportData.donationValue || 0, settings.currencyCode)],
    ["Projects Completed:", String(reportData.projectCount || 0)],
    ["Average Project Value:", pdfFormatCurrency(reportData.averageProjectValue || 0, settings.currencyCode)],
  ];

  summaryItems.forEach(([label, value]) => {
    doc.text(label, config.margin, yPos);
    doc.text(value, config.margin + 60, yPos);
    yPos += 6;
  });

  // Project details table
  if (reportData.revenueDetails && reportData.revenueDetails.length > 0) {
    yPos += 10;
    yPos = checkPageBreak(doc, yPos, 30, config.pageHeight);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Project Details", config.margin, yPos);
    yPos += 8;

    // Table header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(config.margin, yPos - 4, config.pageWidth - 2 * config.margin, 7, "F");
    doc.text("Client", config.margin + 2, yPos);
    doc.text("Quilting", config.margin + 70, yPos);
    doc.text("Materials", config.margin + 100, yPos);
    doc.text("Total", config.margin + 135, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    reportData.revenueDetails.slice(0, 25).forEach((item: any) => {
      yPos = checkPageBreak(doc, yPos, 8, config.pageHeight);
      doc.text(item.clientName.substring(0, 30), config.margin + 2, yPos);
      doc.text(pdfFormatCurrency(item.quiltingAmount, settings.currencyCode), config.margin + 70, yPos);
      doc.text(pdfFormatCurrency(item.materialsAmount, settings.currencyCode), config.margin + 100, yPos);
      doc.text(pdfFormatCurrency(item.amount, settings.currencyCode), config.margin + 135, yPos);
      yPos += 6;
    });

    if (reportData.revenueDetails.length > 25) {
      yPos += 4;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`... and ${reportData.revenueDetails.length - 25} more projects`, config.margin, yPos);
    }
  }

  addFooters(doc, config.pageWidth, config.pageHeight);
  doc.save(`revenue-report-${startDate}-${endDate}.pdf`);
}

/**
 * Export payments report to PDF
 */
export function exportPaymentsPDF(
  reportData: any,
  dateRange: DateRange,
  settings: Settings
): void {
  const { startDate, endDate } = dateRange;
  const { doc, config, yPos: startYPos } = initializePDF(
    settings,
    "Payments Report",
    `Period: ${startDate} to ${endDate}`
  );
  let yPos = startYPos;

  // Summary section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cash Flow Summary", config.margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const summaryItems = [
    ["Total Cash Received:", pdfFormatCurrency(reportData.totalCashReceived || 0, settings.currencyCode)],
    ["Deposits Received:", `${pdfFormatCurrency(reportData.depositsReceived || 0, settings.currencyCode)} (${reportData.depositCount || 0} deposits)`],
    ["Final Payments:", `${pdfFormatCurrency(reportData.finalPaymentsReceived || 0, settings.currencyCode)} (${reportData.finalPaymentCount || 0} payments)`],
    ["Outstanding Balances:", pdfFormatCurrency(reportData.outstandingBalances || 0, settings.currencyCode)],
    ["Pending Deposits:", `${pdfFormatCurrency(reportData.pendingDeposits || 0, settings.currencyCode)} (${reportData.pendingDepositCount || 0} projects)`],
  ];

  summaryItems.forEach(([label, value]) => {
    doc.text(label, config.margin, yPos);
    doc.text(value, config.margin + 55, yPos);
    yPos += 6;
  });

  // Outstanding balances details
  if (reportData.outstandingDetails && reportData.outstandingDetails.length > 0) {
    yPos += 10;
    yPos = checkPageBreak(doc, yPos, 30, config.pageHeight);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Outstanding Balances", config.margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(255, 237, 213); // Orange tint
    doc.rect(config.margin, yPos - 4, config.pageWidth - 2 * config.margin, 7, "F");
    doc.text("Client", config.margin + 2, yPos);
    doc.text("Total", config.margin + 70, yPos);
    doc.text("Paid", config.margin + 100, yPos);
    doc.text("Balance Due", config.margin + 130, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    reportData.outstandingDetails.forEach((item: any) => {
      yPos = checkPageBreak(doc, yPos, 8, config.pageHeight);
      doc.text(item.clientName.substring(0, 30), config.margin + 2, yPos);
      doc.text(pdfFormatCurrency(item.totalAmount, settings.currencyCode), config.margin + 70, yPos);
      doc.text(pdfFormatCurrency(item.paidAmount, settings.currencyCode), config.margin + 100, yPos);
      doc.setTextColor(200, 100, 0);
      doc.text(pdfFormatCurrency(item.balanceAmount, settings.currencyCode), config.margin + 130, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    });
  }

  // Pending deposits details
  if (reportData.pendingDepositDetails && reportData.pendingDepositDetails.length > 0) {
    yPos += 10;
    yPos = checkPageBreak(doc, yPos, 30, config.pageHeight);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Pending Deposits", config.margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(254, 249, 195); // Yellow tint
    doc.rect(config.margin, yPos - 4, config.pageWidth - 2 * config.margin, 7, "F");
    doc.text("Client", config.margin + 2, yPos);
    doc.text("Project Total", config.margin + 70, yPos);
    doc.text("Expected Deposit", config.margin + 115, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    reportData.pendingDepositDetails.forEach((item: any) => {
      yPos = checkPageBreak(doc, yPos, 8, config.pageHeight);
      doc.text(item.clientName.substring(0, 30), config.margin + 2, yPos);
      doc.text(pdfFormatCurrency(item.totalAmount, settings.currencyCode), config.margin + 70, yPos);
      doc.setTextColor(180, 130, 0);
      doc.text(pdfFormatCurrency(item.expectedDeposit, settings.currencyCode), config.margin + 115, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    });
  }

  addFooters(doc, config.pageWidth, config.pageHeight);
  doc.save(`payments-report-${startDate}-${endDate}.pdf`);
}

/**
 * Export materials report to PDF
 */
export function exportMaterialsPDF(
  reportData: any,
  dateRange: DateRange,
  settings: Settings
): void {
  const { startDate, endDate } = dateRange;
  const { doc, config, yPos: startYPos } = initializePDF(
    settings,
    "Materials Usage Report",
    `Period: ${startDate} to ${endDate}`
  );
  let yPos = startYPos;

  // Bobbin section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bobbin Sales", config.margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Bobbins Sold: ${reportData.bobbinsSold || 0}`, config.margin, yPos);
  yPos += 6;
  doc.text(`Bobbin Revenue: ${pdfFormatCurrency(reportData.bobbinRevenue || 0, settings.currencyCode)}`, config.margin, yPos);
  yPos += 6;
  if ((reportData.bobbinsSold || 0) > 0) {
    doc.text(`Avg Price/Bobbin: ${pdfFormatCurrency((reportData.bobbinRevenue || 0) / reportData.bobbinsSold, settings.currencyCode)}`, config.margin, yPos);
  }
  yPos += 12;

  // Batting section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Batting Usage", config.margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Yards Used: ${(reportData.battingYardsUsed || 0).toFixed(1)} yds`, config.margin, yPos);
  yPos += 6;
  doc.text(`Batting Revenue: ${pdfFormatCurrency(reportData.battingRevenue || 0, settings.currencyCode)}`, config.margin, yPos);
  yPos += 6;
  if ((reportData.battingYardsUsed || 0) > 0) {
    doc.text(`Avg Price/Yard: ${pdfFormatCurrency((reportData.battingRevenue || 0) / reportData.battingYardsUsed, settings.currencyCode)}`, config.margin, yPos);
  }
  yPos += 12;

  // Popular types
  if (reportData.popularBattingTypes && reportData.popularBattingTypes.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Popular Batting Types", config.margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    reportData.popularBattingTypes.forEach((item: any) => {
      doc.text(`${item.name}: ${item.count} projects`, config.margin, yPos);
      yPos += 6;
    });
  }

  addFooters(doc, config.pageWidth, config.pageHeight);
  doc.save(`materials-report-${startDate}-${endDate}.pdf`);
}

/**
 * Export client analysis to PDF
 */
export function exportClientsPDF(
  reportData: any,
  settings: Settings
): void {
  const { doc, config, yPos: startYPos } = initializePDF(
    settings,
    "Client Analysis"
  );
  let yPos = startYPos;

  // Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Client Summary", config.margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Unique Clients: ${reportData.totalUniqueClients || 0}`, config.margin, yPos);
  yPos += 6;
  doc.text(`Repeat Client Rate: ${(reportData.repeatClientPercentage || 0).toFixed(0)}%`, config.margin, yPos);
  yPos += 12;

  // Top clients table
  if (reportData.topClientsByRevenue && reportData.topClientsByRevenue.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Top Clients by Revenue", config.margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(config.margin, yPos - 4, config.pageWidth - 2 * config.margin, 7, "F");
    doc.text("Client", config.margin + 2, yPos);
    doc.text("Projects", config.margin + 80, yPos);
    doc.text("Total Revenue", config.margin + 110, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    reportData.topClientsByRevenue.forEach((client: any) => {
      yPos = checkPageBreak(doc, yPos, 8, config.pageHeight);
      doc.text(client.name.substring(0, 35), config.margin + 2, yPos);
      doc.text(String(client.projectCount), config.margin + 80, yPos);
      doc.text(pdfFormatCurrency(client.totalRevenue, settings.currencyCode), config.margin + 110, yPos);
      yPos += 6;
    });
  }

  addFooters(doc, config.pageWidth, config.pageHeight);
  doc.save(`client-analysis-${getTodayDate()}.pdf`);
}

/**
 * Export tax summary to PDF
 */
export function exportTaxPDF(
  reportData: any,
  settings: Settings
): void {
  const year = new Date().getFullYear();
  const { doc, config, yPos: startYPos } = initializePDF(
    settings,
    `Tax Summary ${year}`,
    `Year: ${year}`
  );
  let yPos = startYPos;

  if ((reportData.donationCount || 0) > 0) {
    // Donation summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Donation Summary", config.margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Donations: ${reportData.donationCount}`, config.margin, yPos);
    yPos += 6;
    doc.text(`Total Value: ${pdfFormatCurrency(reportData.totalDonationValue || 0, settings.currencyCode)}`, config.margin, yPos);
    yPos += 12;

    // Tax deductions
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Tax Deduction Breakdown", config.margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 128, 0);
    doc.text(`Materials (Deductible): ${pdfFormatCurrency(reportData.materialsDonatedValue || 0, settings.currencyCode)}`, config.margin, yPos);
    yPos += 6;
    doc.setTextColor(128, 128, 128);
    doc.text(`Services (Non-Deductible): ${pdfFormatCurrency(reportData.servicesDonatedValue || 0, settings.currencyCode)}`, config.margin, yPos);
    yPos += 12;
    doc.setTextColor(0, 0, 0);

    // Mileage
    if ((reportData.charitableMileage || 0) > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Charitable Mileage", config.margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Miles Driven: ${reportData.charitableMileage}`, config.margin, yPos);
      yPos += 6;
      doc.text(`Deductible Value: ${pdfFormatCurrency(reportData.charitableMileageValue || 0, settings.currencyCode)} @ $0.14/mile`, config.margin, yPos);
      yPos += 12;
    }

    // Total deductible
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(152, 130, 58); // Gold color
    const totalDeductible = (reportData.materialsDonatedValue || 0) + (reportData.charitableMileageValue || 0);
    doc.text(`Total Tax-Deductible: ${pdfFormatCurrency(totalDeductible, settings.currencyCode)}`, config.margin, yPos);
    yPos += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Note: Consult your tax advisor for guidance.", config.margin, yPos);
  } else {
    doc.setFontSize(10);
    doc.text("No donations recorded for this year.", config.margin, yPos);
  }

  addFooters(doc, config.pageWidth, config.pageHeight);
  doc.save(`tax-summary-${year}.pdf`);
}

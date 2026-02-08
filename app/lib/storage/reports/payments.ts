/**
 * Payment Analytics
 * 
 * Functions for tracking cash flow, deposits, and outstanding balances.
 * 
 * @module lib/storage/reports/payments
 */

import { getProjects } from "../projects";

/**
 * Get payment/cash flow analytics
 * Shows deposits received, final payments, outstanding balances
 * Includes detail arrays for drill-down views
 */
export async function getPaymentAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  depositsReceived: number;
  depositCount: number;
  finalPaymentsReceived: number;
  finalPaymentCount: number;
  totalCashReceived: number;
  outstandingBalances: number;
  pendingDeposits: number;
  pendingDepositCount: number;
  recentPayments: Array<{
    clientName: string;
    amount: number;
    type: "deposit" | "final";
    date: string;
    method?: string;
    projectId: string;
  }>;
  // Detail arrays for drill-down
  depositDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    date: string;
    method?: string;
  }>;
  finalPaymentDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    date: string;
    method?: string;
  }>;
  outstandingDetails: Array<{
    projectId: string;
    clientName: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    stage: string;
  }>;
  pendingDepositDetails: Array<{
    projectId: string;
    clientName: string;
    expectedDeposit: number;
    totalAmount: number;
    stage: string;
  }>;
}> {
  // Get all non-archived, non-donation projects
  const allProjects = await getProjects();

  let depositsReceived = 0;
  let depositCount = 0;
  let finalPaymentsReceived = 0;
  let finalPaymentCount = 0;
  let outstandingBalances = 0;
  let pendingDeposits = 0;
  let pendingDepositCount = 0;
  
  const recentPayments: Array<{
    clientName: string;
    amount: number;
    type: "deposit" | "final";
    date: string;
    method?: string;
    projectId: string;
  }> = [];

  // Detail arrays
  const depositDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    date: string;
    method?: string;
  }> = [];
  const finalPaymentDetails: Array<{
    projectId: string;
    clientName: string;
    amount: number;
    date: string;
    method?: string;
  }> = [];
  const outstandingDetails: Array<{
    projectId: string;
    clientName: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    stage: string;
  }> = [];
  const pendingDepositDetails: Array<{
    projectId: string;
    clientName: string;
    expectedDeposit: number;
    totalAmount: number;
    stage: string;
  }> = [];

  // Parse date range for filtering recent payments
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate + "T23:59:59.999Z");

  allProjects.forEach((project) => {
    if (project.isDonation) return;

    const estimate = project.estimateData;
    const total = estimate?.total || 0;
    const clientName = `${project.clientFirstName} ${project.clientLastName}`.trim();

    // Calculate deposit amounts
    let expectedDeposit = 0;
    if (project.depositType === "percentage" && project.depositPercentage) {
      expectedDeposit = (total * project.depositPercentage) / 100;
    } else if (project.depositType === "flat" && project.depositAmount) {
      expectedDeposit = project.depositAmount;
    }

    // Track deposits received
    if (project.depositPaid && project.depositPaidAmount) {
      depositsReceived += project.depositPaidAmount;
      depositCount++;

      // Add to deposit details
      depositDetails.push({
        projectId: project.id,
        clientName,
        amount: project.depositPaidAmount,
        date: project.depositPaidDate || project.createdAt,
        method: project.depositPaidMethod,
      });

      // Check if deposit was paid within date range for recent payments
      if (project.depositPaidDate) {
        const paidDate = new Date(project.depositPaidDate);
        if (paidDate >= rangeStart && paidDate <= rangeEnd) {
          recentPayments.push({
            clientName,
            amount: project.depositPaidAmount,
            type: "deposit",
            date: project.depositPaidDate,
            method: project.depositPaidMethod,
            projectId: project.id,
          });
        }
      }
    } else if (expectedDeposit > 0 && project.stage !== "Archived") {
      // Deposit expected but not yet paid
      pendingDeposits += expectedDeposit;
      pendingDepositCount++;
      pendingDepositDetails.push({
        projectId: project.id,
        clientName,
        expectedDeposit,
        totalAmount: total,
        stage: project.stage,
      });
    }

    // Track final payments received
    if (project.finalPaymentAmount && project.finalPaymentAmount > 0) {
      finalPaymentsReceived += project.finalPaymentAmount;
      finalPaymentCount++;

      // Add to final payment details
      finalPaymentDetails.push({
        projectId: project.id,
        clientName,
        amount: project.finalPaymentAmount,
        date: project.finalPaymentDate || project.createdAt,
        method: project.finalPaymentMethod,
      });

      // Check if final payment was within date range for recent payments
      if (project.finalPaymentDate) {
        const paidDate = new Date(project.finalPaymentDate);
        if (paidDate >= rangeStart && paidDate <= rangeEnd) {
          recentPayments.push({
            clientName,
            amount: project.finalPaymentAmount,
            type: "final",
            date: project.finalPaymentDate,
            method: project.finalPaymentMethod,
            projectId: project.id,
          });
        }
      }
    }

    // Calculate outstanding balance for active projects
    if (project.stage !== "Archived" && project.stage !== "Paid/Shipped" && total > 0) {
      const depositPaid = project.depositPaidAmount || 0;
      const finalPaid = project.finalPaymentAmount || 0;
      const balance = total - depositPaid - finalPaid;
      if (balance > 0) {
        outstandingBalances += balance;
        outstandingDetails.push({
          projectId: project.id,
          clientName,
          totalAmount: total,
          paidAmount: depositPaid + finalPaid,
          balanceAmount: balance,
          stage: project.stage,
        });
      }
    }
  });

  // Sort recent payments by date (newest first)
  recentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Sort detail arrays
  depositDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  finalPaymentDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  outstandingDetails.sort((a, b) => b.balanceAmount - a.balanceAmount);
  pendingDepositDetails.sort((a, b) => b.expectedDeposit - a.expectedDeposit);

  return {
    depositsReceived,
    depositCount,
    finalPaymentsReceived,
    finalPaymentCount,
    totalCashReceived: depositsReceived + finalPaymentsReceived,
    outstandingBalances,
    pendingDeposits,
    pendingDepositCount,
    recentPayments: recentPayments.slice(0, 10),
    depositDetails,
    finalPaymentDetails,
    outstandingDetails,
    pendingDepositDetails,
  };
}

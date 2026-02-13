// TYPE UPDATES NEEDED FOR EMAIL SYSTEM
// Add these interfaces to app/types/index.ts

/**
 * Email tracking interface
 * Records when estimates/invoices were sent via email
 */
export interface EmailSentRecord {
  timestamp: string;        // ISO datetime string
  recipientEmail: string;   // Email address it was sent to
  resendId?: string;        // Resend email ID for tracking
}

/**
 * Estimate approval interface
 * Records client response to estimate
 */
export interface EstimateApproval {
  status: 'approve' | 'approve_with_changes' | 'decline';
  comment?: string;         // Optional comment from client
  timestamp: string;        // ISO datetime string when response was submitted
}

/**
 * Add these optional fields to the existing Project interface:
 */
export interface Project {
  // ... existing fields ...
  
  // Email tracking
  estimateEmailSent?: EmailSentRecord;  // When estimate was emailed
  invoiceEmailSent?: EmailSentRecord;   // When invoice was emailed
  
  // Client approval
  estimateApproval?: EstimateApproval;  // Client's response to estimate
  
  // ... rest of existing fields ...
}

/**
 * EXAMPLE USAGE:
 * 
 * After sending an estimate:
 * project.estimateEmailSent = {
 *   timestamp: '2026-02-08T10:30:00.000Z',
 *   recipientEmail: 'client@example.com',
 *   resendId: 're_abc123xyz'
 * }
 * 
 * After client approves:
 * project.estimateApproval = {
 *   status: 'approve_with_changes',
 *   comment: 'Can we use blue thread instead of white?',
 *   timestamp: '2026-02-08T14:45:00.000Z'
 * }
 */

// app/lib/email/estimate-template.ts
// HTML email template for sending estimates to clients

import { emailStyles, formatCurrency, formatDate } from './shared-styles';
import { Project, Settings } from '@/app/types';

interface EstimateEmailData {
  project: Project;
  settings: Settings;
  estimateNumber: string;
  approvalUrl: string;
}

export function generateEstimateEmail(data: EstimateEmailData): string {
  const { project, settings, estimateNumber, approvalUrl } = data;
  const client = project.client;
  const pricing = project.pricing;

  // Calculate totals
  const subtotal = pricing.subtotal || 0;
  const discount = pricing.discount || 0;
  const taxAmount = pricing.taxAmount || 0;
  const total = pricing.total || 0;

  // Build service description
  const serviceType = pricing.quiltingType === 'custom' 
    ? `Custom Rate ($${pricing.customRate?.toFixed(2)}/sq in)`
    : pricing.quiltingType;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estimate ${estimateNumber}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="${emailStyles.container}">
    
    <!-- Header -->
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">StitchQueue</h1>
      <p style="${emailStyles.headerSubtitle}">${settings.businessName}</p>
    </div>

    <!-- Main Content -->
    <div style="${emailStyles.content}">
      
      <!-- Greeting -->
      <p style="${emailStyles.greeting}">Hi ${client.firstName},</p>
      
      <p style="${emailStyles.paragraph}">
        Thank you for considering ${settings.businessName} for your quilting project! 
        I'm excited to work with you on this beautiful quilt.
      </p>

      <p style="${emailStyles.paragraph}">
        Below is estimate <strong>#${estimateNumber}</strong> for your project:
      </p>

      <!-- Project Details -->
      <div style="${emailStyles.detailBox}">
        <p style="${emailStyles.detailLabel}">Client</p>
        <p style="${emailStyles.detailValue}">
          ${client.firstName} ${client.lastName}<br>
          ${client.email}${client.phone ? `<br>${client.phone}` : ''}
        </p>

        <p style="${emailStyles.detailLabel}">Quilt Details</p>
        <p style="${emailStyles.detailValue}">
          ${project.width}" × ${project.length}" (${(project.width * project.length / 144).toFixed(1)} sq ft)<br>
          Service: ${serviceType}
          ${pricing.batting ? `<br>Batting: ${pricing.batting}` : ''}
          ${pricing.binding ? `<br>Binding: ${pricing.binding}` : ''}
        </p>

        ${project.dueDate ? `
        <p style="${emailStyles.detailLabel}">Due Date</p>
        <p style="${emailStyles.detailValueLast}">${formatDate(project.dueDate)}</p>
        ` : ''}
      </div>

      <!-- Pricing Breakdown -->
      <div style="${emailStyles.priceBox}">
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Quilting (${(project.width * project.length).toFixed(0)} sq in)</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(pricing.quiltingCharge || 0)}</span>
        </div>

        ${pricing.battingCharge ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Batting</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(pricing.battingCharge)}</span>
        </div>
        ` : ''}

        ${pricing.bindingCharge ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Binding</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(pricing.bindingCharge)}</span>
        </div>
        ` : ''}

        ${pricing.bobbinCharge ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Thread/Bobbin</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(pricing.bobbinCharge)}</span>
        </div>
        ` : ''}

        ${pricing.extraCharges && pricing.extraCharges.length > 0 ? 
          pricing.extraCharges.map(charge => `
            <div style="${emailStyles.priceRow}">
              <span style="${emailStyles.priceLabel}">${charge.description}</span>
              <span style="${emailStyles.priceValue}">${formatCurrency(charge.amount)}</span>
            </div>
          `).join('') 
        : ''}

        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Subtotal</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(subtotal)}</span>
        </div>

        ${discount > 0 ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Discount</span>
          <span style="${emailStyles.priceValue}; color: #10b981;">-${formatCurrency(discount)}</span>
        </div>
        ` : ''}

        ${taxAmount > 0 ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Tax</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(taxAmount)}</span>
        </div>
        ` : ''}

        <div style="${emailStyles.totalRow}">
          <span style="${emailStyles.totalLabel}">Total</span>
          <span style="${emailStyles.totalValue}">${formatCurrency(total)}</span>
        </div>

        ${pricing.deposit ? `
        <div style="${emailStyles.priceRow}; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e5e5;">
          <span style="${emailStyles.priceLabel}">Deposit ${pricing.depositType === 'percentage' ? `(${pricing.depositPercentage}%)` : ''}</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(pricing.deposit)}</span>
        </div>
        ` : ''}
      </div>

      <!-- PDF Attachment Note -->
      <div style="${emailStyles.note}">
        <strong>📎 PDF Attached:</strong> A detailed PDF copy of this estimate is attached for your records.
      </div>

      <hr style="${emailStyles.divider}">

      <!-- Approval Buttons -->
      <p style="${emailStyles.paragraph}; text-align: center; font-size: 18px; font-weight: 500;">
        Please review this estimate and let me know how you'd like to proceed:
      </p>

      <div style="${emailStyles.buttonContainer}">
        <a href="${approvalUrl}?response=approve" style="${emailStyles.buttonSuccess}">
          ✓ Approve Estimate
        </a>
        <a href="${approvalUrl}?response=approve_with_changes" style="${emailStyles.buttonWarning}">
          ⚠ Approve with Changes
        </a>
        <a href="${approvalUrl}?response=decline" style="${emailStyles.buttonDanger}">
          ✗ Decline
        </a>
      </div>

      <p style="${emailStyles.paragraph}; text-align: center; font-size: 14px; color: #666666;">
        Clicking a button will take you to a page where you can add any comments or questions.
      </p>

      <hr style="${emailStyles.divider}">

      <!-- Contact Info -->
      <p style="${emailStyles.paragraph}">
        If you have any questions, please don't hesitate to reply to this email or contact me:
      </p>

      <p style="${emailStyles.paragraph}">
        ${settings.businessName}<br>
        ${settings.email}${settings.phone ? `<br>${settings.phone}` : ''}<br>
        ${settings.address ? `${settings.address}<br>` : ''}
        ${settings.city && settings.state ? `${settings.city}, ${settings.state} ${settings.postalCode || ''}` : ''}
      </p>

      <p style="${emailStyles.paragraph}">
        I look forward to working with you!
      </p>

      <p style="${emailStyles.paragraph}">
        Best regards,<br>
        ${settings.businessName}
      </p>

    </div>

    <!-- Footer -->
    <div style="${emailStyles.footer}">
      <p style="${emailStyles.footerText}">
        This estimate was sent via <strong>StitchQueue</strong>
      </p>
      <p style="${emailStyles.footerText}">
        Professional business management for longarm quilters
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

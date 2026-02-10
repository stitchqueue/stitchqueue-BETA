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
  
  // Extract data from project (actual structure)
  const clientName = `${project.clientFirstName} ${project.clientLastName}`;
  const estimate = project.estimateData || {};
  
  // Calculate totals (subtotal only - no tax/payment per new workflow positioning)
  const subtotal = estimate.subtotal || 0;
  const discountAmount = estimate.discountAmount || 0;
  const total = subtotal - discountAmount; // Show net amount (no tax)

  // Build service description
  let serviceType = estimate.quiltingType || project.quiltingType || 'Custom Quilting';
  if (project.customQuiltingRate) {
    serviceType = `Custom Rate ($${project.customQuiltingRate.toFixed(2)}/sq in)`;
  }

  // Format address
  const clientAddress = [
    project.clientStreet,
    project.clientCity && project.clientState ? `${project.clientCity}, ${project.clientState}` : null,
    project.clientPostalCode,
  ].filter(Boolean).join('<br>');

  const businessAddress = [
    settings.street,
    settings.city && settings.state ? `${settings.city}, ${settings.state}` : null,
    settings.postalCode,
  ].filter(Boolean).join('<br>');

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
      <p style="${emailStyles.headerSubtitle}">${settings.businessName || 'Professional Quilting Services'}</p>
    </div>

    <!-- Main Content -->
    <div style="${emailStyles.content}">
      
      <!-- Greeting -->
      <p style="${emailStyles.greeting}">Hi ${project.clientFirstName},</p>
      
      <p style="${emailStyles.paragraph}">
        Thank you for considering ${settings.businessName || 'us'} for your quilting project! 
        I'm excited to work with you on this beautiful quilt.
      </p>

      <p style="${emailStyles.paragraph}">
        Below is estimate <strong>#${estimateNumber}</strong> for your project:
      </p>

      <!-- Project Details -->
      <div style="${emailStyles.detailBox}">
        <p style="${emailStyles.detailLabel}">Client</p>
        <p style="${emailStyles.detailValue}">
          ${clientName}<br>
          ${project.clientEmail || ''}${project.clientPhone ? `<br>${project.clientPhone}` : ''}
          ${clientAddress ? `<br>${clientAddress}` : ''}
        </p>

        <p style="${emailStyles.detailLabel}">Quilt Details</p>
        <p style="${emailStyles.detailValue}">
          ${project.quiltWidth}" × ${project.quiltLength}" (${((project.quiltWidth || 0) * (project.quiltLength || 0) / 144).toFixed(1)} sq ft)<br>
          Service: ${serviceType}
          ${estimate.battingTotal ? `<br>Batting: ${project.battingChoice || 'Custom'}` : ''}
          ${estimate.bindingTotal ? `<br>Binding: ${project.bindingType || 'Binding'}` : ''}
        </p>

        ${project.dueDate ? `
        <p style="${emailStyles.detailLabel}">Due Date</p>
        <p style="${emailStyles.detailValueLast}">${formatDate(project.dueDate)}</p>
        ` : ''}
      </div>

      <!-- Pricing Breakdown -->
      <div style="${emailStyles.priceBox}">
        ${estimate.quiltingTotal ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Quilting (${estimate.quiltArea || 0} sq in @ $${estimate.quiltingRate?.toFixed(2) || '0.00'}/sq in)</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(estimate.quiltingTotal)}</span>
        </div>
        ` : ''}

        ${estimate.battingTotal ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Batting (${estimate.battingLengthNeeded || 0}" @ ${project.battingChoice || 'Custom'})</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(estimate.battingTotal)}</span>
        </div>
        ` : ''}

        ${estimate.bindingTotal ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Binding (${estimate.bindingPerimeter || 0}" @ $${estimate.bindingRatePerInch?.toFixed(2) || '0.00'}/in)</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(estimate.bindingTotal)}</span>
        </div>
        ` : ''}

        ${estimate.bobbinTotal ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Thread/Bobbin ${estimate.bobbinName ? `(${estimate.bobbinName})` : ''}</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(estimate.bobbinTotal)}</span>
        </div>
        ` : ''}

        ${estimate.extraCharges && estimate.extraCharges.length > 0 ? 
          estimate.extraCharges.map((charge: any) => `
            <div style="${emailStyles.priceRow}">
              <span style="${emailStyles.priceLabel}">${charge.name}</span>
              <span style="${emailStyles.priceValue}">${formatCurrency(charge.amount)}</span>
            </div>
          `).join('') 
        : ''}

        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Subtotal</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(subtotal)}</span>
        </div>

        ${discountAmount > 0 ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Discount ${estimate.discountType === 'percentage' ? `(${estimate.discountValue}%)` : ''}</span>
          <span style="${emailStyles.priceValue}; color: #10b981;">-${formatCurrency(discountAmount)}</span>
        </div>
        ` : ''}

        <div style="${emailStyles.totalRow}">
          <span style="${emailStyles.totalLabel}">Total</span>
          <span style="${emailStyles.totalValue}">${formatCurrency(total)}</span>
        </div>
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
        ${settings.businessName || 'StitchQueue'}<br>
        ${settings.email || ''}${settings.phone ? `<br>${settings.phone}` : ''}<br>
        ${businessAddress ? `${businessAddress}` : ''}
      </p>

      <p style="${emailStyles.paragraph}">
        I look forward to working with you!
      </p>

      <p style="${emailStyles.paragraph}">
        Best regards,<br>
        ${settings.businessName || 'StitchQueue'}
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
// app/lib/email/invoice-template.ts
// HTML email template for sending invoices to clients

import { emailStyles, formatCurrency, formatDate } from './shared-styles';
import { Project, Settings } from '@/app/types';

interface InvoiceEmailData {
  project: Project;
  settings: Settings;
  invoiceNumber: string;
}

export function generateInvoiceEmail(data: InvoiceEmailData): string {
  const { project, settings, invoiceNumber } = data;
  
  // Extract data from project (actual structure)
  const clientName = `${project.clientFirstName} ${project.clientLastName}`;
  const estimate = project.estimateData || {};
  
  // Calculate amounts (no tax/payment tracking per new workflow positioning)
  const subtotal = estimate.subtotal || 0;
  const discountAmount = estimate.discountAmount || 0;
  const total = subtotal - discountAmount; // Show net amount (no tax)

  // Determine invoice type
  const isGift = project.invoiceType === 'gift';
  const isCharitable = project.invoiceType === 'charitable';

  // Build service description
  let serviceType = estimate.quiltingType || project.quiltingType || 'Custom Quilting';
  if (project.customQuiltingRate) {
    serviceType = `Custom Rate ($${project.customQuiltingRate.toFixed(2)}/sq in)`;
  }

  // Format addresses
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
  <title>Invoice ${invoiceNumber}</title>
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
      
      ${isGift ? `
        <p style="${emailStyles.paragraph}">
          Your beautiful quilt is complete! This invoice shows the work performed as a gift.
        </p>
      ` : isCharitable ? `
        <p style="${emailStyles.paragraph}">
          Your quilt is ready for pickup! This invoice includes information for your charitable donation records.
        </p>
      ` : `
        <p style="${emailStyles.paragraph}">
          Great news! Your quilt is ready for pickup. Below is invoice <strong>#${invoiceNumber}</strong> for your project.
        </p>
      `}

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

        ${project.updatedAt ? `
        <p style="${emailStyles.detailLabel}">Completion Date</p>
        <p style="${emailStyles.detailValueLast}">${formatDate(project.updatedAt)}</p>
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
          <span style="${emailStyles.totalLabel}">${isGift ? 'Gift Value' : 'Total'}</span>
          <span style="${emailStyles.totalValue}">${formatCurrency(total)}</span>
        </div>

        ${isGift ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e5e5;">
          <div style="${emailStyles.priceRow}; font-size: 18px; font-weight: bold; color: #10b981;">
            <span>Gift Invoice</span>
            <span>No Payment Due</span>
          </div>
        </div>
        ` : ''}
      </div>

      ${isCharitable ? `
      <!-- Charitable Donation Note -->
      <div style="${emailStyles.note}">
        <strong>📋 Charitable Donation Record:</strong><br>
        This invoice serves as a record of your charitable contribution. Please consult with your tax advisor regarding deductibility of materials and services.
      </div>
      ` : ''}

      <!-- PDF Attachment Note -->
      <div style="${emailStyles.note}">
        <strong>📎 PDF Attached:</strong> A detailed PDF copy of this invoice is attached for your records.
      </div>

      ${!isGift ? `
      <hr style="${emailStyles.divider}">
      
      <p style="${emailStyles.paragraph}; text-align: center; font-size: 16px;">
        For payment details and methods, please contact ${settings.businessName || 'us'} directly.
      </p>
      ` : ''}

      <hr style="${emailStyles.divider}">

      <!-- Contact Info -->
      <p style="${emailStyles.paragraph}">
        ${isGift ? 
          "Thank you for allowing me to contribute to this special gift! If you have any questions, please don't hesitate to contact me:" :
          "If you have any questions about this invoice, please don't hesitate to reply to this email or contact me:"
        }
      </p>

      <p style="${emailStyles.paragraph}">
        ${settings.businessName || 'StitchQueue'}<br>
        ${settings.email || ''}${settings.phone ? `<br>${settings.phone}` : ''}<br>
        ${businessAddress ? `${businessAddress}` : ''}
      </p>

      <p style="${emailStyles.paragraph}">
        Thank you for your business!
      </p>

      <p style="${emailStyles.paragraph}">
        Best regards,<br>
        ${settings.businessName || 'StitchQueue'}
      </p>

    </div>

    <!-- Footer -->
    <div style="${emailStyles.footer}">
      <p style="${emailStyles.footerText}">
        This invoice was sent via <strong>StitchQueue</strong>
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
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
  const client = project.client;
  const pricing = project.pricing;
  const payments = project.payments || {};

  // Calculate amounts
  const total = pricing.total || 0;
  const depositPaid = payments.depositAmount || 0;
  const finalPaymentAmount = payments.finalPaymentAmount || 0;
  const totalPaid = depositPaid + finalPaymentAmount;
  const balanceDue = total - totalPaid;

  // Determine invoice type
  const isGift = project.invoiceType === 'gift';
  const isCharitable = project.invoiceType === 'charitable';

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
  <title>Invoice ${invoiceNumber}</title>
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
      
      ${isGift ? `
        <p style="${emailStyles.paragraph}">
          Your beautiful quilt is complete! This invoice shows the work performed as a gift.
        </p>
      ` : isCharitable ? `
        <p style="${emailStyles.paragraph}">
          Your quilt is ready for pickup! This invoice includes tax-deductible information for your charitable donation.
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

        ${project.completedDate ? `
        <p style="${emailStyles.detailLabel}">Completion Date</p>
        <p style="${emailStyles.detailValueLast}">${formatDate(project.completedDate)}</p>
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

        ${isCharitable && project.mileage ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Mileage (${project.mileage} miles @ $0.67/mi)</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(project.mileage * 0.67)}</span>
        </div>
        ` : ''}

        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Subtotal</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(pricing.subtotal || 0)}</span>
        </div>

        ${pricing.discount && pricing.discount > 0 ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Discount</span>
          <span style="${emailStyles.priceValue}; color: #10b981;">-${formatCurrency(pricing.discount)}</span>
        </div>
        ` : ''}

        ${pricing.taxAmount && pricing.taxAmount > 0 ? `
        <div style="${emailStyles.priceRow}">
          <span style="${emailStyles.priceLabel}">Tax</span>
          <span style="${emailStyles.priceValue}">${formatCurrency(pricing.taxAmount)}</span>
        </div>
        ` : ''}

        <div style="${emailStyles.totalRow}">
          <span style="${emailStyles.totalLabel}">Total</span>
          <span style="${emailStyles.totalValue}">${formatCurrency(total)}</span>
        </div>

        ${!isGift ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e5e5;">
          ${depositPaid > 0 ? `
          <div style="${emailStyles.priceRow}">
            <span style="${emailStyles.priceLabel}">Deposit Paid</span>
            <span style="${emailStyles.priceValue}; color: #10b981;">${formatCurrency(depositPaid)}</span>
          </div>
          ` : ''}
          
          ${finalPaymentAmount > 0 ? `
          <div style="${emailStyles.priceRow}">
            <span style="${emailStyles.priceLabel}">Final Payment</span>
            <span style="${emailStyles.priceValue}; color: #10b981;">${formatCurrency(finalPaymentAmount)}</span>
          </div>
          ` : ''}

          <div style="${emailStyles.priceRow}; font-size: 18px; font-weight: bold; color: ${balanceDue > 0 ? '#ef4444' : '#10b981'};">
            <span>Balance Due</span>
            <span>${formatCurrency(balanceDue)}</span>
          </div>
        </div>
        ` : `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e5e5;">
          <div style="${emailStyles.priceRow}; font-size: 18px; font-weight: bold; color: #10b981;">
            <span>Gift Invoice</span>
            <span>No Payment Due</span>
          </div>
        </div>
        `}
      </div>

      ${isCharitable ? `
      <!-- Tax Deductible Information -->
      <div style="${emailStyles.note}">
        <strong>📋 Tax-Deductible Information:</strong><br>
        For your charitable contribution, the following amounts may be tax-deductible:<br>
        <ul style="margin: 10px 0 0 20px; padding: 0;">
          <li>Materials: ${formatCurrency(pricing.battingCharge || 0)}</li>
          ${project.mileage ? `<li>Mileage: ${formatCurrency(project.mileage * 0.67)}</li>` : ''}
          <li style="color: #92400e;">Services are NOT tax-deductible per IRS guidelines</li>
        </ul>
        Please consult with your tax advisor for guidance.
      </div>
      ` : ''}

      <!-- PDF Attachment Note -->
      <div style="${emailStyles.note}">
        <strong>📎 PDF Attached:</strong> A detailed PDF copy of this invoice is attached for your records.
      </div>

      ${!isGift && balanceDue > 0 ? `
      <hr style="${emailStyles.divider}">
      
      <p style="${emailStyles.paragraph}; text-align: center; font-size: 18px; font-weight: 500;">
        Payment Methods Accepted:
      </p>
      
      <p style="${emailStyles.paragraph}; text-align: center;">
        Cash • Check • Venmo • PayPal • Zelle • Square • Credit Card
      </p>

      <p style="${emailStyles.paragraph}; text-align: center; color: #666666;">
        Please remit payment at your earliest convenience.
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
        ${settings.businessName}<br>
        ${settings.email}${settings.phone ? `<br>${settings.phone}` : ''}<br>
        ${settings.address ? `${settings.address}<br>` : ''}
        ${settings.city && settings.state ? `${settings.city}, ${settings.state} ${settings.postalCode || ''}` : ''}
      </p>

      <p style="${emailStyles.paragraph}">
        Thank you for your business!
      </p>

      <p style="${emailStyles.paragraph}">
        Best regards,<br>
        ${settings.businessName}
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

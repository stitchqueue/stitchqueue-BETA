// app/lib/email/pdf-generator.ts
// Generate PDF attachments for estimates

import { Project, Settings } from '@/app/types';

/**
 * Generate estimate PDF content as base64
 * Note: Invoice PDFs are not generated via email - invoices are reference documents
 * for quilters to use in their accounting software (QuickBooks/Xero)
 */
export async function generateEstimatePDF(
  project: Project,
  settings: Settings,
  estimateNumber: string
): Promise<Buffer> {
  // For now, we'll return a simple text-based PDF
  // In production, you might want to use a library like jsPDF or puppeteer
  // to create a proper PDF from HTML
  
  const estimate = project.estimateData || {};
  const clientName = `${project.clientFirstName} ${project.clientLastName}`;
  
  // Calculate amounts (no tax/payment per new workflow positioning)
  const subtotal = estimate.subtotal || 0;
  const discountAmount = estimate.discountAmount || 0;
  const total = subtotal - discountAmount;

  // Format addresses
  const clientAddress = [
    project.clientStreet,
    project.clientCity && project.clientState ? `${project.clientCity}, ${project.clientState} ${project.clientPostalCode || ''}` : null,
  ].filter(Boolean).join('\n');

  const businessAddress = [
    settings.street,
    settings.city && settings.state ? `${settings.city}, ${settings.state} ${settings.postalCode || ''}` : null,
  ].filter(Boolean).join('\n');

  // Build service type description
  let serviceType = estimate.quiltingType || project.quiltingType || 'Custom Quilting';
  if (project.customQuiltingRate) {
    serviceType = `Custom Rate ($${project.customQuiltingRate.toFixed(2)}/sq in)`;
  }

  const content = `
ESTIMATE #${estimateNumber}

${settings.businessName || 'StitchQueue'}
${settings.email || ''}
${settings.phone || ''}
${businessAddress}

---

CLIENT:
${clientName}
${project.clientEmail || ''}
${project.clientPhone || ''}
${clientAddress}

---

PROJECT DETAILS:
Dimensions: ${project.quiltWidth}" × ${project.quiltLength}" (${((project.quiltWidth || 0) * (project.quiltLength || 0) / 144).toFixed(1)} sq ft)
Service: ${serviceType}
${estimate.battingTotal ? `Batting: ${project.battingChoice || 'Custom'}` : ''}
${estimate.bindingTotal ? `Binding: ${project.bindingType || 'Binding'}` : ''}
${project.dueDate ? `Due Date: ${new Date(project.dueDate).toLocaleDateString()}` : ''}
${project.description ? `Description: ${project.description}` : ''}

---

PRICING:
${estimate.quiltingTotal ? `Quilting (${estimate.quiltArea || 0} sq in @ $${(estimate.quiltingRate || 0).toFixed(2)}/sq in): $${estimate.quiltingTotal.toFixed(2)}` : ''}
${estimate.battingTotal ? `Batting (${estimate.battingLengthNeeded || 0}" @ ${project.battingChoice || 'Custom'}): $${estimate.battingTotal.toFixed(2)}` : ''}
${estimate.bindingTotal ? `Binding (${estimate.bindingPerimeter || 0}" @ $${(estimate.bindingRatePerInch || 0).toFixed(2)}/in): $${estimate.bindingTotal.toFixed(2)}` : ''}
${estimate.bobbinTotal ? `Thread/Bobbin${estimate.bobbinName ? ` (${estimate.bobbinName})` : ''}: $${estimate.bobbinTotal.toFixed(2)}` : ''}
${estimate.extraCharges?.map((c: any) => `${c.name}: $${c.amount.toFixed(2)}`).join('\n') || ''}

Subtotal: $${subtotal.toFixed(2)}
${discountAmount > 0 ? `Discount${estimate.discountType === 'percentage' ? ` (${estimate.discountValue}%)` : ''}: -$${discountAmount.toFixed(2)}` : ''}

TOTAL: $${total.toFixed(2)}

---

APPROVAL INSTRUCTIONS:
Please review this estimate and respond via the link in the email to:
• Approve the estimate
• Request changes
• Decline

---

Thank you for considering ${settings.businessName || 'us'} for your quilting project!

${settings.businessName || 'StitchQueue'}
  `.trim();

  // Return as Buffer (API expects Buffer, not base64 string)
  return Buffer.from(content);
}

/**
 * @deprecated Invoice PDFs are not sent via email
 * Invoices serve as reference documents for accounting software only
 * This function is kept for backwards compatibility but should not be called
 */
export async function generateInvoicePDF(
  project: Project,
  settings: Settings,
  invoiceNumber: string
): Promise<Buffer> {
  console.warn('generateInvoicePDF is deprecated - invoices are not sent via email');
  return Buffer.from('Invoice PDFs are not generated for email');
}
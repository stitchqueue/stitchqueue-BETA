// app/lib/email/pdf-generator.ts
// Generate PDF attachments for estimates and invoices

import { Project, Settings } from '@/app/types';

/**
 * Generate estimate PDF content as base64
 * This uses the same layout as the print version from the app
 */
export async function generateEstimatePDF(
  project: Project,
  settings: Settings,
  estimateNumber: string
): Promise<string> {
  // For now, we'll return a simple text-based PDF
  // In production, you might want to use a library like jsPDF or puppeteer
  // to create a proper PDF from HTML
  
  const client = project.client;
  const pricing = project.pricing;

  const content = `
ESTIMATE #${estimateNumber}

${settings.businessName}
${settings.email}
${settings.phone || ''}
${settings.address || ''}
${settings.city && settings.state ? `${settings.city}, ${settings.state} ${settings.postalCode || ''}` : ''}

---

CLIENT:
${client.firstName} ${client.lastName}
${client.email}
${client.phone || ''}
${client.address || ''}
${client.city && client.state ? `${client.city}, ${client.state} ${client.postalCode || ''}` : ''}

---

PROJECT DETAILS:
Dimensions: ${project.width}" × ${project.length}" (${(project.width * project.length / 144).toFixed(1)} sq ft)
Service: ${pricing.quiltingType === 'custom' ? `Custom Rate ($${pricing.customRate?.toFixed(2)}/sq in)` : pricing.quiltingType}
${pricing.batting ? `Batting: ${pricing.batting}` : ''}
${pricing.binding ? `Binding: ${pricing.binding}` : ''}
${project.dueDate ? `Due Date: ${new Date(project.dueDate).toLocaleDateString()}` : ''}

---

PRICING:
Quilting (${(project.width * project.length).toFixed(0)} sq in): $${(pricing.quiltingCharge || 0).toFixed(2)}
${pricing.battingCharge ? `Batting: $${pricing.battingCharge.toFixed(2)}` : ''}
${pricing.bindingCharge ? `Binding: $${pricing.bindingCharge.toFixed(2)}` : ''}
${pricing.bobbinCharge ? `Thread/Bobbin: $${pricing.bobbinCharge.toFixed(2)}` : ''}
${pricing.extraCharges?.map(c => `${c.description}: $${c.amount.toFixed(2)}`).join('\n') || ''}

Subtotal: $${(pricing.subtotal || 0).toFixed(2)}
${pricing.discount ? `Discount: -$${pricing.discount.toFixed(2)}` : ''}
${pricing.taxAmount ? `Tax: $${pricing.taxAmount.toFixed(2)}` : ''}

TOTAL: $${(pricing.total || 0).toFixed(2)}
${pricing.deposit ? `Deposit ${pricing.depositType === 'percentage' ? `(${pricing.depositPercentage}%)` : ''}: $${pricing.deposit.toFixed(2)}` : ''}

---

Thank you for your business!
${settings.businessName}
  `.trim();

  // Convert to base64
  return Buffer.from(content).toString('base64');
}

/**
 * Generate invoice PDF content as base64
 */
export async function generateInvoicePDF(
  project: Project,
  settings: Settings,
  invoiceNumber: string
): Promise<string> {
  const client = project.client;
  const pricing = project.pricing;
  const payments = project.payments || {};

  const total = pricing.total || 0;
  const depositPaid = payments.depositAmount || 0;
  const finalPaymentAmount = payments.finalPaymentAmount || 0;
  const totalPaid = depositPaid + finalPaymentAmount;
  const balanceDue = total - totalPaid;

  const isGift = project.invoiceType === 'gift';
  const isCharitable = project.invoiceType === 'charitable';

  const content = `
INVOICE #${invoiceNumber}

${settings.businessName}
${settings.email}
${settings.phone || ''}
${settings.address || ''}
${settings.city && settings.state ? `${settings.city}, ${settings.state} ${settings.postalCode || ''}` : ''}

---

${isGift ? 'GIFT INVOICE' : isCharitable ? 'CHARITABLE INVOICE' : 'INVOICE'}

CLIENT:
${client.firstName} ${client.lastName}
${client.email}
${client.phone || ''}
${client.address || ''}
${client.city && client.state ? `${client.city}, ${client.state} ${client.postalCode || ''}` : ''}

---

PROJECT DETAILS:
Dimensions: ${project.width}" × ${project.length}" (${(project.width * project.length / 144).toFixed(1)} sq ft)
Service: ${pricing.quiltingType === 'custom' ? `Custom Rate ($${pricing.customRate?.toFixed(2)}/sq in)` : pricing.quiltingType}
${pricing.batting ? `Batting: ${pricing.batting}` : ''}
${pricing.binding ? `Binding: ${pricing.binding}` : ''}
${project.completedDate ? `Completion Date: ${new Date(project.completedDate).toLocaleDateString()}` : ''}

---

PRICING:
Quilting (${(project.width * project.length).toFixed(0)} sq in): $${(pricing.quiltingCharge || 0).toFixed(2)}
${pricing.battingCharge ? `Batting: $${pricing.battingCharge.toFixed(2)}` : ''}
${pricing.bindingCharge ? `Binding: $${pricing.bindingCharge.toFixed(2)}` : ''}
${pricing.bobbinCharge ? `Thread/Bobbin: $${pricing.bobbinCharge.toFixed(2)}` : ''}
${pricing.extraCharges?.map(c => `${c.description}: $${c.amount.toFixed(2)}`).join('\n') || ''}
${isCharitable && project.mileage ? `Mileage (${project.mileage} miles @ $0.67/mi): $${(project.mileage * 0.67).toFixed(2)}` : ''}

Subtotal: $${(pricing.subtotal || 0).toFixed(2)}
${pricing.discount ? `Discount: -$${pricing.discount.toFixed(2)}` : ''}
${pricing.taxAmount ? `Tax: $${pricing.taxAmount.toFixed(2)}` : ''}

TOTAL: $${total.toFixed(2)}

${!isGift ? `
${depositPaid > 0 ? `Deposit Paid: $${depositPaid.toFixed(2)}` : ''}
${finalPaymentAmount > 0 ? `Final Payment: $${finalPaymentAmount.toFixed(2)}` : ''}

BALANCE DUE: $${balanceDue.toFixed(2)}
` : 'GIFT INVOICE - NO PAYMENT DUE'}

${isCharitable ? `
---
TAX-DEDUCTIBLE INFORMATION:
Materials: $${(pricing.battingCharge || 0).toFixed(2)}
${project.mileage ? `Mileage: $${(project.mileage * 0.67).toFixed(2)}` : ''}
Services are NOT tax-deductible per IRS guidelines.
Please consult with your tax advisor.
` : ''}

---

Thank you for your business!
${settings.businessName}
  `.trim();

  // Convert to base64
  return Buffer.from(content).toString('base64');
}

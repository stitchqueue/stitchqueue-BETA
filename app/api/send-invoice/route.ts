import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { mapProjectFromDb, mapSettingsFromDb } from '@/app/lib/storage/mappers';
import { generateInvoiceEmail, generateInvoicePDF } from '@/app/lib/email';
import { requireAuth, isAuthError } from '@/app/lib/auth-guard';
import { createServiceRoleClient } from '@/app/lib/supabase-server';

const resend = new Resend(process.env.RESEND_API_KEY);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    // Authenticate the caller
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { projectId } = await request.json();

    if (!projectId || typeof projectId !== 'string' || !UUID_RE.test(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Use service role for data fetches (needs org settings for email templates)
    const serviceClient = createServiceRoleClient();

    // Get project — scoped to the caller's organization
    const { data: dbProject, error: projectError } = await serviceClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('organization_id', auth.organizationId)
      .single();

    if (projectError || !dbProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get organization settings
    const { data: dbOrg, error: orgError } = await serviceClient
      .from('organizations')
      .select('*')
      .eq('id', auth.organizationId)
      .single();

    if (orgError || !dbOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check PRO tier
    if (dbOrg.subscription_tier !== 'pro') {
      return NextResponse.json({ error: 'Email sending requires PRO tier' }, { status: 403 });
    }

    // Map to TypeScript types
    const project = mapProjectFromDb(dbProject);
    const settings = mapSettingsFromDb(dbOrg);

    if (!project.clientEmail) {
      return NextResponse.json({ error: 'Client email address is required' }, { status: 400 });
    }

    const invoiceNumber = String(project.estimateNumber || 'TBD');

    const emailHtml = generateInvoiceEmail({ project, settings, invoiceNumber });
    const pdfBuffer = await generateInvoicePDF(project, settings, invoiceNumber);

    // Send via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'noreply@stitchqueue.com',
      to: project.clientEmail,
      replyTo: settings.email || 'noreply@stitchqueue.com',
      subject: `Invoice #${invoiceNumber} from ${settings.businessName || 'StitchQueue'}`,
      html: emailHtml,
      attachments: [{ filename: `Invoice-${invoiceNumber}.pdf`, content: pdfBuffer }],
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Update project with email tracking
    await serviceClient
      .from('projects')
      .update({
        invoice_email_sent: {
          timestamp: new Date().toISOString(),
          recipientEmail: project.clientEmail,
          resendId: emailData?.id || null,
        }
      })
      .eq('id', projectId)
      .eq('organization_id', auth.organizationId);

    return NextResponse.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

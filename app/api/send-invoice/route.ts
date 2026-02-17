import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateInvoiceEmail, generateInvoicePDF } from '@/app/lib/email';
import { requireAuth, isAuthError } from '@/app/lib/auth-guard';
import { createServiceRoleClient } from '@/app/lib/supabase-server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Authenticate the caller
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Use service role for data fetches
    const serviceClient = createServiceRoleClient();

    // Get project — scoped to the caller's organization
    const { data: project, error: projectError } = await serviceClient
      .from('projects')
      .select('id, name, email, subscription_tier')
      .eq('id', projectId)
      .eq('organization_id', auth.organizationId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: org, error: orgError } = await serviceClient
      .from('organizations')
      .select('id, name, email, subscription_tier')
      .eq('id', project.organization_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (org.subscription_tier !== 'pro') {
      return NextResponse.json({ error: 'Email sending requires PRO tier' }, { status: 403 });
    }

    const projectData = project.data as any;
    const clientEmail = projectData.clientEmail;

    if (!clientEmail) {
      return NextResponse.json({ error: 'Client email address is required' }, { status: 400 });
    }

    const emailHtml = generateInvoiceEmail(projectData, org);
    const pdfBuffer = generateInvoicePDF(projectData, org);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'noreply@stitchqueue.com',
      to: clientEmail,
      replyTo: org.email || 'noreply@stitchqueue.com',
      subject: `Invoice #${projectData.estimateNumber || 'TBD'} from ${org.businessName || 'StitchQueue'}`,
      html: emailHtml,
      attachments: [{ filename: `Invoice-${projectData.estimateNumber || 'TBD'}.pdf`, content: pdfBuffer }],
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    const updatedData = { ...projectData, invoiceEmailSent: { timestamp: new Date().toISOString(), recipientEmail: clientEmail, resendId: emailData?.id || null } };
    await serviceClient
      .from('projects')
      .update({ data: updatedData })
      .eq('id', projectId)
      .eq('organization_id', auth.organizationId);

    return NextResponse.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

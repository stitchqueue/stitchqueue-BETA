import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { mapProjectFromDb, mapSettingsFromDb } from '@/app/lib/storage/mappers';
import { generateEstimateEmail, generateEstimatePDF } from '@/app/lib/email';
import { requireAuth, isAuthError } from '@/app/lib/auth-guard';
import { createServiceRoleClient } from '@/app/lib/supabase-server';
import { generateApprovalToken } from '@/app/lib/hmac';

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
      .eq('id', dbProject.organization_id)
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

    // Generate HMAC token for the approval URL
    const token = generateApprovalToken(projectId);
    const estimateNumber = String(project.estimateNumber || 'TBD');
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://beta.stitchqueue.com'}/approve/${project.id}?token=${token}`;

    const emailData = {
      project,
      settings,
      estimateNumber,
      approvalUrl,
    };

    const emailHtml = generateEstimateEmail(emailData);
    const pdfBuffer = await generateEstimatePDF(project, settings, estimateNumber);

    // Send via Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'noreply@stitchqueue.com',
      to: project.clientEmail,
      replyTo: settings.email || 'noreply@stitchqueue.com',
      subject: `Estimate #${estimateNumber} from ${settings.businessName || 'StitchQueue'}`,
      html: emailHtml,
      attachments: [{
        filename: `Estimate-${estimateNumber}.pdf`,
        content: pdfBuffer,
      }],
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Update project with email tracking
    await serviceClient
      .from('projects')
      .update({
        estimate_email_sent: {
          timestamp: new Date().toISOString(),
          recipientEmail: project.clientEmail,
          resendId: emailResult?.id || null,
        }
      })
      .eq('id', projectId)
      .eq('organization_id', auth.organizationId);

    return NextResponse.json({
      success: true,
      message: 'Estimate sent successfully',
    });
  } catch (error) {
    console.error('Send estimate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

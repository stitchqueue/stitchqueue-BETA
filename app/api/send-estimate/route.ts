import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { mapProjectFromDb, mapSettingsFromDb } from '@/app/lib/storage/mappers';
import { generateEstimateEmail, generateEstimatePDF } from '@/app/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get project from database
    const { data: dbProject, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !dbProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get organization settings
    const { data: dbOrg, error: orgError } = await supabase
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

    // Generate email content
    const estimateNumber = String(project.estimateNumber || 'TBD');
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://beta.stitchqueue.com'}/approve/${project.id}`;
    
    const emailData = {
      project,
      settings,
      estimateNumber,
      approvalUrl,
    };

    const emailHtml = generateEstimateEmail(emailData);
    const pdfBuffer = generateEstimatePDF(project, settings, estimateNumber);

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
      return NextResponse.json({ error: 'Failed to send email: ' + emailError.message }, { status: 500 });
    }

    // Update project with email tracking
    await supabase
      .from('projects')
      .update({
        estimate_email_sent: {
          timestamp: new Date().toISOString(),
          recipientEmail: project.clientEmail,
          resendId: emailResult?.id || null,
        }
      })
      .eq('id', projectId);

    return NextResponse.json({
      success: true,
      message: 'Estimate sent successfully',
    });
  } catch (error) {
    console.error('Send estimate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

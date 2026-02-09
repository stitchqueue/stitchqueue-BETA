import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateInvoiceEmail, generateInvoicePDF } from '@/app/lib/email';

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

    const { data: project, error: projectError } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: org, error: orgError } = await supabase.from('organizations').select('*').eq('id', project.organization_id).single();
    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (!org.isPaidTier) {
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
    await supabase.from('projects').update({ data: updatedData }).eq('id', projectId);

    return NextResponse.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

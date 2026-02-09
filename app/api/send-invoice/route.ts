// app/api/send-invoice/route.ts
// API route to send invoice emails via Resend

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/app/lib/supabase';
import { generateInvoiceEmail } from '@/app/lib/email/invoice-template';
import { generateInvoicePDF } from '@/app/lib/email/pdf-generator';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.id)
      .single();

    if (orgError || !orgData) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if user is PRO tier
    const isPro = orgData.tier === 'pro';
    if (!isPro) {
      return NextResponse.json(
        { error: 'Email sending is a PRO feature. Please upgrade to send emails.' },
        { status: 403 }
      );
    }

    // Get project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('organization_id', user.id)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projectData.data;
    const settings = {
      businessName: orgData.business_name || 'StitchQueue User',
      email: orgData.email || user.email || '',
      phone: orgData.phone,
      address: orgData.address,
      city: orgData.city,
      state: orgData.state,
      postalCode: orgData.postal_code,
      country: orgData.country,
    };

    // Validate client email
    if (!project.client?.email) {
      return NextResponse.json(
        { error: 'Client email address is required' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = project.estimateNumber || 'DRAFT';

    // Generate email HTML
    const emailHtml = generateInvoiceEmail({
      project,
      settings,
      invoiceNumber,
    });

    // Generate PDF attachment
    const pdfBase64 = await generateInvoicePDF(project, settings, invoiceNumber);

    // Determine subject line based on invoice type
    const isGift = project.invoiceType === 'gift';
    const isCharitable = project.invoiceType === 'charitable';
    
    let subject = `Invoice #${invoiceNumber} from ${settings.businessName}`;
    if (isGift) {
      subject = `Gift Invoice #${invoiceNumber} from ${settings.businessName}`;
    } else if (isCharitable) {
      subject = `Charitable Invoice #${invoiceNumber} from ${settings.businessName}`;
    }

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: 'no-reply@stitchqueue.com',
      to: project.client.email,
      replyTo: settings.email, // Replies go to quilter's email
      subject,
      html: emailHtml,
      attachments: [
        {
          filename: `StitchQueue_Invoice_${invoiceNumber}.txt`,
          content: pdfBase64,
        },
      ],
    });

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update project with email sent timestamp
    const updatedProject = {
      ...project,
      invoiceEmailSent: {
        timestamp: new Date().toISOString(),
        recipientEmail: project.client.email,
        resendId: emailResult.data?.id,
      },
    };

    const { error: updateError } = await supabase
      .from('projects')
      .update({ data: updatedProject })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project:', updateError);
      // Don't fail the request - email was sent successfully
    }

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${project.client.email}`,
      emailId: emailResult.data?.id,
    });

  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/approve-estimate/route.ts
// API route to handle client estimate approval responses
// Public endpoint — protected by HMAC token (not user session)

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/app/lib/supabase-server';
import { verifyApprovalToken } from '@/app/lib/hmac';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, response, comment, token } = body;

    // Validate inputs
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!response || !['approve', 'approve_with_changes', 'decline'].includes(response)) {
      return NextResponse.json(
        { error: 'Invalid response type' },
        { status: 400 }
      );
    }

    // Verify HMAC token — prevents unauthenticated access by UUID guessing
    if (!token || !verifyApprovalToken(projectId, token)) {
      return NextResponse.json(
        { error: 'Invalid or missing approval token' },
        { status: 403 }
      );
    }

    // Service role is appropriate here — this is a public endpoint verified by HMAC
    const supabase = createServiceRoleClient();

    // Get project from database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, estimate_approval, client_first_name, organization_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if already approved/declined
    if (project.estimate_approval) {
      return NextResponse.json(
        { error: 'This estimate has already been responded to' },
        { status: 400 }
      );
    }

    // Truncate comment to prevent oversized payloads (max 2000 chars)
    const safeComment = comment ? String(comment).slice(0, 2000) : null;

    // Prepare approval data
    const approvalData = {
      status: response,
      comment: safeComment,
      timestamp: new Date().toISOString(),
    };

    // Update project with approval response
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        estimate_approval: approvalData,
        // Move to next stage if approved
        stage: response === 'approve' ? 'in_progress' : 'estimates',
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project:', updateError);
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    // Return success with appropriate message
    let message = '';
    switch (response) {
      case 'approve':
        message = 'Thank you! Your approval has been recorded. The quilter will begin working on your project soon.';
        break;
      case 'approve_with_changes':
        message = 'Thank you! Your approval with changes has been recorded. The quilter will contact you to discuss the modifications.';
        break;
      case 'decline':
        message = 'Thank you for letting us know. Your response has been recorded.';
        break;
    }

    return NextResponse.json({
      success: true,
      message,
      response,
    });

  } catch (error) {
    console.error('Approve estimate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

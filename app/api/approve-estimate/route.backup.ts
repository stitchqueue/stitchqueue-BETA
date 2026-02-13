// app/api/approve-estimate/route.ts
// API route to handle client estimate approval responses

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, response, comment } = body;

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

    // Initialize Supabase client (no auth required - public endpoint)
    // Use existing supabase client

    // Get project (using service role to bypass RLS for public access)
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projectData.data;

    // Check if already approved/declined
    if (project.estimateApproval) {
      return NextResponse.json(
        { error: 'This estimate has already been responded to' },
        { status: 400 }
      );
    }

    // Update project with approval response
    const updatedProject = {
      ...project,
      estimateApproval: {
        status: response,
        comment: comment || null,
        timestamp: new Date().toISOString(),
      },
    };

    // Update using service role to bypass RLS
    const { error: updateError } = await supabase
      .from('projects')
      .update({ data: updatedProject })
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
        message = 'Thank you! Your approval has been recorded.';
        break;
      case 'approve_with_changes':
        message = 'Thank you! Your approval with changes has been recorded.';
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

import { NextResponse } from 'next/server';
import { createAuthenticatedClient } from './supabase-server';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthResult {
  userId: string;
  organizationId: string;
  supabase: SupabaseClient;
}

/**
 * Verifies the caller is authenticated and resolves their organization.
 * Returns { userId, organizationId, supabase } on success.
 * Returns a NextResponse error (401/403) on failure — caller should return it immediately.
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const supabase = await createAuthenticatedClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Look up organization from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.organization_id) {
    return NextResponse.json(
      { error: 'Account not linked to an organization' },
      { status: 403 }
    );
  }

  return {
    userId: user.id,
    organizationId: profile.organization_id,
    supabase,
  };
}

/** Type guard: true when requireAuth returned an error response */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

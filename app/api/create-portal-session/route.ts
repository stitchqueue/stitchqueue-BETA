import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { requireAuth, isAuthError } from '@/app/lib/auth-guard';
import { createServiceRoleClient } from '@/app/lib/supabase-server';

export async function POST() {
  try {
    // Authenticate the caller
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    // Look up their Stripe customer ID from subscriptions (server-side, never trust client)
    const serviceClient = createServiceRoleClient();
    const { data: sub } = await serviceClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', auth.userId)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?section=subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

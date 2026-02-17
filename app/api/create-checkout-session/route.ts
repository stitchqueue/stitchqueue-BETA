import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { requireAuth, isAuthError } from '@/app/lib/auth-guard';
import { createServiceRoleClient } from '@/app/lib/supabase-server';

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

export async function POST(request: NextRequest) {
  try {
    // Authenticate the caller — userId and organizationId come from session, not the body
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { priceId } = await request.json();

    // Validate priceId against known subscription prices
    if (!priceId || (priceId !== MONTHLY_PRICE_ID && priceId !== ANNUAL_PRICE_ID)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Use service role for subscription lookup (RLS may not cover subscriptions yet)
    const serviceClient = createServiceRoleClient();

    const { data: existingSub } = await serviceClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', auth.userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          user_id: auth.userId,
          organization_id: auth.organizationId,
        },
      });
      customerId = customer.id;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: auth.userId,
          organization_id: auth.organizationId,
        },
      },
      success_url: `${baseUrl}/onboarding?checkout=success`,
      cancel_url: `${baseUrl}/signup?checkout=canceled`,
      metadata: {
        user_id: auth.userId,
        organization_id: auth.organizationId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

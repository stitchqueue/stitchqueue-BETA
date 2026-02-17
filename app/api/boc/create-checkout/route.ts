import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { requireAuth, isAuthError } from '@/app/lib/auth-guard';
import { createServiceRoleClient } from '@/app/lib/supabase-server';

const BOC_SUBSCRIBER_PRICE = process.env.NEXT_PUBLIC_STRIPE_BOC_SUBSCRIBER_PRICE_ID;
const BOC_STANDALONE_PRICE = process.env.NEXT_PUBLIC_STRIPE_BOC_STANDALONE_PRICE_ID;

export async function POST(request: NextRequest) {
  try {
    // Authenticate the caller — userId comes from session, not the body
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { priceId } = await request.json();

    // Validate the price ID is a BOC price
    if (!priceId || (priceId !== BOC_SUBSCRIBER_PRICE && priceId !== BOC_STANDALONE_PRICE)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Use service role for boc_purchases and subscriptions lookups
    const serviceClient = createServiceRoleClient();

    // Check if already purchased
    const { data: existing } = await serviceClient
      .from('boc_purchases')
      .select('id')
      .eq('user_id', auth.userId)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'BOC already purchased' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const { data: existingSub } = await serviceClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', auth.userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { user_id: auth.userId },
      });
      customerId = customer.id;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/boc?purchase=success`,
      cancel_url: `${baseUrl}/boc?purchase=canceled`,
      metadata: {
        user_id: auth.userId,
        purchase_type: 'boc',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('BOC checkout error:', message);
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/app/lib/stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BOC_SUBSCRIBER_PRICE = process.env.NEXT_PUBLIC_STRIPE_BOC_SUBSCRIBER_PRICE_ID;
const BOC_STANDALONE_PRICE = process.env.NEXT_PUBLIC_STRIPE_BOC_STANDALONE_PRICE_ID;

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate the price ID is a BOC price
    if (priceId !== BOC_SUBSCRIBER_PRICE && priceId !== BOC_STANDALONE_PRICE) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Check if already purchased
    const { data: existing } = await supabase
      .from('boc_purchases')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'BOC already purchased' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { user_id: userId },
      });
      customerId = customer.id;
    }

    // One-time payment checkout
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/boc?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/boc?purchase=canceled`,
      metadata: {
        user_id: userId,
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

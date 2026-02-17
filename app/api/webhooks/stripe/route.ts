import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/app/lib/stripe';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing stripe-signature header or STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Unhandled event type — ignore silently
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries the event (up to ~3 days).
    // This ensures subscription status changes aren't silently lost
    // when handlers fail due to DB errors or network issues.
    console.error(`Error handling ${event.type}:`, err);
    return NextResponse.json(
      { error: `Failed to process ${event.type}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

/**
 * checkout.session.completed — handles both subscription trials and
 * one-time BOC purchases.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // BOC one-time purchase
  if (session.metadata?.purchase_type === 'boc') {
    await handleBOCPurchase(session);
    return;
  }

  // Subscription checkout
  const userId = session.metadata?.user_id;
  const organizationId = session.metadata?.organization_id;

  if (!userId || !organizationId) {
    console.error('Missing metadata on checkout session:', session.id);
    return;
  }

  // Retrieve the full subscription from Stripe
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // In Stripe SDK v20+, current_period fields are on the subscription item
  const firstItem = subscription.items.data[0];

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      organization_id: organizationId,
      status: subscription.status,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: firstItem?.price?.id || null,
      current_period_start: firstItem
        ? new Date(firstItem.current_period_start * 1000).toISOString()
        : null,
      current_period_end: firstItem
        ? new Date(firstItem.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: 'user_id,organization_id' }
  );

  if (error) {
    console.error('Error upserting subscription on checkout:', error);
    throw error;
  }
}

/**
 * Handle BOC one-time purchase completion.
 */
async function handleBOCPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error('Missing user_id on BOC purchase session:', session.id);
    return;
  }

  const amount = (session.amount_total || 0) / 100; // cents to dollars

  // Use upsert keyed on stripe_session_id to handle duplicate webhook deliveries.
  // If Stripe sends checkout.session.completed twice, the second is a no-op.
  const { error } = await supabase.from('boc_purchases').upsert(
    {
      user_id: userId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      amount,
    },
    { onConflict: 'stripe_session_id' }
  );

  if (error) {
    console.error('Error recording BOC purchase:', error);
    throw error; // Let the outer catch return 500 so Stripe retries
  }
}

/**
 * customer.subscription.created / updated — sync status changes.
 * Handles trial→active, plan changes, renewals, etc.
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  const organizationId = subscription.metadata?.organization_id;

  if (!userId || !organizationId) {
    console.error('Missing metadata on subscription:', subscription.id);
    return;
  }

  // In Stripe SDK v20+, current_period fields are on the subscription item
  const firstItem = subscription.items.data[0];

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: firstItem?.price?.id || null,
      current_period_start: firstItem
        ? new Date(firstItem.current_period_start * 1000).toISOString()
        : null,
      current_period_end: firstItem
        ? new Date(firstItem.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * customer.subscription.deleted — subscription canceled or expired.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error marking subscription canceled:', error);
    throw error;
  }
}

/**
 * invoice.payment_failed — payment issue on renewal or trial end.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // In Stripe SDK v20+, subscription moved to invoice.parent.subscription_details
  const subDetails = invoice.parent?.subscription_details;
  const subscriptionId = typeof subDetails?.subscription === 'string'
    ? subDetails.subscription
    : subDetails?.subscription?.id;
  if (!subscriptionId) return;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error marking subscription past_due:', error);
    throw error;
  }
}

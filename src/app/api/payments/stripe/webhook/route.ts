import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { serverEnv } from '@/lib/env/server';
import { markStudyCheckoutFromSession } from '@/lib/repositories/order-repository';
import { getStripeClient } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!serverEnv.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, serverEnv.STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    console.error('Stripe webhook signature verification failed', error);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await markStudyCheckoutFromSession(session);
        break;
      }
      default: {
        break;
      }
    }
  } catch (error) {
    console.error('Stripe webhook handling failed', error);
    return NextResponse.json({ error: 'Webhook handling failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

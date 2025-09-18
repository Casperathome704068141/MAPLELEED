import {NextResponse} from 'next/server';

import {getStripeClient, resolveBaseUrl} from '@/lib/stripe';

type TravelPaymentPayload = {
  orderId?: string;
  bookingReference?: string;
  amount?: string | number;
  currency?: string;
  offerId?: string;
  contact?: {
    email?: string;
    phone_number?: string;
  };
  passengers?: Array<{
    given_name?: string;
    family_name?: string;
  }>;
};

function toUnitAmount(amount: string | number | undefined) {
  if (amount === undefined || amount === null) return null;
  const numeric = Number.parseFloat(String(amount));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 100);
}

export async function POST(request: Request) {
  try {
    const payload: TravelPaymentPayload = await request.json();

    const orderId = payload.orderId?.trim();
    const currency = payload.currency?.toLowerCase();
    const unitAmount = toUnitAmount(payload.amount);

    if (!orderId) {
      return NextResponse.json({error: 'orderId is required'}, {status: 400});
    }

    if (!currency) {
      return NextResponse.json({error: 'currency is required'}, {status: 400});
    }

    if (!unitAmount) {
      return NextResponse.json({error: 'A valid amount is required'}, {status: 400});
    }

    const stripe = getStripeClient();
    const baseUrl = resolveBaseUrl(request);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?order=${encodeURIComponent(orderId)}`,
      cancel_url: `${baseUrl}/checkout?offer=${encodeURIComponent(payload.offerId ?? '')}&order=${encodeURIComponent(orderId)}`,
      customer_email: payload.contact?.email,
      invoice_creation: {enabled: true},
      client_reference_id: orderId,
      metadata: {
        booking_reference: payload.bookingReference ?? '',
        offer_id: payload.offerId ?? '',
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: `Duffel flight booking ${payload.bookingReference ?? orderId}`,
              description: 'Includes MapleLeed service fees and airline fare.',
            },
          },
        },
      ],
    });

    return NextResponse.json({url: session.url, sessionId: session.id});
  } catch (error: any) {
    console.error('Failed to create travel payment session', error);
    const message =
      typeof error?.message === 'string' ? error.message : 'Unable to create payment session';
    return NextResponse.json({error: message}, {status: 500});
  }
}

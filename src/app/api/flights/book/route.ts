// src/app/api/flights/book/route.ts
import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

type Body = {
  offer_id: string;
  base_amount: number;
  currency: string;
  payment_intent_id: string;
  passengers: Array<{
    id: string;
    type: 'adult' | 'child' | 'infant_without_seat';
    title: 'mr' | 'ms' | 'mrs';
    gender: 'm' | 'f';
    given_name: string;
    family_name: string;
    born_on: string;
    email: string;
    phone_number: string;
  }>;
};

export async function POST(request: Request) {
  const { offer_id, base_amount, currency, payment_intent_id, passengers } = (await request.json()) as Body;

  try {
    const order = await duffel.orders.create({
      type: 'instant',
      selected_offers: [offer_id],
      payments: [
        {
          type: 'balance',
          amount: base_amount.toFixed(2),
          currency,
        },
      ],
      passengers,
      metadata: { duffel_payment_intent_id: payment_intent_id },
    });

    return NextResponse.json({
      order_id: order.data.id,
      booking_reference: order.data.booking_reference,
      documents: order.data.documents,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Booking failed' }, { status: 500 });
  }
}
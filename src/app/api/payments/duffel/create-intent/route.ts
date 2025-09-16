// src/app/api/payments/duffel/create-intent/route.ts
import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

type Body = {
  final_amount: number;
  currency: string;
};

export async function POST(request: Request) {
  const { final_amount, currency } = (await request.json()) as Body;

  try {
    const intent = await duffel.payments.paymentIntents.create({
      amount: final_amount.toFixed(2),
      currency,
    });

    return NextResponse.json({
      payment_intent_id: intent.data.id,
      client_token: intent.data.client_token,
      status: intent.data.status,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Create PaymentIntent failed' }, { status: 500 });
  }
}
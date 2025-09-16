// src/app/api/payments/duffel/confirm-intent/route.ts
import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

type Body = { payment_intent_id: string };

export async function POST(request: Request) {
  const { payment_intent_id } = (await request.json()) as Body;

  try {
    const confirmed = await (duffel as any).payments.paymentIntents.confirm(payment_intent_id);
    return NextResponse.json({ status: confirmed.data.status });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Confirm PaymentIntent failed' }, { status: 500 });
  }
}
// src/app/api/flights/search/route.ts
import { NextResponse } from 'next/server';
import { duffel, DUFFEL_CURRENCY } from '@/lib/duffel';
import { addFlatMarkup } from '@/lib/markup';

type Body = {
  origin: string; // e.g. "YYZ"
  destination: string; // e.g. "NBO"
  departureDate: string; // "2025-11-02"
  returnDate?: string; // optional "2025-11-18"
  adults?: number; // default 1
  cabin_class?: 'economy' | 'premium_economy' | 'business' | 'first';
};

export async function POST(request: Request) {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    cabin_class = 'economy',
  } = (await request.json()) as Body;

  try {
    const slices = [
      { origin, destination, departure_date: departureDate },
      ...(returnDate ? [{ origin: destination, destination: origin, departure_date: returnDate }] : []),
    ] as any;

    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers: Array.from({ length: Number(adults) }, () => ({ type: 'adult' })),
      cabin_class,
      return_offers: true,
    });

    const offers = offerRequest.data.offers || [];

    const results = offers.map((o) => {
      const base = Number(o.total_amount);
      const final = addFlatMarkup(base);

      return {
        offer_id: o.id,
        base_amount: base,
        final_amount: final,
        currency: o.total_currency || DUFFEL_CURRENCY,
        owner: o.owner,
        slices: o.slices,
        conditions: o.conditions,
      };
    });

    return NextResponse.json({ results });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Duffel search failed' }, { status: 500 });
  }
}
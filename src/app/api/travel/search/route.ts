import {NextResponse} from 'next/server';
import {getDuffelClient} from '@/lib/duffel';
import {summariseOffer} from '@/lib/travel';

type SearchPayload = {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string | null;
  adults?: number;
  cabinClass?: string;
};

function normaliseLocation(value?: string | null) {
  return value?.toString().trim().toUpperCase() ?? '';
}

function isValidDate(value?: string | null) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(req: Request) {
  try {
    const body: SearchPayload = await req.json();
    const origin = normaliseLocation(body.origin);
    const destination = normaliseLocation(body.destination);
    const departureDate = body.departureDate?.toString();
    const returnDate = body.returnDate?.toString() || null;
    const adults = Math.max(1, Number(body.adults ?? 1));
    const cabinClass = (body.cabinClass ?? 'economy').toString();

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        {error: 'origin, destination and departureDate are required'},
        {status: 400},
      );
    }

    if (!isValidDate(departureDate) || (returnDate && !isValidDate(returnDate))) {
      return NextResponse.json(
        {error: 'Invalid date format. Use YYYY-MM-DD.'},
        {status: 400},
      );
    }

    const duffel = getDuffelClient();

    const slices = [
      {
        origin,
        destination,
        departure_date: departureDate,
      },
    ];

    if (returnDate) {
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: returnDate,
      });
    }

    const passengers = Array.from({length: adults}).map(() => ({type: 'adult' as const}));

    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class: cabinClass,
      return_offers: true,
    });

    const offers = (offerRequest.data.offers ?? []).map(offer =>
      summariseOffer(offer, adults),
    );

    return NextResponse.json({
      offerRequestId: offerRequest.data.id,
      passengers: adults,
      offers,
    });
  } catch (error: any) {
    console.error('Duffel search failed', error);
    return NextResponse.json(
      {error: error?.message ?? 'Unable to search flights right now.'},
      {status: 500},
    );
  }
}

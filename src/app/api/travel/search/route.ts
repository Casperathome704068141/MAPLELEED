import {NextResponse} from 'next/server';

import {getDuffelClient} from '@/lib/duffel';
import {summariseOffer} from '@/lib/travel';
import {createSampleSearchResults} from '@/lib/sample-travel-data';
import {applyRateLimit} from '@/lib/rate-limit';

type SearchPayload = {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string | null;
  adults?: number;
  cabinClass?: string;
};

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

function normaliseLocation(value?: string | null) {
  return value?.toString().trim().toUpperCase() ?? '';
}

function isValidDate(value?: string | null) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseAdultCount(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export async function POST(req: Request) {
  let origin = '';
  let destination = '';
  let departureDate: string | null = null;
  let returnDate: string | null = null;
  let adults = 1;
  let cabinClass: CabinClass = 'economy';

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
    const rateLimit = applyRateLimit(`travel-search:${ip}`, {windowMs: 60_000, max: 20});
    if (!rateLimit.success) {
      return NextResponse.json(
        {error: 'You are searching too quickly. Please wait a few moments before trying again.'},
        {
          status: 429,
          headers: {'Retry-After': String(rateLimit.retryAfter ?? 30)},
        },
      );
    }

    const body: SearchPayload = await req.json();
    origin = normaliseLocation(body.origin);
    destination = normaliseLocation(body.destination);
    departureDate = body.departureDate?.toString() ?? null;
    returnDate = body.returnDate?.toString() || null;
    adults = parseAdultCount(body.adults ?? 1);
    const requestedCabin = (body.cabinClass ?? 'economy').toString().toLowerCase();
    const allowedCabins: CabinClass[] = ['economy', 'premium_economy', 'business', 'first'];
    cabinClass = allowedCabins.includes(requestedCabin as CabinClass)
      ? (requestedCabin as CabinClass)
      : 'economy';

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
      slices: slices as any,
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
    }, {headers: {'Cache-Control': 'no-store'}});
  } catch (error: any) {
    console.error('Duffel search failed', error);
    if (origin && destination && departureDate) {
      try {
        const fallback = createSampleSearchResults(
          {
            origin,
            destination,
            departureDate,
            returnDate,
          },
          adults,
        );

        if (fallback?.offers?.length) {
          return NextResponse.json({
            offerRequestId: fallback.offerRequestId,
            passengers: adults,
            offers: fallback.offers,
          }, {headers: {'Cache-Control': 'no-store'}});
        }
      } catch (fallbackError) {
        console.error('Sample search generation failed', fallbackError);
      }
    }
    return NextResponse.json(
      {error: error?.message ?? 'Unable to search flights right now.'},
      {status: 500},
    );
  }
}

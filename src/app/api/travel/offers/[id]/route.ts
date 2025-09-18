import {NextResponse} from 'next/server';
import {getDuffelClient} from '@/lib/duffel';
import {summariseOffer} from '@/lib/travel';
import {getSampleOfferById, isSampleOfferId} from '@/lib/sample-travel-data';

type Params = {
  params: {id: string};
};

export async function GET(req: Request, {params}: Params) {
  const offerId = params.id;

  if (!offerId) {
    return NextResponse.json({error: 'Offer id is required'}, {status: 400});
  }

  try {
    const {searchParams} = new URL(req.url);
    const pax = parsePassengerCount(searchParams.get('pax'));

    if (isSampleOfferId(offerId)) {
      const sample = getSampleOfferById(offerId, pax);
      if (sample) {
        return NextResponse.json(sample);
      }
      return NextResponse.json({error: 'Offer not found'}, {status: 404});
    }

    const duffel = getDuffelClient();
    const offer = await duffel.offers.get(offerId, {
      return_available_services: true,
    });

    return NextResponse.json({
      offer: summariseOffer(offer.data, pax),
      available_services: offer.data.available_services ?? [],
    });
  } catch (error: any) {
    console.error('Load offer failed', error);
    try {
      const {searchParams} = new URL(req.url);
      const pax = parsePassengerCount(searchParams.get('pax'));
      const sample = getSampleOfferById(offerId, pax);
      if (sample) {
        return NextResponse.json(sample);
      }
    } catch (fallbackError) {
      console.error('Sample offer lookup failed', fallbackError);
    }
    return NextResponse.json(
      {error: error?.message ?? 'Unable to load offer'},
      {status: 500},
    );
  }
}

function parsePassengerCount(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

import {NextResponse} from 'next/server';
import {getDuffelClient} from '@/lib/duffel';
import {summariseOffer} from '@/lib/travel';

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
    const pax = Math.max(1, Number(searchParams.get('pax') ?? '1'));

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
    return NextResponse.json(
      {error: error?.message ?? 'Unable to load offer'},
      {status: 500},
    );
  }
}

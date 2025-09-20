import {NextResponse} from 'next/server';
import {z} from 'zod';

import {getDuffelClient} from '@/lib/duffel';
import {recordTravelOrder} from '@/lib/repositories/order-repository';
import {applyMarkup} from '@/lib/travel';
import {applyRateLimit} from '@/lib/rate-limit';

type DuffelOrderPassenger = {
  id: string;
  type: 'adult';
  title: 'mr' | 'ms' | 'mrs' | 'miss';
  gender: 'm' | 'f';
  given_name: string;
  family_name: string;
  born_on: string;
  email: string;
  phone_number: string;
};

const passengerSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.enum(['adult']).default('adult'),
  title: z.string().optional(),
  given_name: z.string().min(1),
  family_name: z.string().min(1),
  born_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email(),
  phone_number: z.string().min(6),
  gender: z.enum(['m', 'f']).optional(),
});

const contactSchema = z.object({
  email: z.string().email(),
  phone_number: z.string().min(6),
});

const bookingSchema = z.object({
  offerId: z.string().min(1),
  passengers: z.array(passengerSchema).min(1),
  contact: contactSchema,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
    const rateLimit = applyRateLimit(`travel-book:${ip}`, {windowMs: 60_000, max: 5});
    if (!rateLimit.success) {
      return NextResponse.json(
        {error: 'Too many booking attempts. Please wait a minute before trying again.'},
        {
          status: 429,
          headers: {'Retry-After': String(rateLimit.retryAfter ?? 60)},
        },
      );
    }

    const parsed = bookingSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        {error: 'Invalid booking payload', details: parsed.error.flatten()},
        {status: 422},
      );
    }

    const {offerId, contact} = parsed.data;
    const passengers: DuffelOrderPassenger[] = parsed.data.passengers.map((passenger, index) => {
      const title = passenger.title?.toLowerCase() ?? 'mr';
      const allowedTitles: Array<DuffelOrderPassenger['title']> = ['mr', 'ms', 'mrs', 'miss'];
      const normalizedTitle = allowedTitles.includes(title as DuffelOrderPassenger['title'])
        ? (title as DuffelOrderPassenger['title'])
        : 'mr';
      const gender = passenger.gender ?? (['ms', 'mrs', 'miss'].includes(normalizedTitle) ? 'f' : 'm');

      return {
        id: passenger.id ?? `pas_${index + 1}`,
        type: passenger.type,
        title: normalizedTitle,
        gender,
        given_name: passenger.given_name,
        family_name: passenger.family_name,
        born_on: passenger.born_on,
        email: passenger.email,
        phone_number: passenger.phone_number,
      };
    });

    const duffel = getDuffelClient();
    const freshOffer = await duffel.offers.get(offerId);

    const orderPayload = {
      type: 'instant',
      selected_offers: [offerId],
      passengers,
      contact: {
        email: contact.email,
        phone_number: contact.phone_number,
      },
      payments: [
        {
          type: 'balance',
          amount: Number(freshOffer.data.total_amount).toFixed(2),
          currency: freshOffer.data.total_currency,
        },
      ],
    };

    const order = await duffel.orders.create(orderPayload as any);

    const pricing = applyMarkup(freshOffer.data, passengers.length).pricing;

    await recordTravelOrder({
      orderId: order.data.id,
      bookingReference: order.data.booking_reference ?? null,
      passengers,
      pricing,
      contactEmail: contact.email,
      contactName: passengers[0]?.given_name
        ? `${passengers[0].given_name} ${passengers[0].family_name}`.trim()
        : null,
    });

    return NextResponse.json({
      order_id: order.data.id,
      booking_reference: order.data.booking_reference,
      documents: order.data.documents ?? [],
      pricing,
    }, {headers: {'Cache-Control': 'no-store'}});
  } catch (error: any) {
    console.error('Booking failed', error);
    const errorPayload = error?.errors ?? error?.message ?? 'Booking failed';
    return NextResponse.json({error: errorPayload}, {status: 500});
  }
}

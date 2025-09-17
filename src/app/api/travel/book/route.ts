import {NextResponse} from 'next/server';
import {getDuffelClient} from '@/lib/duffel';
import {applyMarkup} from '@/lib/travel';

type PassengerPayload = {
  id?: string;
  type?: string;
  title?: string;
  given_name?: string;
  family_name?: string;
  born_on?: string;
  email?: string;
  phone_number?: string;
};

type ContactPayload = {
  email?: string;
  phone_number?: string;
};

type BookPayload = {
  offerId?: string;
  passengers?: PassengerPayload[];
  contact?: ContactPayload;
};

function cleanPassenger(passenger: PassengerPayload, index: number) {
  const title = passenger.title?.toLowerCase() || 'mr';
  return {
    id: passenger.id || `pas_${index + 1}`,
    type: (passenger.type || 'adult') as 'adult',
    title,
    given_name: passenger.given_name?.trim(),
    family_name: passenger.family_name?.trim(),
    born_on: passenger.born_on,
    email: passenger.email,
    phone_number: passenger.phone_number,
  };
}

function validatePassenger(passenger: ReturnType<typeof cleanPassenger>) {
  return (
    Boolean(passenger.given_name) &&
    Boolean(passenger.family_name) &&
    Boolean(passenger.born_on) &&
    Boolean(passenger.email) &&
    Boolean(passenger.phone_number)
  );
}

function validateContact(contact?: ContactPayload | null) {
  if (!contact) return false;
  return Boolean(contact.email) && Boolean(contact.phone_number);
}

export async function POST(req: Request) {
  try {
    const body: BookPayload = await req.json();
    const offerId = body.offerId?.toString();
    const rawPassengers = body.passengers ?? [];
    const contact = body.contact;

    if (!offerId) {
      return NextResponse.json({error: 'offerId is required'}, {status: 400});
    }

    if (!rawPassengers.length) {
      return NextResponse.json({error: 'At least one passenger is required'}, {status: 400});
    }

    if (!validateContact(contact)) {
      return NextResponse.json(
        {error: 'A contact email and phone number are required'},
        {status: 400},
      );
    }

    const passengers = rawPassengers
      .map(cleanPassenger)
      .filter(passenger => validatePassenger(passenger));

    if (!passengers.length) {
      return NextResponse.json(
        {error: 'Passenger details are incomplete'},
        {status: 400},
      );
    }

    const duffel = getDuffelClient();
    const freshOffer = await duffel.offers.get(offerId);

    const order = await duffel.orders.create({
      type: 'instant',
      selected_offers: [offerId],
      passengers,
      contact: {
        email: contact?.email!,
        phone_number: contact?.phone_number!,
      },
      payments: [
        {
          type: 'balance',
          amount: Number(freshOffer.data.total_amount).toFixed(2),
          currency: freshOffer.data.total_currency,
        },
      ],
    });

    const pricing = applyMarkup(freshOffer.data, passengers.length).pricing;
    const baseChargeAmount = Number.parseFloat(String(freshOffer.data.total_amount ?? '0'));
    const conciergeChargeAmount = Number.parseFloat(String(pricing.markup_total ?? '0'));

    return NextResponse.json({
      order_id: order.data.id,
      booking_reference: order.data.booking_reference,
      status: order.data.status,
      documents: order.data.documents ?? [],
      pricing,
      allocation: {
        airline: Number.isFinite(baseChargeAmount)
          ? baseChargeAmount.toFixed(2)
          : pricing.base_total_amount,
        concierge: Number.isFinite(conciergeChargeAmount)
          ? conciergeChargeAmount.toFixed(2)
          : '0.00',
        currency: pricing.currency,
      },
    });
  } catch (error: any) {
    console.error('Booking failed', error);
    const errorPayload = error?.errors ?? error?.message ?? 'Booking failed';
    return NextResponse.json({error: errorPayload}, {status: 500});
  }
}

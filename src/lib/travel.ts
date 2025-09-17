const MARKUP_THRESHOLD = 999;
const MARKUP_BELOW_THRESHOLD = 75;
const MARKUP_ABOVE_THRESHOLD = 100;

type PassengerCount = number;

type Offer = any;

type Pricing = {
  currency: string;
  base_total_amount: string;
  markup_per_ticket: string;
  tickets: number;
  markup_total: string;
  display_total_amount: string;
};

type SegmentSummary = {
  id: string;
  marketing_flight?: string | null;
  carrier_name?: string | null;
  departing_at?: string | null;
  arriving_at?: string | null;
  origin?: string | null;
  destination?: string | null;
  aircraft_name?: string | null;
};

type SliceSummary = {
  id: string;
  origin?: string | null;
  destination?: string | null;
  duration?: string | null;
  segments: SegmentSummary[];
};

type OwnerSummary = {
  name?: string | null;
  iata_code?: string | null;
  logo_symbol_url?: string | null;
};

type OfferSummary = {
  id: string;
  slices: SliceSummary[];
  owner: OwnerSummary;
  pricing: Pricing;
  conditions?: any;
};

export type {OfferSummary, Pricing, SliceSummary, SegmentSummary};

function resolveMarkupPerTicket(totalAmount: number) {
  if (!Number.isFinite(totalAmount)) {
    return MARKUP_BELOW_THRESHOLD;
  }

  return totalAmount < MARKUP_THRESHOLD
    ? MARKUP_BELOW_THRESHOLD
    : MARKUP_ABOVE_THRESHOLD;
}

export function applyMarkup(offer: Offer, passengers: PassengerCount) {
  const base = Number(offer.total_amount ?? 0);
  const markupPerTicket = resolveMarkupPerTicket(base);
  const markupTotal = markupPerTicket * passengers;
  const display = (base + markupTotal).toFixed(2);

  return {
    ...offer,
    pricing: {
      currency: offer.total_currency,
      base_total_amount: String(offer.total_amount ?? '0.00'),
      markup_per_ticket: markupPerTicket.toFixed(2),
      tickets: passengers,
      markup_total: markupTotal.toFixed(2),
      display_total_amount: display,
    } satisfies Pricing,
  };
}

export function summariseOffer(offer: Offer, passengers: PassengerCount): OfferSummary {
  const priced = applyMarkup(offer, passengers);

  const slices: SliceSummary[] = (priced.slices ?? []).map((slice: any) => ({
    id: slice.id,
    origin: slice.origin?.iata_code ?? slice.origin?.name ?? null,
    destination: slice.destination?.iata_code ?? slice.destination?.name ?? null,
    duration: slice.duration ?? null,
    segments: (slice.segments ?? []).map((segment: any) => ({
      id: segment.id,
      marketing_flight: segment.marketing_carrier?.iata_code
        ? `${segment.marketing_carrier.iata_code}${segment.marketing_flight_number ?? ''}`
        : null,
      carrier_name: segment.operating_carrier?.name ?? segment.marketing_carrier?.name ?? null,
      departing_at: segment.departing_at ?? null,
      arriving_at: segment.arriving_at ?? null,
      origin: segment.origin?.iata_code ?? segment.origin?.name ?? null,
      destination: segment.destination?.iata_code ?? segment.destination?.name ?? null,
      aircraft_name: segment.aircraft?.name ?? null,
    })),
  }));

  return {
    id: priced.id,
    slices,
    owner: {
      name: priced.owner?.name ?? null,
      iata_code: priced.owner?.iata_code ?? null,
      logo_symbol_url: priced.owner?.logo_symbol_url ?? null,
    },
    pricing: priced.pricing,
    conditions: priced.conditions,
  };
}

import {applyMarkup} from "@/lib/travel";
import type {OfferSummary, SliceSummary, SegmentSummary} from "@/lib/travel";

type SampleOfferParams = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
};

type SampleSegmentTemplate = {
  idSuffix: string;
  origin: string;
  destination: string;
  marketingCarrierCode: string;
  marketingFlightNumber: string;
  operatingCarrierName: string;
  aircraftName: string;
  departureOffsetMinutes: number;
  durationMinutes: number;
};

type SampleSliceTemplate = {
  idSuffix: string;
  departureTime: string;
  segments: SampleSegmentTemplate[];
};

type SampleServiceTemplate = {
  idSuffix: string;
  type: string;
  description: string;
  amountPerPassenger: number;
};

type SampleOfferTemplate = {
  owner: {
    name: string;
    iata_code: string;
    logo_symbol_url?: string | null;
  };
  baseAmountPerPassenger: number;
  currency: string;
  outbound: SampleSliceTemplate;
  inbound?: SampleSliceTemplate;
  conditions?: any;
  services?: SampleServiceTemplate[];
};

type SampleOfferBuildResult = {
  summary: OfferSummary;
  availableServices: any[];
};

const SAMPLE_ID_PREFIX = "sample";
const SAMPLE_OFFER_TEMPLATES: SampleOfferTemplate[] = [
  {
    owner: {
      name: "MapleJet Airways",
      iata_code: "MJ",
      logo_symbol_url: null,
    },
    baseAmountPerPassenger: 620,
    currency: "USD",
    outbound: {
      idSuffix: "mj-out",
      departureTime: "17:20",
      segments: [
        {
          idSuffix: "leg-1",
          origin: "ORIGIN",
          destination: "DESTINATION",
          marketingCarrierCode: "MJ",
          marketingFlightNumber: "218",
          operatingCarrierName: "MapleJet Airways",
          aircraftName: "Boeing 787 Dreamliner",
          departureOffsetMinutes: 0,
          durationMinutes: 440,
        },
      ],
    },
    inbound: {
      idSuffix: "mj-in",
      departureTime: "10:45",
      segments: [
        {
          idSuffix: "leg-1",
          origin: "ORIGIN",
          destination: "DESTINATION",
          marketingCarrierCode: "MJ",
          marketingFlightNumber: "219",
          operatingCarrierName: "MapleJet Airways",
          aircraftName: "Boeing 787 Dreamliner",
          departureOffsetMinutes: 0,
          durationMinutes: 455,
        },
      ],
    },
    conditions: {
      change_before_departure: {
        allowed: true,
        penalty_amount: "150.00",
        penalty_currency: "USD",
      },
      refund_before_departure: {
        allowed: false,
        penalty_amount: "250.00",
        penalty_currency: "USD",
      },
    },
    services: [
      {
        idSuffix: "checked-bag",
        type: "checked_baggage",
        description: "Add one 23kg checked bag",
        amountPerPassenger: 65,
      },
    ],
  },
  {
    owner: {
      name: "Northern Lights Air",
      iata_code: "NL",
      logo_symbol_url: null,
    },
    baseAmountPerPassenger: 540,
    currency: "USD",
    outbound: {
      idSuffix: "nl-out",
      departureTime: "21:15",
      segments: [
        {
          idSuffix: "leg-1",
          origin: "ORIGIN",
          destination: "KEF",
          marketingCarrierCode: "NL",
          marketingFlightNumber: "213",
          operatingCarrierName: "Northern Lights Air",
          aircraftName: "Airbus A321neo",
          departureOffsetMinutes: 0,
          durationMinutes: 305,
        },
        {
          idSuffix: "leg-2",
          origin: "KEF",
          destination: "DESTINATION",
          marketingCarrierCode: "NL",
          marketingFlightNumber: "482",
          operatingCarrierName: "Northern Lights Air",
          aircraftName: "Airbus A320",
          departureOffsetMinutes: 365,
          durationMinutes: 205,
        },
      ],
    },
    inbound: {
      idSuffix: "nl-in",
      departureTime: "12:30",
      segments: [
        {
          idSuffix: "leg-1",
          origin: "ORIGIN",
          destination: "KEF",
          marketingCarrierCode: "NL",
          marketingFlightNumber: "483",
          operatingCarrierName: "Northern Lights Air",
          aircraftName: "Airbus A320",
          departureOffsetMinutes: 0,
          durationMinutes: 210,
        },
        {
          idSuffix: "leg-2",
          origin: "KEF",
          destination: "DESTINATION",
          marketingCarrierCode: "NL",
          marketingFlightNumber: "214",
          operatingCarrierName: "Northern Lights Air",
          aircraftName: "Airbus A321neo",
          departureOffsetMinutes: 330,
          durationMinutes: 290,
        },
      ],
    },
    conditions: {
      change_before_departure: {
        allowed: true,
        penalty_amount: "120.00",
        penalty_currency: "USD",
      },
      refund_before_departure: {
        allowed: true,
        penalty_amount: "200.00",
        penalty_currency: "USD",
      },
    },
    services: [
      {
        idSuffix: "extra-legroom",
        type: "seat",
        description: "Choose extra-legroom seats",
        amountPerPassenger: 35,
      },
    ],
  },
  {
    owner: {
      name: "Aurora Atlantic",
      iata_code: "AA",
      logo_symbol_url: null,
    },
    baseAmountPerPassenger: 780,
    currency: "USD",
    outbound: {
      idSuffix: "aa-out",
      departureTime: "08:05",
      segments: [
        {
          idSuffix: "leg-1",
          origin: "ORIGIN",
          destination: "DESTINATION",
          marketingCarrierCode: "AA",
          marketingFlightNumber: "702",
          operatingCarrierName: "Aurora Atlantic",
          aircraftName: "Airbus A350",
          departureOffsetMinutes: 0,
          durationMinutes: 430,
        },
      ],
    },
    inbound: {
      idSuffix: "aa-in",
      departureTime: "16:10",
      segments: [
        {
          idSuffix: "leg-1",
          origin: "ORIGIN",
          destination: "DESTINATION",
          marketingCarrierCode: "AA",
          marketingFlightNumber: "703",
          operatingCarrierName: "Aurora Atlantic",
          aircraftName: "Airbus A350",
          departureOffsetMinutes: 0,
          durationMinutes: 435,
        },
      ],
    },
    conditions: {
      change_before_departure: {
        allowed: true,
        penalty_amount: "0.00",
        penalty_currency: "USD",
      },
      refund_before_departure: {
        allowed: true,
        penalty_amount: "150.00",
        penalty_currency: "USD",
      },
    },
    services: [
      {
        idSuffix: "premium-meal",
        type: "meal",
        description: "Upgrade to premium in-flight dining",
        amountPerPassenger: 28,
      },
    ],
  },
];

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function resolveLocation(value: string, origin: string, destination: string) {
  if (value === "ORIGIN") return origin;
  if (value === "DESTINATION") return destination;
  return value;
}

function isoFrom(date: string, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const iso = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), hour, minute));
  return iso;
}

function minutesToDuration(totalMinutes: number) {
  const clamped = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  const parts: string[] = [];
  if (hours) parts.push(`${hours}H`);
  if (minutes) parts.push(`${minutes}M`);
  if (!parts.length) {
    return "PT0M";
  }
  return `PT${parts.join("")}`;
}

function buildSlice(
  template: SampleSliceTemplate,
  date: string,
  origin: string,
  destination: string,
  idBase: string,
  direction: "outbound" | "return",
): SliceSummary {
  const baseDeparture = isoFrom(date, template.departureTime);
  const segments: SegmentSummary[] = template.segments.map((segment, index) => {
    const departure = new Date(baseDeparture.getTime() + segment.departureOffsetMinutes * 60 * 1000);
    const arrival = new Date(departure.getTime() + segment.durationMinutes * 60 * 1000);
    return {
      id: `${idBase}-${direction}-seg-${index + 1}`,
      marketing_flight: `${segment.marketingCarrierCode}${segment.marketingFlightNumber}`,
      carrier_name: segment.operatingCarrierName,
      departing_at: departure.toISOString(),
      arriving_at: arrival.toISOString(),
      origin: resolveLocation(segment.origin, origin, destination),
      destination: resolveLocation(segment.destination, origin, destination),
      aircraft_name: segment.aircraftName,
    } satisfies SegmentSummary;
  });

  const firstDeparture = segments[0]?.departing_at ? new Date(segments[0].departing_at) : null;
  const lastArrival = segments.length ? new Date(segments[segments.length - 1].arriving_at ?? segments[segments.length - 1].departing_at ?? baseDeparture) : null;
  const durationMinutes = firstDeparture && lastArrival ? (lastArrival.getTime() - firstDeparture.getTime()) / (60 * 1000) : 0;

  return {
    id: `${idBase}-${direction}`,
    origin: segments[0]?.origin ?? origin,
    destination: segments[segments.length - 1]?.destination ?? destination,
    duration: minutesToDuration(durationMinutes),
    segments,
  } satisfies SliceSummary;
}

function buildPricing(template: SampleOfferTemplate, passengers: number) {
  const baseTotal = template.baseAmountPerPassenger * passengers;
  const result = applyMarkup(
    {
      id: "sample-base",
      total_amount: baseTotal.toFixed(2),
      total_currency: template.currency,
    },
    passengers,
  );
  return result.pricing;
}

function buildServices(template: SampleOfferTemplate, id: string, passengers: number) {
  return (template.services ?? []).map(service => ({
    id: `${id}-${service.idSuffix}`,
    type: service.type,
    total_amount: (service.amountPerPassenger * passengers).toFixed(2),
    total_currency: template.currency,
    metadata: {
      description: service.description,
    },
  }));
}

function buildSampleOffer(
  template: SampleOfferTemplate,
  index: number,
  params: SampleOfferParams,
  passengers: number,
  idOverride?: string,
): SampleOfferBuildResult {
  const id = idOverride ?? buildSampleOfferId(index, params);
  const slices: SliceSummary[] = [];

  slices.push(buildSlice(template.outbound, params.departureDate, params.origin, params.destination, id, "outbound"));

  if (params.returnDate) {
    const inboundTemplate = template.inbound ?? template.outbound;
    slices.push(
      buildSlice(inboundTemplate, params.returnDate, params.destination, params.origin, id, "return"),
    );
  }

  const summary: OfferSummary = {
    id,
    slices,
    owner: {
      name: template.owner.name,
      iata_code: template.owner.iata_code,
      logo_symbol_url: template.owner.logo_symbol_url ?? null,
    },
    pricing: buildPricing(template, passengers),
    conditions: template.conditions ?? null,
  };

  return {
    summary,
    availableServices: buildServices(template, id, passengers),
  };
}

function buildSampleOfferRequestId(params: SampleOfferParams) {
  const returnPart = params.returnDate ?? "oneway";
  return `${SAMPLE_ID_PREFIX}-search~${params.origin}~${params.destination}~${params.departureDate}~${returnPart}`;
}

function buildSampleOfferId(index: number, params: SampleOfferParams) {
  const returnPart = params.returnDate ?? "oneway";
  return `${SAMPLE_ID_PREFIX}~${index}~${params.origin}~${params.destination}~${params.departureDate}~${returnPart}`;
}

function parseSampleOfferId(id: string) {
  if (!id.startsWith(`${SAMPLE_ID_PREFIX}~`)) {
    return null;
  }

  const [, indexPart, origin, destination, departureDate, returnPart] = id.split("~");
  if (!origin || !destination || !departureDate) {
    return null;
  }
  const index = Number.parseInt(indexPart ?? "0", 10);
  if (!Number.isFinite(index) || index < 0) {
    return null;
  }
  return {
    index,
    origin,
    destination,
    departureDate,
    returnDate: returnPart && returnPart !== "oneway" ? returnPart : null,
  } satisfies SampleOfferParams & {index: number};
}

export function createSampleSearchResults(params: SampleOfferParams, passengers: number) {
  const offers = SAMPLE_OFFER_TEMPLATES.map((template, index) =>
    buildSampleOffer(template, index, params, passengers).summary,
  );

  return {
    offerRequestId: buildSampleOfferRequestId(params),
    offers,
  };
}

export function getSampleOfferById(id: string, passengers: number) {
  const parsed = parseSampleOfferId(id);
  if (!parsed) {
    return null;
  }

  const template = SAMPLE_OFFER_TEMPLATES[parsed.index % SAMPLE_OFFER_TEMPLATES.length];
  const {summary, availableServices} = buildSampleOffer(template, parsed.index, parsed, passengers, id);
  return {
    offer: summary,
    available_services: availableServices,
  };
}

export function isSampleOfferId(id: string) {
  return id.startsWith(`${SAMPLE_ID_PREFIX}~`);
}

export type {SampleOfferParams};

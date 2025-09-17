"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import type {ChangeEvent, ComponentType, FormEvent} from "react";
import {
  CalendarDays,
  Clock,
  Globe2,
  Headphones,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import type {OfferSummary, SegmentSummary, SliceSummary} from "@/lib/travel";

type SearchState = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  adults: number;
  cabinClass: string;
};

type FormState = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  cabinClass: string;
};

type QuickTrip = {
  label: string;
  description: string;
  origin: string;
  destination: string;
  departureOffset: number;
  returnOffset?: number | null;
  cabinClass?: string;
  travellers?: number;
};

type Highlight = {
  title: string;
  description: string;
  icon: ComponentType<{className?: string}>;
};

type Step = Highlight;

type Faq = {
  question: string;
  answer: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
});

const cabinLabels: Record<string, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

const heroHighlights: Highlight[] = [
  {
    title: "Dedicated travel team",
    description: "Real humans on standby to reroute or manage disruptions 24/7.",
    icon: Headphones,
  },
  {
    title: "Global inventory",
    description: "Direct access to Duffel’s live fares from 300+ airlines worldwide.",
    icon: Globe2,
  },
  {
    title: "Transparent concierge fee",
    description: "$75 per traveller under $999, $100 when fares reach $999 or more.",
    icon: ShieldCheck,
  },
];

const journeySteps: Step[] = [
  {
    title: "Share your goals",
    description: "Tell us your campus, placement, or volunteer travel plans and we source matching flights.",
    icon: CalendarDays,
  },
  {
    title: "Curate the itinerary",
    description: "Compare live Duffel offers, select seats, and review fare rules before checkout.",
    icon: Plane,
  },
  {
    title: "Concierge on call",
    description: "Our specialists monitor your booking and support itinerary changes any time.",
    icon: Headphones,
  },
];

const valueProps: Highlight[] = [
  {
    title: "Duty-of-care ready",
    description: "Comprehensive traveller manifests and invoices for your programme director.",
    icon: ShieldCheck,
  },
  {
    title: "Faster issue resolution",
    description: "We liaise with airline desks directly so you skip the hold music.",
    icon: Clock,
  },
  {
    title: "Worldwide expertise",
    description: "Experience across academic exchanges, medical electives, and group expeditions.",
    icon: Globe2,
  },
];

const faqs: Faq[] = [
  {
    question: "How does your concierge pricing work?",
    answer:
      "We apply a flat concierge markup to every ticket: $75 per traveller when the base fare is under $999 and $100 when it reaches $999 or more. The fee is itemised alongside the airline fare at checkout.",
  },
  {
    question: "Can I travel one-way or add multi-city itineraries?",
    answer:
      "Yes. Start with a one-way search here or contact our team for complex routings like multi-city study terms—we can build a custom Duffel offer for you.",
  },
  {
    question: "What happens after I book?",
    answer:
      "You will receive a Duffel confirmation, airline record locator, and e-ticket documents. Our concierge monitors the trip and can update passenger details, seats, or add ancillaries on request.",
  },
];

const quickTrips: QuickTrip[] = [
  {
    label: "Toronto → Nairobi",
    description: "Ideal for global health placements (7 nights)",
    origin: "YYZ",
    destination: "NBO",
    departureOffset: 45,
    returnOffset: 52,
    cabinClass: "economy",
  },
  {
    label: "Vancouver → Tokyo",
    description: "Cultural exchange kickoff (10 nights)",
    origin: "YVR",
    destination: "HND",
    departureOffset: 35,
    returnOffset: 45,
    cabinClass: "premium_economy",
  },
  {
    label: "Montreal → Paris",
    description: "Semester abroad welcome flight",
    origin: "YUL",
    destination: "CDG",
    departureOffset: 60,
    returnOffset: 180,
    cabinClass: "economy",
    travellers: 2,
  },
];

function formatDate(value?: string | null) {
  if (!value) return "";
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch (error) {
    return value ?? "";
  }
}

function formatDuration(duration?: string | null) {
  if (!duration) return "";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const [, hours, minutes] = match;
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(" ");
}

function parseDurationToMinutes(duration?: string | null) {
  if (!duration) return Number.MAX_SAFE_INTEGER;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  return hours * 60 + minutes;
}

function getOfferDurationMinutes(offer: OfferSummary) {
  return offer.slices.reduce((total, slice) => total + parseDurationToMinutes(slice.duration), 0);
}

function segmentKey(segment: SegmentSummary, index: number) {
  return segment.id || `${segment.marketing_flight}-${index}`;
}

function formatStops(slice: SliceSummary) {
  const stops = Math.max(0, (slice.segments?.length ?? 1) - 1);
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function safeAmount(value?: string | number | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export default function TravelPage() {
  const [formState, setFormState] = useState<FormState>(() => {
    const today = new Date();
    return {
      origin: "",
      destination: "",
      departureDate: formatDateInput(addDays(today, 30)),
      returnDate: "",
      adults: 1,
      cabinClass: "economy",
    };
  });
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchState | null>(null);
  const [nonstopOnly, setNonstopOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "duration">("price");

  const todayInput = formatDateInput(new Date());

  const resultsTitle = useMemo(() => {
    if (!lastSearch) return null;
    const {origin, destination, departureDate, returnDate, adults, cabinClass} = lastSearch;
    const travellers = adults === 1 ? "1 traveller" : `${adults} travellers`;
    const outbound = new Date(departureDate).toLocaleDateString();
    const inbound = returnDate ? new Date(returnDate).toLocaleDateString() : null;
    const cabin = cabinLabels[cabinClass] ?? cabinClass;
    return inbound
      ? `${origin} → ${destination} · Depart ${outbound} · Return ${inbound} · ${travellers} · ${cabin}`
      : `${origin} → ${destination} · Depart ${outbound} · ${travellers} · ${cabin}`;
  }, [lastSearch]);

  const displayOffers = useMemo(() => {
    if (!offers.length) return [];

    const sorted = [...offers];
    if (sortBy === "duration") {
      sorted.sort((a, b) => getOfferDurationMinutes(a) - getOfferDurationMinutes(b));
    } else {
      sorted.sort(
        (a, b) =>
          safeAmount(a.pricing?.display_total_amount) - safeAmount(b.pricing?.display_total_amount),
      );
    }

    return sorted.filter(offer => {
      if (!nonstopOnly) return true;
      return offer.slices.every(slice => (slice.segments?.length ?? 0) <= 1);
    });
  }, [offers, nonstopOnly, sortBy]);

  const filteredOut = offers.length - displayOffers.length;
  const hasSearched = Boolean(lastSearch);

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: SearchState = {
      origin: formState.origin.trim().toUpperCase(),
      destination: formState.destination.trim().toUpperCase(),
      departureDate: formState.departureDate,
      returnDate: formState.returnDate ? formState.returnDate : null,
      adults: Math.max(1, Number(formState.adults || 1)),
      cabinClass: formState.cabinClass,
    };

    if (!payload.origin || !payload.destination || !payload.departureDate) {
      setError("Origin, destination, and departure date are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setOffers([]);

    try {
      const response = await fetch("/api/travel/search", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const {error: message} = await response.json().catch(() => ({error: ""}));
        throw new Error(message || "Search request failed. Please try again.");
      }

      const data = await response.json();
      setOffers(Array.isArray(data.offers) ? data.offers : []);
      setLastSearch({...payload, adults: data.passengers ?? payload.adults});
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "We couldn’t reach the flight search service.");
    } finally {
      setLoading(false);
    }
  }

  function onQuickTripSelect(trip: QuickTrip) {
    const now = new Date();
    setFormState(prev => ({
      ...prev,
      origin: trip.origin,
      destination: trip.destination,
      departureDate: formatDateInput(addDays(now, trip.departureOffset)),
      returnDate:
        trip.returnOffset === null || trip.returnOffset === undefined
          ? ""
          : formatDateInput(addDays(now, trip.returnOffset)),
      cabinClass: trip.cabinClass ?? prev.cabinClass,
      adults: trip.travellers ?? prev.adults,
    }));
  }

  function onInputChange(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.currentTarget.value;
      setFormState(prev => {
        const next: FormState = {...prev};
        if (field === "origin" || field === "destination") {
          next[field] = value.toUpperCase();
        } else if (field === "adults") {
          const parsed = Number(value);
          next.adults = Math.max(1, Number.isFinite(parsed) ? parsed : 1);
        } else {
          next[field] = value;
        }
        return next;
      });
    };
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/70 via-background to-transparent dark:from-sky-950/40"
            aria-hidden
          />
          <div className="relative px-6 pt-24 pb-16">
            <div className="mx-auto flex max-w-5xl flex-col gap-12">
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" /> Premium student travel desk
                  </span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-headline font-bold tracking-tight md:text-5xl">
                    Plan your journey with concierge-level care
                  </h1>
                  <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                    Book real-time Duffel flights, add our transparent concierge fee—$75 per traveller for
                    fares under $999 and $100 when they’re $999 or more—and receive proactive support from
                    itinerary build to post-arrival.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 text-sm sm:grid-cols-3">
                {heroHighlights.map(highlight => {
                  const Icon = highlight.icon;
                  return (
                    <div
                      key={highlight.title}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 text-left shadow-sm backdrop-blur"
                    >
                      <Icon className="mt-1 h-5 w-5 text-primary" />
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{highlight.title}</p>
                        <p className="text-muted-foreground">{highlight.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={onSearch}
                className="grid grid-cols-1 gap-4 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-xl shadow-primary/5 backdrop-blur lg:grid-cols-6"
              >
                <div className="flex flex-col lg:col-span-2">
                  <label htmlFor="origin" className="mb-1 text-sm font-medium text-muted-foreground">
                    Origin airport
                  </label>
                  <input
                    id="origin"
                    name="origin"
                    placeholder="e.g. YYZ"
                    className="h-12 rounded-md border border-input bg-background px-3 py-2 uppercase"
                    required
                    value={formState.origin}
                    onChange={onInputChange("origin")}
                  />
                </div>

                <div className="flex flex-col lg:col-span-2">
                  <label htmlFor="destination" className="mb-1 text-sm font-medium text-muted-foreground">
                    Destination airport
                  </label>
                  <input
                    id="destination"
                    name="destination"
                    placeholder="e.g. NBO"
                    className="h-12 rounded-md border border-input bg-background px-3 py-2 uppercase"
                    required
                    value={formState.destination}
                    onChange={onInputChange("destination")}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="departureDate" className="mb-1 text-sm font-medium text-muted-foreground">
                    Departure date
                  </label>
                  <input
                    id="departureDate"
                    name="departureDate"
                    type="date"
                    min={todayInput}
                    className="h-12 rounded-md border border-input bg-background px-3 py-2"
                    required
                    value={formState.departureDate}
                    onChange={onInputChange("departureDate")}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="returnDate" className="mb-1 text-sm font-medium text-muted-foreground">
                    Return date (optional)
                  </label>
                  <input
                    id="returnDate"
                    name="returnDate"
                    type="date"
                    min={formState.departureDate || todayInput}
                    className="h-12 rounded-md border border-input bg-background px-3 py-2"
                    value={formState.returnDate}
                    onChange={onInputChange("returnDate")}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="adults" className="mb-1 text-sm font-medium text-muted-foreground">
                    Travellers
                  </label>
                  <input
                    id="adults"
                    name="adults"
                    type="number"
                    min={1}
                    className="h-12 rounded-md border border-input bg-background px-3 py-2"
                    value={formState.adults}
                    onChange={onInputChange("adults")}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="cabinClass" className="mb-1 text-sm font-medium text-muted-foreground">
                    Cabin
                  </label>
                  <select
                    id="cabinClass"
                    name="cabinClass"
                    className="h-12 rounded-md border border-input bg-background px-3 py-2"
                    value={formState.cabinClass}
                    onChange={onInputChange("cabinClass")}
                  >
                    <option value="economy">Economy</option>
                    <option value="premium_economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="lg:col-span-6 inline-flex h-12 items-center justify-center rounded-md bg-primary text-lg font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:bg-primary/70"
                >
                  {loading ? "Searching flights…" : "Search flights"}
                </button>

                <p className="lg:col-span-6 text-sm text-muted-foreground">
                  Prices shown combine the live airline fare with our concierge service fee. The fee is $75
                  per traveller for itineraries under $999 per person and $100 once fares reach $999 or more.
                </p>
              </form>

              {quickTrips.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Need inspiration?</p>
                    <span className="text-xs text-muted-foreground">
                      Select a curated route and adjust dates before searching.
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {quickTrips.map(trip => (
                      <button
                        key={trip.label}
                        type="button"
                        onClick={() => onQuickTripSelect(trip)}
                        className="group flex flex-col gap-1 rounded-xl border border-border/60 bg-card/70 px-4 py-3 text-left transition hover:border-primary hover:shadow-lg"
                      >
                        <span className="font-semibold text-foreground group-hover:text-primary">
                          {trip.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{trip.description}</span>
                        <span className="text-xs text-muted-foreground">
                          Departs in {trip.departureOffset} days
                          {typeof trip.returnOffset === "number" && trip.returnOffset > trip.departureOffset
                            ? ` · ${trip.returnOffset - trip.departureOffset} nights`
                            : ""}
                        </span>
                        {typeof trip.travellers === "number" && (
                          <span className="text-xs text-muted-foreground">
                            {trip.travellers} {trip.travellers === 1 ? "traveller" : "travellers"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="px-6 pb-24">
          <div className="mx-auto flex max-w-5xl flex-col gap-8">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}

            {resultsTitle && !loading && (
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-headline font-semibold">Available itineraries</h2>
                  <span className="text-sm text-muted-foreground">{resultsTitle}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pricing includes the airline fare plus our concierge service fee ($75 per traveller under
                  $999, $100 once fares reach $999 or more). Pay the airline via Duffel—we manage the support.
                </p>
              </div>
            )}

            {offers.length > 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-input"
                      checked={nonstopOnly}
                      onChange={event => setNonstopOnly(event.currentTarget.checked)}
                    />
                    Non-stop flights only
                  </label>
                  {filteredOut > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {filteredOut} option{filteredOut === 1 ? "" : "s"} hidden by filters
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Sort by</span>
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-foreground"
                    value={sortBy}
                    onChange={event => setSortBy(event.currentTarget.value as "price" | "duration")}
                  >
                    <option value="price">Lowest price</option>
                    <option value="duration">Shortest duration</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {loading && (
                <>
                  <div className="h-44 animate-pulse rounded-xl border border-border/60 bg-card" />
                  <div className="h-44 animate-pulse rounded-xl border border-border/60 bg-card" />
                </>
              )}

              {!loading && hasSearched && offers.length === 0 && !error && (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                  We couldn’t find flights for that search. Try adjusting your dates, cabin, or nearby
                  airports and search again.
                </div>
              )}

              {!loading && offers.length > 0 && displayOffers.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                  Your filters are hiding the available flights. Clear the non-stop filter or adjust sorting
                  to view options.
                </div>
              )}

              {displayOffers.map(offer => (
                <article
                  key={offer.id}
                  className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-md shadow-primary/5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-wide text-muted-foreground">
                        {offer.owner?.iata_code}
                      </p>
                      <h3 className="text-xl font-semibold text-foreground">
                        {offer.owner?.name ?? "Airline option"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {offer.slices.length > 1 ? "Return" : "One-way"} itinerary · {offer.slices.length} slice
                        {offer.slices.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right md:w-56">
                      <p className="text-2xl font-headline font-bold text-foreground">
                        {offer.pricing.display_total_amount} {offer.pricing.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {offer.pricing.display_per_ticket_amount} {offer.pricing.currency} per traveller
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Concierge fee {offer.pricing.markup_per_ticket} per traveller
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {offer.slices.map(slice => (
                      <div key={slice.id} className="rounded-xl border border-border/60 bg-muted/30 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Plane className="h-4 w-4 text-primary" />
                            <span>
                              {slice.origin} → {slice.destination}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatStops(slice)} · {formatDuration(slice.duration)}
                          </span>
                        </div>
                        <ol className="mt-3 space-y-3">
                          {slice.segments.map((segment, index) => (
                            <li
                              key={segmentKey(segment, index)}
                              className="flex flex-col gap-2 rounded-lg border border-border/40 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground">
                                  {formatDate(segment.departing_at)} → {formatDate(segment.arriving_at)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {segment.origin} to {segment.destination}
                                </p>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <p>{segment.carrier_name}</p>
                                {segment.marketing_flight && <p>{segment.marketing_flight}</p>}
                                {segment.aircraft_name && <p>{segment.aircraft_name}</p>}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/60 pt-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Review baggage allowances and change policies on the next step. Our concierge can add
                      seats, luggage, or special services after you reserve.
                    </p>
                    <Link
                      href={`/checkout?offer=${offer.id}&pax=${lastSearch?.adults ?? 1}`}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Select & checkout
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-muted/30 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold">How our travel concierge works</h2>
              <p className="mt-2 text-muted-foreground">
                A collaborative process that keeps your academic travel stress-free from planning to touchdown.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {journeySteps.map(step => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-6 text-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold">Why travellers choose Maple Leed</h2>
              <p className="mt-2 text-muted-foreground">
                Pair real-time airline content with seasoned advisors for a world-class booking experience.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {valueProps.map(prop => {
                const Icon = prop.icon;
                return (
                  <div
                    key={prop.title}
                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-6"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">{prop.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{prop.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-muted/20 py-16">
          <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold">Frequently asked questions</h2>
              <p className="mt-2 text-muted-foreground">
                Everything you need to know before you reserve seats for your next programme.
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map(faq => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-border/60 bg-card/80 p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

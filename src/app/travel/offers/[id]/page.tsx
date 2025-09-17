"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Luggage,
  Plane,
  ShieldCheck,
  Users,
} from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import {TravelStepIndicator} from "@/components/travel-step-indicator";
import type {OfferSummary, SegmentSummary} from "@/lib/travel";
import {
  travelSearchFromParams,
  travelSearchToParams,
} from "@/lib/travel-search";

const SEARCH_SECTION_ID = "flight-search";

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "";
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch (error) {
    return value ?? "";
  }
}

function formatDay(value?: string | null) {
  if (!value) return "";
  try {
    return dayFormatter.format(new Date(value));
  } catch (error) {
    return value ?? "";
  }
}

function formatTime(value?: string | null) {
  if (!value) return "";
  try {
    return timeFormatter.format(new Date(value));
  } catch (error) {
    return value ?? "";
  }
}

function durationToMinutes(duration?: string | null) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return 0;
  const [, hours = "0", minutes = "0", seconds = "0"] = match;
  const h = Number.parseInt(hours, 10) || 0;
  const m = Number.parseInt(minutes, 10) || 0;
  const s = Number.parseInt(seconds, 10) || 0;
  return h * 60 + m + Math.ceil(s / 60);
}

function formatMinutes(totalMinutes: number) {
  if (!totalMinutes || Number.isNaN(totalMinutes)) return "—";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.max(0, Math.round(totalMinutes % 60));
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.length ? parts.join(" ") : "0m";
}

function segmentKey(segment: SegmentSummary, index: number) {
  return segment.id || `${segment.marketing_flight}-${index}`;
}

function computeSliceStops(slice: {segments: SegmentSummary[]}) {
  return Math.max(0, (slice.segments?.length ?? 1) - 1);
}

function formatCurrency(amount: number, currency?: string | null) {
  if (!Number.isFinite(amount)) {
    return amount.toFixed(2);
  }
  if (!currency) {
    return amount.toFixed(2);
  }
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

type OfferDetailsPageProps = {
  params: {id: string};
  searchParams: {[key: string]: string | string[] | undefined};
};

type DuffelService = {
  id?: string;
  name?: string | null;
  total_amount?: string | null;
  currency?: string | null;
  description?: string | null;
};

export default function OfferDetailsPage({params, searchParams}: OfferDetailsPageProps) {
  const searchParamsHook = useSearchParams();
  const mergedParams = useMemo(() => {
    const entries: [string, string][] = [];
    searchParamsHook.forEach((value, key) => {
      entries.push([key, value]);
    });
    for (const key of Object.keys(searchParams)) {
      const value = searchParams[key];
      if (typeof value === "string") {
        entries.push([key, value]);
      } else if (Array.isArray(value)) {
        value.forEach(item => entries.push([key, item]));
      }
    }
    return new URLSearchParams(entries);
  }, [searchParams, searchParamsHook]);

  const searchContext = useMemo(() => travelSearchFromParams(mergedParams), [mergedParams]);
  const rawPax = mergedParams.get("pax");
  const passengerCount = useMemo(() => {
    const fromQuery = rawPax ? Number(rawPax) : searchContext.adults;
    const parsed = Number.isFinite(fromQuery) ? Number(fromQuery) : searchContext.adults;
    return Math.max(1, parsed || 1);
  }, [rawPax, searchContext.adults]);

  const [offer, setOffer] = useState<OfferSummary | null>(null);
  const [availableServices, setAvailableServices] = useState<DuffelService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const offerId = params.id;
    if (!offerId) {
      setError("No offer selected. Please return to the travel search.");
      setOffer(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/api/travel/offers/${offerId}?pax=${passengerCount}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(body => {
            throw new Error(body?.error || "Failed to load offer details");
          });
        }
        return response.json();
      })
      .then(data => {
        setOffer(data.offer);
        setAvailableServices(Array.isArray(data.available_services) ? data.available_services : []);
      })
      .catch(err => {
        console.error(err);
        setError(err?.message || "Unable to load offer details right now.");
      })
      .finally(() => setLoading(false));
  }, [params.id, passengerCount]);

  const checkoutParams = useMemo(() => {
    const base = travelSearchToParams({...searchContext, adults: passengerCount});
    base.set("pax", passengerCount.toString());
    return base;
  }, [passengerCount, searchContext]);

  const checkoutQuery = checkoutParams.toString();
  const checkoutHref = useMemo(() => {
    const prefix = `/checkout?offer=${params.id}`;
    return checkoutQuery ? `${prefix}&${checkoutQuery}` : prefix;
  }, [checkoutQuery, params.id]);

  const backParams = useMemo(() => travelSearchToParams({...searchContext, adults: passengerCount}), [passengerCount, searchContext]);
  const backQuery = backParams.toString();
  const backHref = useMemo(() => {
    const base = backQuery ? `/travel?${backQuery}` : "/travel";
    return `${base}#${SEARCH_SECTION_ID}`;
  }, [backQuery]);

  const totalAmount = useMemo(() => {
    if (!offer) return 0;
    return Number.parseFloat(offer.pricing?.display_total_amount ?? offer.pricing?.base_total_amount ?? "0");
  }, [offer]);

  const perTraveller = passengerCount > 0 ? totalAmount / passengerCount : totalAmount;
  const currency = offer?.pricing?.currency ?? undefined;

  const tripTitle = useMemo(() => {
    if (!offer) return "Review your MapleLeed itinerary";
    const slices = offer.slices ?? [];
    const firstSlice = slices[0];
    const lastSlice = slices[slices.length - 1];
    if (!firstSlice || !lastSlice) {
      return "Review your MapleLeed itinerary";
    }
    return `${firstSlice.origin} → ${lastSlice.destination}`;
  }, [offer]);

  const journeyDates = useMemo(() => {
    const outbound = searchContext.departureDate ? new Date(searchContext.departureDate).toLocaleDateString() : null;
    const inbound = searchContext.returnDate ? new Date(searchContext.returnDate).toLocaleDateString() : null;
    if (outbound && inbound) {
      return `${outbound} → ${inbound}`;
    }
    if (outbound) {
      return outbound;
    }
    return null;
  }, [searchContext.departureDate, searchContext.returnDate]);

  const supportHighlights = [
    {
      icon: ShieldCheck,
      title: "Concierge included",
      body: "Proactive monitoring, disruption care, and visa-ready documentation from booking to arrival.",
    },
    {
      icon: Users,
      title: "Traveller profiles",
      body: "We store passenger preferences, meal requests, and loyalty numbers for seamless future trips.",
    },
    {
      icon: Luggage,
      title: "Student baggage support",
      body: "Extra baggage guidance and letters for airline check-in so you can bring what you need for campus life.",
    },
  ];

  const preparationChecklist = [
    "Valid passport with at least six months of validity",
    "Visa or study permit documentation ready for airline review",
    "Payment method that matches the travelling passenger",
    "Emergency contact details to share with the airline",
  ];

  const travelTimeline = [
    {
      title: "Before departure",
      detail: "We send visa-ready confirmations, baggage allowances, and seat suggestions as soon as you confirm.",
    },
    {
      title: "Day of travel",
      detail: "Our concierge team monitors delays, reroutes, and check-in issues so you can focus on the journey ahead.",
    },
    {
      title: "Arrival support",
      detail: "Need airport transfer advice or onward tickets? Message us and we will coordinate your next steps to campus.",
    },
  ];

  const servicesToDisplay = availableServices.filter(service => service?.name);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 px-6 pb-24 pt-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
            >
              <ArrowLeft className="h-4 w-4" /> Back to results
            </Link>
            <span className="text-sm text-muted-foreground">
              {passengerCount === 1 ? "1 traveller" : `${passengerCount} travellers`}
            </span>
          </div>

          <TravelStepIndicator currentStep={2} />

          <div className="space-y-3">
            <h1 className="text-3xl font-headline font-bold">{tripTitle}</h1>
            <p className="text-muted-foreground">
              Double-check the itinerary MapleLeed found for you, see what our concierge includes, and continue to passenger
              details when you are ready.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {searchContext.origin && searchContext.destination && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                  <Plane className="h-3.5 w-3.5" /> {searchContext.origin} → {searchContext.destination}
                </span>
              )}
              {journeyDates && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                  <CalendarDays className="h-3.5 w-3.5" /> {journeyDates}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Users className="h-3.5 w-3.5" /> {passengerCount === 1 ? "Solo traveller" : `${passengerCount} travellers`}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {offer && (
            <div className="space-y-10">
              <section className="rounded-3xl border border-border bg-card/90 p-6 shadow-lg">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Total MapleLeed fare</p>
                    <p className="text-4xl font-headline font-bold">
                      {formatCurrency(totalAmount, currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(perTraveller, currency)} per traveller · Concierge support included in this one price
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link
                      href={checkoutHref}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Continue to passenger details
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      You will pay a single total. MapleLeed handles the concierge allocation behind the scenes while Duffel
                      settles the airline balance.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-headline font-semibold">Itinerary overview</h2>
                <div className="space-y-4">
                  {offer.slices.map(slice => {
                    const first = slice.segments?.[0];
                    const last = slice.segments?.[slice.segments.length - 1];
                    const stops = computeSliceStops(slice);
                    return (
                      <div
                        key={slice.id}
                        className="rounded-2xl border border-border bg-muted/10 p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              {slice.origin} → {slice.destination}
                            </p>
                            <p className="text-lg font-semibold">
                              {formatTime(first?.departing_at)} · {formatDay(first?.departing_at)} → {" "}
                              {formatTime(last?.arriving_at)} · {formatDay(last?.arriving_at)}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{formatMinutes(durationToMinutes(slice.duration))}</p>
                            <p>{stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`}</p>
                          </div>
                        </div>
                        <ol className="mt-4 space-y-3 text-sm">
                          {slice.segments.map((segment, index) => (
                            <li
                              key={segmentKey(segment, index)}
                              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="font-medium">
                                  {segment.origin} · {formatTime(segment.departing_at)} → {segment.destination} · {formatTime(segment.arriving_at)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {segment.carrier_name}
                                  {segment.marketing_flight ? ` · ${segment.marketing_flight}` : ""}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(segment.departing_at)}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-3">
                {supportHighlights.map(item => (
                  <div key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow">
                    <item.icon className="mb-3 h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-border bg-muted/10 p-6">
                <h2 className="text-xl font-semibold">Before you check out</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gather these items now so the checkout process stays smooth and MapleLeed can issue tickets immediately.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                  {preparationChecklist.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-border bg-card/90 p-6 shadow">
                <h2 className="text-xl font-semibold">Your concierge timeline</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {travelTimeline.map(stage => (
                    <div key={stage.title} className="rounded-xl border border-border/60 bg-background p-4">
                      <h3 className="text-lg font-semibold">{stage.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{stage.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              {servicesToDisplay.length > 0 && (
                <section className="rounded-2xl border border-border bg-muted/10 p-6">
                  <h2 className="text-xl font-semibold">Optional airline extras</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    After booking we can add these extras for you. Let our concierge know which services you would like.
                  </p>
                  <div className="mt-4 space-y-3">
                    {servicesToDisplay.map(service => (
                      <div
                        key={service.id ?? service.name}
                        className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/80 p-4 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold">{service.name}</p>
                          {service.total_amount && (
                            <span className="text-muted-foreground">
                              {formatCurrency(
                                Number.parseFloat(service.total_amount),
                                service.currency ?? currency,
                              )}
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-muted-foreground">{service.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {!offer && loading && (
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-3xl border border-border bg-card" />
              <div className="h-56 animate-pulse rounded-3xl border border-border bg-card" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import {FormEvent, useMemo, useRef, useState} from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Filter,
  PlaneTakeoff,
  Sparkles,
  Users,
} from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import type {OfferSummary, SegmentSummary} from "@/lib/travel";

type SearchState = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  adults: number;
  cabinClass: string;
};

type SortOption = "recommended" | "lowest-price" | "fastest" | "earliest";
type StopsFilter = "any" | "nonstop" | "1" | "2+";
type TimeFilter = "any" | "morning" | "afternoon" | "evening" | "overnight";

type EnrichedOffer = {
  offer: OfferSummary;
  price: number;
  totalDuration: number;
  departureDate: Date | null;
  departureMinutes: number | null;
  maxStops: number;
  stopsBySlice: number[];
  airlineName: string;
  airlineCode: string | null;
};

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

const SORT_OPTIONS: {value: SortOption; label: string}[] = [
  {value: "recommended", label: "Recommended"},
  {value: "lowest-price", label: "Lowest price"},
  {value: "fastest", label: "Fastest"},
  {value: "earliest", label: "Earliest departure"},
];

const STOP_FILTERS: {value: StopsFilter; label: string}[] = [
  {value: "any", label: "All"},
  {value: "nonstop", label: "Nonstop"},
  {value: "1", label: "Up to 1 stop"},
  {value: "2+", label: "2+ stops"},
];

const TIME_FILTERS: {value: TimeFilter; label: string}[] = [
  {value: "any", label: "Anytime"},
  {value: "morning", label: "Morning"},
  {value: "afternoon", label: "Afternoon"},
  {value: "evening", label: "Evening"},
  {value: "overnight", label: "Overnight"},
];

const HERO_HIGHLIGHTS = [
  {
    icon: PlaneTakeoff,
    title: "Global inventory",
    description: "Search 300+ airlines in real time through our Duffel partnership.",
  },
  {
    icon: Users,
    title: "Student-first fares",
    description: "Special attention to visas, baggage, and flexible change policies.",
  },
  {
    icon: Clock,
    title: "5-minute concierge",
    description: "Human support on WhatsApp before, during, and after your trip.",
  },
];

const HERO_STATS = [
  {label: "Airlines searched", value: "300+"},
  {label: "Countries served", value: "120"},
  {label: "Concierge satisfaction", value: "4.9/5"},
];

const SERVICE_PILLARS = [
  {
    title: "Visa-ready documentation",
    body: "Receive airline letters, insurance confirmation, and enrollment proofs ready for embassy appointments.",
  },
  {
    title: "Transparent concierge fees",
    body: "We add $75 per traveller under $999 and $100 for higher-value itineraries—no hidden extras when you check out.",
  },
  {
    title: "Proactive disruption care",
    body: "If delays happen we rebook, claim compensation, and keep you moving toward campus without extra stress.",
  },
];

const FAQ_ITEMS = [
  {
    question: "What is included in the concierge fee?",
    answer:
      "Our concierge service covers itinerary curation, visa-ready documentation, seat selection support, disruption management, and live travel chat. It is $75 per traveller for bookings under $999 total and $100 for higher-value trips.",
  },
  {
    question: "Can I pay separately for my flights and concierge support?",
    answer:
      "Yes. You will pay the airline directly through our Duffel checkout while MapleLeed charges the concierge fee. This keeps your airfare transparent and still gives you full support.",
  },
  {
    question: "Do you support multi-city or open-jaw itineraries?",
    answer:
      "Absolutely. Enter your first and last legs in the search and our travel team will follow up to build complex routes, including study abroad segments and internship placements.",
  },
];

const POPULAR_ROUTES = [
  {
    origin: "YYZ",
    destination: "LHR",
    note: "Average concierge-backed fare $865",
  },
  {
    origin: "SFO",
    destination: "SYD",
    note: "Round-trip with visa support",
  },
  {
    origin: "JFK",
    destination: "NBO",
    note: "Extra baggage for campus moves",
  },
];

const TIME_WINDOWS: Record<Exclude<TimeFilter, "any">, [number, number]> = {
  morning: [5 * 60, 11 * 60 + 59],
  afternoon: [12 * 60, 17 * 60 + 59],
  evening: [18 * 60, 21 * 60 + 59],
  overnight: [22 * 60, 23 * 60 + 59],
};

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

function formatMinutes(totalMinutes: number) {
  if (!totalMinutes || Number.isNaN(totalMinutes)) return "—";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.max(0, Math.round(totalMinutes % 60));
  const parts = [] as string[];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.length ? parts.join(" ") : "0m";
}

function segmentKey(segment: SegmentSummary, index: number) {
  return segment.id || `${segment.marketing_flight}-${index}`;
}

function parseMoney(value?: string | null) {
  if (!value) return 0;
  const amount = Number.parseFloat(String(value));
  return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(amount: number, currency?: string | null) {
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

function computeSliceStops(slice: {segments: SegmentSummary[]}) {
  return Math.max(0, (slice.segments?.length ?? 1) - 1);
}

function matchesTimeFilter(minutes: number | null, filter: TimeFilter) {
  if (filter === "any" || minutes == null) return true;
  if (filter === "overnight") {
    const [start] = TIME_WINDOWS.overnight;
    return minutes >= start || minutes <= 5 * 60;
  }
  const [start, end] = TIME_WINDOWS[filter];
  return minutes >= start && minutes <= end;
}

export default function TravelPage() {
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchState | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>("any");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("any");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const travellerCount = lastSearch?.adults ?? 1;

  const resultsTitle = useMemo(() => {
    if (!lastSearch) return null;
    const {origin, destination, departureDate, returnDate, adults} = lastSearch;
    const travellers = adults === 1 ? "1 traveller" : `${adults} travellers`;
    const outbound = new Date(departureDate).toLocaleDateString();
    const inbound = returnDate ? new Date(returnDate).toLocaleDateString() : null;
    return inbound
      ? `${origin} → ${destination} (${outbound}) · Return on ${inbound} · ${travellers}`
      : `${origin} → ${destination} (${outbound}) · ${travellers}`;
  }, [lastSearch]);

  const enrichedOffers = useMemo<EnrichedOffer[]>(() => {
    return offers.map(offer => {
      const price = parseMoney(offer.pricing?.display_total_amount ?? offer.pricing?.base_total_amount);
      const firstSlice = offer.slices[0];
      const firstSegment = firstSlice?.segments?.[0];
      const departureDate = firstSegment?.departing_at ? new Date(firstSegment.departing_at) : null;
      const departureMinutes = departureDate
        ? departureDate.getHours() * 60 + departureDate.getMinutes()
        : null;
      const stopsBySlice = offer.slices.map(slice => computeSliceStops(slice));
      const maxStops = stopsBySlice.length ? Math.max(...stopsBySlice) : 0;
      const totalDuration = offer.slices.reduce(
        (total, slice) => total + durationToMinutes(slice.duration),
        0,
      );
      const airlineName = offer.owner?.name?.trim() || offer.owner?.iata_code?.trim() || "Partner airline";
      const airlineCode = offer.owner?.iata_code ?? null;

      return {
        offer,
        price,
        totalDuration,
        departureDate,
        departureMinutes,
        maxStops,
        stopsBySlice,
        airlineName,
        airlineCode,
      } satisfies EnrichedOffer;
    });
  }, [offers]);

  const airlineOptions = useMemo(() => {
    const map = new Map<string, {name: string; code: string | null; count: number}>();
    enrichedOffers.forEach(item => {
      const key = item.airlineName;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {name: item.airlineName, code: item.airlineCode, count: 1});
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [enrichedOffers]);

  const filteredOffers = useMemo(() => {
    return enrichedOffers.filter(item => {
      if (stopsFilter === "nonstop" && item.maxStops !== 0) return false;
      if (stopsFilter === "1" && item.maxStops > 1) return false;
      if (stopsFilter === "2+" && item.maxStops < 2) return false;
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(item.airlineName)) return false;
      if (!matchesTimeFilter(item.departureMinutes, timeFilter)) return false;
      return true;
    });
  }, [enrichedOffers, stopsFilter, selectedAirlines, timeFilter]);

  const sortedOffers = useMemo(() => {
    const list = [...filteredOffers];
    switch (sortOption) {
      case "lowest-price":
        list.sort((a, b) => a.price - b.price);
        break;
      case "fastest":
        list.sort((a, b) => a.totalDuration - b.totalDuration);
        break;
      case "earliest":
        list.sort((a, b) => {
          const aTime = a.departureMinutes ?? Number.POSITIVE_INFINITY;
          const bTime = b.departureMinutes ?? Number.POSITIVE_INFINITY;
          return aTime - bTime;
        });
        break;
      case "recommended":
      default:
        list.sort((a, b) => {
          const scoreA = a.price + a.totalDuration / 60;
          const scoreB = b.price + b.totalDuration / 60;
          return scoreA - scoreB;
        });
        break;
    }
    return list;
  }, [filteredOffers, sortOption]);

  const analytics = useMemo(() => {
    if (filteredOffers.length === 0) return null;

    const cheapest = filteredOffers.reduce<EnrichedOffer | null>((best, current) => {
      if (!Number.isFinite(current.price) || current.price <= 0) return best;
      if (!best || current.price < best.price) return current;
      return best;
    }, null);

    const fastest = filteredOffers.reduce<EnrichedOffer | null>((best, current) => {
      if (!Number.isFinite(current.totalDuration) || current.totalDuration <= 0) return best;
      if (!best || current.totalDuration < best.totalDuration) return current;
      return best;
    }, null);

    const priceValues = filteredOffers
      .map(item => item.price)
      .filter(value => Number.isFinite(value) && value > 0) as number[];

    const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
    const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;
    const averagePrice = priceValues.length
      ? priceValues.reduce((sum, value) => sum + value, 0) / priceValues.length
      : 0;

    const currency =
      cheapest?.offer.pricing?.currency ??
      fastest?.offer.pricing?.currency ??
      filteredOffers[0]?.offer.pricing?.currency ??
      "USD";

    return {
      cheapest,
      fastest,
      minPrice,
      maxPrice,
      averagePrice,
      currency,
    };
  }, [filteredOffers]);

  const visibleOffers = sortedOffers;
  const activeFilterCount =
    (stopsFilter !== "any" ? 1 : 0) +
    (timeFilter !== "any" ? 1 : 0) +
    (selectedAirlines.length > 0 ? 1 : 0);
  const isFiltering = activeFilterCount > 0;

  function toggleAirline(name: string) {
    setSelectedAirlines(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name],
    );
  }

  function clearFilters() {
    setStopsFilter("any");
    setTimeFilter("any");
    setSelectedAirlines([]);
  }

  function applyPopularRoute(origin: string, destination: string) {
    const form = formRef.current;
    if (!form) return;
    const originField = form.elements.namedItem("origin");
    const destinationField = form.elements.namedItem("destination");

    if (originField instanceof HTMLInputElement) {
      originField.value = origin;
      originField.focus();
    }

    if (destinationField instanceof HTMLInputElement) {
      destinationField.value = destination;
    }
  }

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: SearchState = {
      origin: String(formData.get("origin") ?? "").toUpperCase(),
      destination: String(formData.get("destination") ?? "").toUpperCase(),
      departureDate: String(formData.get("departureDate") ?? ""),
      returnDate: (formData.get("returnDate") as string) || null,
      adults: Math.max(1, Number(formData.get("adults") ?? 1)),
      cabinClass: String(formData.get("cabinClass") ?? "economy"),
    };

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setOffers([]);
    setSortOption("recommended");
    setStopsFilter("any");
    setTimeFilter("any");
    setSelectedAirlines([]);

    try {
      const response = await fetch("/api/travel/search", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const {error: message} = await response.json().catch(() => ({error: ""}));
        throw new Error(message || "Search request failed. Please try again.");
      }

      const data = await response.json();
      setOffers(data.offers ?? []);
      setLastSearch({...payload, adults: data.passengers ?? payload.adults});
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
      console.error(err);
      setError(err?.message ?? "We couldn’t reach the flight search service.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  }

  const searchSectionId = "flight-search";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-slate-950 pb-24 pt-28 text-slate-50 sm:pt-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-6">
            <div className="grid gap-12 lg:grid-cols-[1.5fr,1fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                  <Sparkles className="h-4 w-4" /> Global study travel concierge
                </span>
                <h1 className="text-4xl font-headline font-bold sm:text-5xl">
                  Book smarter flights with MapleLeed Travel Concierge
                </h1>
                <p className="max-w-2xl text-lg text-slate-200">
                  Compare real-time Duffel fares, add our concierge fee—$75 per traveller for trips
                  under $999 total and $100 for higher fares—and checkout in minutes. We stay with you
                  until you arrive on campus.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {HERO_HIGHLIGHTS.map(feature => (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm shadow-lg backdrop-blur"
                    >
                      <feature.icon className="mb-3 h-6 w-6 text-primary-foreground" />
                      <p className="font-semibold text-white">{feature.title}</p>
                      <p className="text-slate-200/80">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Why students trust us</h2>
                  <ul className="space-y-4 text-sm text-slate-100/80">
                    <li className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Average concierge response time under five minutes.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Special handling for group bookings and student baggage allowances.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Visa-ready documentation included with every confirmed itinerary.</span>
                    </li>
                  </ul>
                </div>
                <div className="grid gap-3">
                  {HERO_STATS.map(stat => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm text-white/70">{stat.label}</span>
                      <span className="text-lg font-semibold text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-white/80">Popular student journeys</p>
                <p className="text-xs uppercase tracking-wider text-white/60">Tap to pre-fill search</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {POPULAR_ROUTES.map(route => (
                  <button
                    key={`${route.origin}-${route.destination}`}
                    type="button"
                    onClick={() => applyPopularRoute(route.origin, route.destination)}
                    className="flex flex-col rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left text-sm text-white/90 transition hover:border-primary/80 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    <span className="font-semibold">{route.origin} → {route.destination}</span>
                    <span className="text-xs text-white/70">{route.note}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id={searchSectionId} className="relative -mt-16 px-6 pb-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-10">
            <form
              ref={formRef}
              onSubmit={onSearch}
              className="grid grid-cols-1 gap-4 rounded-3xl border border-border bg-card/95 p-6 shadow-2xl backdrop-blur lg:grid-cols-6"
            >
              <div className="lg:col-span-2 flex flex-col">
                <label htmlFor="origin" className="mb-1 text-sm font-medium text-muted-foreground">
                  Origin airport
                </label>
                <input
                  id="origin"
                  name="origin"
                  placeholder="e.g. YYZ"
                  className="h-12 rounded-md border border-input bg-background px-3 py-2 uppercase"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="lg:col-span-2 flex flex-col">
                <label htmlFor="destination" className="mb-1 text-sm font-medium text-muted-foreground">
                  Destination airport
                </label>
                <input
                  id="destination"
                  name="destination"
                  placeholder="e.g. NBO"
                  className="h-12 rounded-md border border-input bg-background px-3 py-2 uppercase"
                  autoComplete="off"
                  required
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
                  className="h-12 rounded-md border border-input bg-background px-3 py-2"
                  required
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
                  className="h-12 rounded-md border border-input bg-background px-3 py-2"
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
                  defaultValue={1}
                  className="h-12 rounded-md border border-input bg-background px-3 py-2"
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
                  defaultValue="economy"
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
            </form>

            {error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}

            {resultsTitle && !loading && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-headline font-semibold">Available itineraries</h2>
                  <span className="text-sm text-muted-foreground">{resultsTitle}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pricing includes airline fares plus our concierge fee—$75 per traveller under $999
                  total or $100 per traveller above that threshold. Pay airlines via Duffel, MapleLeed
                  handles the support fee.
                </p>
              </div>
            )}

            {lastSearch && (
              <div className="space-y-5">
                <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>
                        Showing {visibleOffers.length} of {offers.length} itineraries
                      </span>
                      {isFiltering && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="sort" className="text-sm font-medium text-muted-foreground">
                        Sort
                      </label>
                      <select
                        id="sort"
                        value={sortOption}
                        onChange={event => setSortOption(event.target.value as SortOption)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {SORT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={clearFilters}
                        disabled={!isFiltering}
                        className="text-sm font-medium text-primary transition hover:underline disabled:text-muted-foreground"
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Stops
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STOP_FILTERS.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setStopsFilter(option.value)}
                            className={`rounded-full border px-3 py-1 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              stopsFilter === option.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/60"
                            }`}
                            aria-pressed={stopsFilter === option.value}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Departure time
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TIME_FILTERS.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTimeFilter(option.value)}
                            className={`rounded-full border px-3 py-1 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              timeFilter === option.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/60"
                            }`}
                            aria-pressed={timeFilter === option.value}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Airline
                      </p>
                      <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
                        {airlineOptions.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            Search to unlock carrier filters.
                          </span>
                        )}
                        {airlineOptions.map(option => (
                          <button
                            key={option.name}
                            type="button"
                            onClick={() => toggleAirline(option.name)}
                            className={`rounded-full border px-3 py-1 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              selectedAirlines.includes(option.name)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/60"
                            }`}
                            aria-pressed={selectedAirlines.includes(option.name)}
                          >
                            {option.name}
                            {option.code ? ` (${option.code})` : ""}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {option.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {analytics && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-border bg-card/90 p-5 shadow">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Average concierge total
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        {formatCurrency(analytics.averagePrice, analytics.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Range {formatCurrency(analytics.minPrice, analytics.currency)} –
                        {" "}
                        {formatCurrency(analytics.maxPrice, analytics.currency)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-border bg-card/90 p-5 shadow">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Cheapest itinerary right now
                      </p>
                      {analytics.cheapest ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-lg font-semibold">
                            {analytics.cheapest.offer.owner?.name ?? "Airline option"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(analytics.cheapest.price, analytics.currency)} total
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatMinutes(analytics.cheapest.totalDuration)} overall journey
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          We’ll surface the lowest fare once results arrive.
                        </p>
                      )}
                    </div>
                    <div className="rounded-3xl border border-border bg-card/90 p-5 shadow">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Fastest itinerary tracked
                      </p>
                      {analytics.fastest ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-lg font-semibold">
                            {analytics.fastest.offer.owner?.name ?? "Airline option"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatMinutes(analytics.fastest.totalDuration)} gate-to-gate
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Departs {analytics.fastest.departureDate ? formatDay(analytics.fastest.departureDate.toISOString()) : "soon"}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Fastest option will appear after your search.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6">
              {loading && (
                <div className="h-40 animate-pulse rounded-3xl border border-border bg-card" />
              )}

              {!loading && offers.length === 0 && lastSearch && !error && (
                <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                  We couldn’t find flights for that search. Try adjusting your dates or airports and
                  our concierge team will help.
                </div>
              )}

              {visibleOffers.map(item => {
                const {offer, totalDuration, price, maxStops} = item;
                const totalPrice = price;
                const currency = offer.pricing.currency;
                const markupPerTicket = parseMoney(offer.pricing.markup_per_ticket);
                const perTraveller = travellerCount > 0 ? totalPrice / travellerCount : totalPrice;
                const firstSlice = offer.slices[0];
                const firstSegment = firstSlice?.segments?.[0];

                return (
                  <article
                    key={offer.id}
                    className="space-y-6 rounded-3xl border border-border bg-card/95 p-6 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="uppercase tracking-wide">
                            {offer.owner?.iata_code}
                          </span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {maxStops === 0 ? "Nonstop" : `${maxStops} stop${maxStops > 1 ? "s" : ""}`}
                          </span>
                        </div>
                        <h3 className="text-2xl font-semibold">
                          {offer.owner?.name ?? "Airline option"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {firstSegment?.departing_at && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {formatDay(firstSegment.departing_at)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {formatMinutes(totalDuration)} total
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total including concierge</p>
                        <p className="text-3xl font-headline font-bold">
                          {formatCurrency(totalPrice, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(perTraveller, currency)} per traveller · Concierge fee
                          {" "}
                          {formatCurrency(markupPerTicket, currency)} each
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {offer.slices.map(slice => {
                        const first = slice.segments?.[0];
                        const last = slice.segments?.[slice.segments.length - 1];
                        const stops = computeSliceStops(slice);
                        return (
                          <div
                            key={slice.id}
                            className="rounded-2xl border border-border/60 bg-muted/10 p-4"
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
                                      {segment.origin} · {formatTime(segment.departing_at)} → {segment.destination} ·
                                      {" "}
                                      {formatTime(segment.arriving_at)}
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

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        Flexible changes and baggage allowances depend on the airline. Review on the
                        next step before checkout—our concierge will stay in touch.
                      </p>
                      <Link
                        href={`/checkout?offer=${offer.id}&pax=${travellerCount}`}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90"
                      >
                        Select & checkout
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-muted/10 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-headline font-semibold">Why MapleLeed students fly better</h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              We combine global airline technology with human travel experts. Every itinerary is
              inspected for visa compliance, baggage allowances, and emergency rerouting options
              before you pay.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {SERVICE_PILLARS.map(pillar => (
                <div key={pillar.title} className="rounded-3xl border border-border bg-card p-6 shadow-lg">
                  <h3 className="text-lg font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-headline font-semibold text-center">Frequently asked questions</h2>
            <p className="mt-3 text-center text-muted-foreground">
              Still wondering how MapleLeed makes international study travel seamless? Here are the
              answers students ask most.
            </p>
            <div className="mt-8 space-y-4">
              {FAQ_ITEMS.map(item => (
                <details
                  key={item.question}
                  className="group rounded-3xl border border-border bg-card p-5 shadow-lg"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-lg font-semibold">
                    {item.question}
                    <span className="text-sm text-primary transition group-open:rotate-90">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-headline font-semibold">Ready to lock in your study trip?</h2>
            <p className="mt-4 text-lg">
              Start a search, secure your seats with transparent concierge pricing, and travel with a
              MapleLeed expert on call.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={`#${searchSectionId}`}
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 font-semibold text-primary transition hover:bg-white/90"
              >
                Search flights now
              </Link>
              <Link
                href="/study"
                className="inline-flex items-center justify-center rounded-md border border-white px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Explore study services
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import {FormEvent, useMemo, useState} from "react";
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

const formatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "";
  try {
    return formatter.format(new Date(value));
  } catch (error) {
    return value ?? "";
  }
}

function formatDuration(duration?: string | null) {
  if (!duration) return "";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const [, hours, minutes] = match;
  const parts = [] as string[];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(" ");
}

function segmentKey(segment: SegmentSummary, index: number) {
  return segment.id || `${segment.marketing_flight}-${index}`;
}

export default function TravelPage() {
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchState | null>(null);

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
      setOffers(data.offers ?? []);
      setLastSearch({...payload, adults: data.passengers ?? payload.adults});
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "We couldn’t reach the flight search service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="px-6 pb-24 pt-24 w-full">
        <section className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-headline font-bold">Plan your journey</h1>
            <p className="text-muted-foreground text-lg">
              Search real-time Duffel flights, add our $75 travel concierge fee per traveller, and
              lock in your seat in just a few clicks.
            </p>
          </div>

          <form
            onSubmit={onSearch}
            className="grid grid-cols-1 lg:grid-cols-6 gap-4 border p-6 rounded-xl bg-card shadow-xl"
          >
            <div className="lg:col-span-2 flex flex-col">
              <label htmlFor="origin" className="text-sm font-medium text-muted-foreground mb-1">
                Origin airport
              </label>
              <input
                id="origin"
                name="origin"
                placeholder="e.g. YYZ"
                className="border border-input bg-background rounded-md px-3 py-2 h-12 uppercase"
                required
              />
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <label
                htmlFor="destination"
                className="text-sm font-medium text-muted-foreground mb-1"
              >
                Destination airport
              </label>
              <input
                id="destination"
                name="destination"
                placeholder="e.g. NBO"
                className="border border-input bg-background rounded-md px-3 py-2 h-12 uppercase"
                required
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="departureDate"
                className="text-sm font-medium text-muted-foreground mb-1"
              >
                Departure date
              </label>
              <input
                id="departureDate"
                name="departureDate"
                type="date"
                className="border border-input bg-background rounded-md px-3 py-2 h-12"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="returnDate" className="text-sm font-medium text-muted-foreground mb-1">
                Return date (optional)
              </label>
              <input
                id="returnDate"
                name="returnDate"
                type="date"
                className="border border-input bg-background rounded-md px-3 py-2 h-12"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="adults" className="text-sm font-medium text-muted-foreground mb-1">
                Travellers
              </label>
              <input
                id="adults"
                name="adults"
                type="number"
                min={1}
                defaultValue={1}
                className="border border-input bg-background rounded-md px-3 py-2 h-12"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cabinClass" className="text-sm font-medium text-muted-foreground mb-1">
                Cabin
              </label>
              <select
                id="cabinClass"
                name="cabinClass"
                className="border border-input bg-background rounded-md px-3 py-2 h-12"
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
              className="lg:col-span-6 bg-primary text-primary-foreground rounded-md h-12 flex items-center justify-center font-semibold text-lg transition hover:bg-primary/90 disabled:bg-primary/70"
            >
              {loading ? "Searching flights…" : "Search flights"}
            </button>
          </form>

          {error && (
            <div className="border border-destructive/50 bg-destructive/10 text-destructive rounded-lg p-4">
              {error}
            </div>
          )}

          {resultsTitle && !loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-headline font-semibold">Available itineraries</h2>
                <span className="text-sm text-muted-foreground">{resultsTitle}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Pricing includes airline fare plus our $75 student concierge fee per traveller. Pay the
                airline via Duffel, we keep the support fee.
              </p>
            </div>
          )}

          <div className="grid gap-6">
            {loading && (
              <div className="border border-border rounded-xl bg-card shadow animate-pulse h-40" />
            )}

            {!loading && offers.length === 0 && lastSearch && !error && (
              <div className="border border-dashed border-border rounded-xl bg-card p-8 text-center text-muted-foreground">
                We couldn’t find flights for that search. Try adjusting your dates or airports.
              </div>
            )}

            {offers.map(offer => (
              <article
                key={offer.id}
                className="border border-border rounded-xl bg-card shadow-md p-6 space-y-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">
                      {offer.owner?.iata_code}
                    </p>
                    <h3 className="text-xl font-semibold">{offer.owner?.name ?? "Airline option"}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total including fees</p>
                    <p className="text-2xl font-headline font-bold">
                      {offer.pricing.display_total_amount} {offer.pricing.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Base fare {offer.pricing.base_total_amount} + {offer.pricing.markup_total} concierge fee
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {offer.slices.map(slice => (
                    <div key={slice.id} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium">
                          {slice.origin} → {slice.destination}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(slice.duration)}
                        </span>
                      </div>
                      <ol className="mt-3 space-y-3">
                        {slice.segments.map((segment, index) => (
                          <li key={segmentKey(segment, index)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-semibold">
                                {formatDate(segment.departing_at)} → {formatDate(segment.arriving_at)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {segment.origin} to {segment.destination}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                              <p>{segment.carrier_name}</p>
                              {segment.marketing_flight && <p>{segment.marketing_flight}</p>}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Flexible changes and baggage allowances depend on the airline. Review on the next
                    step before checkout.
                  </p>
                  <Link
                    href={`/checkout?offer=${offer.id}&pax=${lastSearch?.adults ?? 1}`}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    Select & checkout
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

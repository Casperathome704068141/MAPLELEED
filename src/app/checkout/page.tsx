"use client";

import Link from "next/link";
import {ChangeEvent, FormEvent, useEffect, useMemo, useState} from "react";
import {ArrowLeft, CheckCircle2, ShieldCheck} from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import {TravelStepIndicator} from "@/components/travel-step-indicator";
import type {OfferSummary, SegmentSummary} from "@/lib/travel";
import {
  travelSearchFromParams,
  travelSearchToParams,
} from "@/lib/travel-search";

type PassengerForm = {
  title: string;
  given_name: string;
  family_name: string;
  born_on: string;
  email: string;
  phone_number: string;
};

type ContactForm = {
  email: string;
  phone_number: string;
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
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(" ");
}

function parseAmount(value?: string | null) {
  if (!value) return 0;
  const amount = Number.parseFloat(String(value));
  return Number.isFinite(amount) ? amount : 0;
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

const SEARCH_SECTION_ID = "flight-search";

function segmentKey(segment: SegmentSummary, index: number) {
  return segment.id || `${segment.marketing_flight}-${index}`;
}

function createPassengerForms(count: number): PassengerForm[] {
  return Array.from({length: count}).map(() => ({
    title: "mr",
    given_name: "",
    family_name: "",
    born_on: "",
    email: "",
    phone_number: "",
  }));
}

type CheckoutProps = {
  searchParams: {
    offer?: string;
    pax?: string;
  };
};

export default function Checkout({searchParams}: CheckoutProps) {
  const offerId = searchParams.offer ?? "";
  const searchContext = useMemo(() => travelSearchFromParams(searchParams), [searchParams]);
  const passengerCount = useMemo(() => {
    const raw = searchParams.pax ?? searchContext.adults ?? 1;
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return Math.max(1, Number(searchContext.adults ?? 1));
    }
    return Math.max(1, value);
  }, [searchContext.adults, searchParams.pax]);

  const [offer, setOffer] = useState<OfferSummary | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [passengers, setPassengers] = useState<PassengerForm[]>(() =>
    createPassengerForms(passengerCount),
  );
  const [contact, setContact] = useState<ContactForm>({email: "", phone_number: ""});
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const reviewQuery = useMemo(() => {
    const params = travelSearchToParams({...searchContext, adults: passengerCount});
    params.set("pax", passengerCount.toString());
    return params.toString();
  }, [passengerCount, searchContext]);

  const reviewHref = useMemo(() => {
    if (!offerId) {
      return reviewQuery ? `/travel?${reviewQuery}#${SEARCH_SECTION_ID}` : "/travel";
    }
    return reviewQuery ? `/travel/offers/${offerId}?${reviewQuery}` : `/travel/offers/${offerId}`;
  }, [offerId, reviewQuery]);

  const searchHref = useMemo(() => {
    return reviewQuery ? `/travel?${reviewQuery}#${SEARCH_SECTION_ID}` : "/travel";
  }, [reviewQuery]);

  const totalAmount = useMemo(() => {
    if (!offer) return 0;
    return parseAmount(offer.pricing?.display_total_amount ?? offer.pricing?.base_total_amount);
  }, [offer]);

  const perTraveller = passengerCount > 0 ? totalAmount / passengerCount : totalAmount;
  const offerCurrency = offer?.pricing?.currency;

  useEffect(() => {
    if (!offerId) {
      setLoadError("No offer selected. Please return to the travel search.");
      setOffer(null);
    }
  }, [offerId]);

  useEffect(() => {
    setPassengers(prev => {
      if (prev.length === passengerCount) return prev;
      return createPassengerForms(passengerCount);
    });
  }, [passengerCount]);

  useEffect(() => {
    if (!offerId) return;
    setLoadingOffer(true);
    setLoadError(null);
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
      })
      .catch(error => {
        console.error(error);
        setLoadError(error.message || "Unable to load offer details.");
      })
      .finally(() => setLoadingOffer(false));
  }, [offerId, passengerCount]);

  const missingPassengerDetails = passengers.some(passenger =>
    !passenger.given_name ||
    !passenger.family_name ||
    !passenger.born_on ||
    !passenger.email ||
    !passenger.phone_number,
  );

  const missingContact = !contact.email || !contact.phone_number;

  const canSubmit = !missingPassengerDetails && !missingContact && !booking && !loadingOffer && !!offer;
  const currentStep = bookingResult ? 4 : 3;
  const bookingTotal = bookingResult
    ? parseAmount(bookingResult.pricing?.display_total_amount ?? bookingResult.pricing?.base_total_amount)
    : 0;
  const bookingCurrency = bookingResult?.pricing?.currency;

  function updatePassenger(index: number, field: keyof PassengerForm, value: string) {
    setPassengers(prev =>
      prev.map((passenger, idx) =>
        idx === index
          ? {
              ...passenger,
              [field]: value,
            }
          : passenger,
      ),
    );
  }

  function onPassengerChange(index: number, field: keyof PassengerForm) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.currentTarget.value;
      updatePassenger(index, field, value);
      if (index === 0 && (field === "email" || field === "phone_number")) {
        setContact(prev => ({
          ...prev,
          [field]: prev[field] ? prev[field] : value,
        }));
      }
    };
  }

  async function book(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!offer || !canSubmit) return;

    setBooking(true);
    setBookingError(null);
    setBookingResult(null);

    try {
      const payload = {
        offerId,
        passengers: passengers.map((passenger, index) => ({
          id: `pas_${index + 1}`,
          type: "adult",
          title: passenger.title,
          given_name: passenger.given_name,
          family_name: passenger.family_name,
          born_on: passenger.born_on,
          email: passenger.email,
          phone_number: passenger.phone_number,
        })),
        contact,
      };

      const response = await fetch("/api/travel/book", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let body: any = null;
      if (rawText) {
        try {
          body = JSON.parse(rawText);
        } catch (parseError) {
          console.error("Failed to parse booking response", parseError, rawText);
        }
      }

      if (!response.ok) {
        let message = "Booking failed. Please review passenger details.";
        if (body && typeof body.error === "string") {
          message = body.error;
        } else if (body && Array.isArray(body.error) && body.error.length) {
          message = body.error[0]?.message ?? message;
        } else if (rawText && !body) {
          message = rawText;
        }
        throw new Error(message);
      }

      if (!body) {
        throw new Error(
          "Booking succeeded but we couldn't read the confirmation. Please contact MapleLeed support.",
        );
      }

      setBookingResult(body);
    } catch (error: any) {
      console.error(error);
      setBookingError(error?.message ?? "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="px-6 pb-24 pt-24 w-full">
        <section className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={reviewHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
            >
              <ArrowLeft className="h-4 w-4" /> Back to itinerary
            </Link>
            <Link
              href={searchHref}
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              Modify search
            </Link>
          </div>

          <TravelStepIndicator currentStep={currentStep} />

          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Passenger details & checkout</h1>
            <p className="text-muted-foreground">
              We’ll issue your tickets with Duffel and bundle MapleLeed concierge support into one transparent price.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {searchContext.origin && searchContext.destination && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                  {searchContext.origin} → {searchContext.destination}
                </span>
              )}
              {searchContext.departureDate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                  Depart {new Date(searchContext.departureDate).toLocaleDateString()}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                {passengerCount === 1 ? "1 traveller" : `${passengerCount} travellers`}
              </span>
            </div>
          </div>

          {loadError && (
            <div className="border border-destructive/50 bg-destructive/10 text-destructive rounded-lg p-4">
              {loadError}
            </div>
          )}

          {offer && (
            <div className="border border-border rounded-xl bg-card shadow-md p-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {offer.owner?.iata_code}
                  </p>
                  <h2 className="text-xl font-semibold">{offer.owner?.name ?? "Selected flight"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {passengerCount === 1 ? "1 traveller" : `${passengerCount} travellers`}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">All-in MapleLeed fare</p>
                  <p className="text-3xl font-headline font-bold">
                    {formatCurrency(totalAmount, offerCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(perTraveller, offerCurrency)} per traveller · MapleLeed concierge care included
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-1 h-4 w-4 text-primary" />
                <p>
                  MapleLeed manages airline ticketing through Duffel and keeps a concierge expert beside you before, during,
                  and after your trip.
                </p>
              </div>

              <div className="space-y-4">
                {offer.slices.map(slice => (
                  <div key={slice.id} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium">
                        {slice.origin} → {slice.destination}
                      </p>
                      <span className="text-sm text-muted-foreground">{formatDuration(slice.duration)}</span>
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
            </div>
          )}

          <form onSubmit={book} className="border border-border rounded-xl bg-card shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Passenger information</h2>
              <p className="text-sm text-muted-foreground">
                We require a valid email and phone number for each traveller in case the airline needs to
                reach you.
              </p>
            </div>

            <div className="space-y-6">
              {passengers.map((passenger, index) => (
                <div key={index} className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Traveller {index + 1}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                      <label htmlFor={`title-${index}`} className="text-sm text-muted-foreground mb-1">
                        Title
                      </label>
                      <select
                        id={`title-${index}`}
                        className="border border-input bg-background rounded-md px-3 py-2 h-11"
                        value={passenger.title}
                        onChange={onPassengerChange(index, "title")}
                      >
                        <option value="mr">Mr</option>
                        <option value="mrs">Mrs</option>
                        <option value="ms">Ms</option>
                        <option value="miss">Miss</option>
                        <option value="dr">Dr</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`given-${index}`} className="text-sm text-muted-foreground mb-1">
                        Given name
                      </label>
                      <input
                        id={`given-${index}`}
                        className="border border-input bg-background rounded-md px-3 py-2 h-11"
                        value={passenger.given_name}
                        onChange={onPassengerChange(index, "given_name")}
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`family-${index}`} className="text-sm text-muted-foreground mb-1">
                        Family name
                      </label>
                      <input
                        id={`family-${index}`}
                        className="border border-input bg-background rounded-md px-3 py-2 h-11"
                        value={passenger.family_name}
                        onChange={onPassengerChange(index, "family_name")}
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`dob-${index}`} className="text-sm text-muted-foreground mb-1">
                        Date of birth
                      </label>
                      <input
                        id={`dob-${index}`}
                        type="date"
                        className="border border-input bg-background rounded-md px-3 py-2 h-11"
                        value={passenger.born_on}
                        onChange={onPassengerChange(index, "born_on")}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label htmlFor={`email-${index}`} className="text-sm text-muted-foreground mb-1">
                        Email
                      </label>
                      <input
                        id={`email-${index}`}
                        type="email"
                        className="border border-input bg-background rounded-md px-3 py-2 h-11"
                        value={passenger.email}
                        onChange={onPassengerChange(index, "email")}
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor={`phone-${index}`} className="text-sm text-muted-foreground mb-1">
                        Phone number
                      </label>
                      <input
                        id={`phone-${index}`}
                        type="tel"
                        className="border border-input bg-background rounded-md px-3 py-2 h-11"
                        value={passenger.phone_number}
                        onChange={onPassengerChange(index, "phone_number")}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Primary contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="contact-email" className="text-sm text-muted-foreground mb-1">
                    Contact email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="border border-input bg-background rounded-md px-3 py-2 h-11"
                    value={contact.email}
                    onChange={event => setContact(prev => ({...prev, email: event.currentTarget.value}))}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="contact-phone" className="text-sm text-muted-foreground mb-1">
                    Contact phone number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="border border-input bg-background rounded-md px-3 py-2 h-11"
                    value={contact.phone_number}
                    onChange={event =>
                      setContact(prev => ({...prev, phone_number: event.currentTarget.value}))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {bookingError && (
              <div className="border border-destructive/50 bg-destructive/10 text-destructive rounded-lg p-4">
                {bookingError}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-primary text-primary-foreground rounded-md h-12 flex items-center justify-center font-semibold text-lg disabled:bg-primary/70"
            >
              {booking ? "Confirming…" : "Confirm & book"}
            </button>
          </form>

          {bookingResult && (
            <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Booking confirmed</h2>
                  <p className="text-sm text-muted-foreground">
                    MapleLeed is emailing your itinerary and concierge welcome pack within the next few minutes.
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-foreground">Order ID</dt>
                  <dd className="text-muted-foreground">{bookingResult.order_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Booking reference</dt>
                  <dd className="text-muted-foreground">{bookingResult.booking_reference}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Status</dt>
                  <dd className="text-muted-foreground">{bookingResult.status}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Total paid</dt>
                  <dd className="text-muted-foreground">
                    {formatCurrency(bookingTotal, bookingCurrency)}
                  </dd>
                </div>
              </dl>
              {Array.isArray(bookingResult.documents) && bookingResult.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground">Travel documents</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {bookingResult.documents.map((doc: any) => (
                      <li key={doc.id ?? doc.unique_identifier}>
                        {doc.type?.toUpperCase()}: {doc.unique_identifier ?? "Awaiting issuance"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Need anything else? Message your MapleLeed concierge and we’ll handle seats, baggage, or itinerary changes.
                </p>
                <Link
                  href={searchHref}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Back to travel search
                </Link>
              </div>
            </div>
          )}

          {loadingOffer && !offer && (
            <div className="border border-border rounded-xl bg-card shadow animate-pulse h-48" />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

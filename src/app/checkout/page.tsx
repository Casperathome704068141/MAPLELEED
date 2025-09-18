
"use client";

import {ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useState, useActionState} from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {useSearchParams} from 'next/navigation';
import {ArrowLeft, CheckCircle2, Loader2} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type {OfferSummary, SegmentSummary} from "@/lib/travel";
import {BookingFlowIndicator} from "@/components/travel/booking-flow-indicator";
import {Button} from "@/components/ui/button";

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

type DuffelDocument = {
  id?: string;
  unique_identifier?: string;
  type?: string;
};

type BookingResult = {
  order_id: string;
  booking_reference: string;
  status?: string;
  documents: DuffelDocument[];
  pricing: OfferSummary["pricing"];
};

type BookingState = {
  status: 'idle' | 'success' | 'error';
  result?: BookingResult | null;
  message?: string;
}

const initialBookingState: BookingState = {
  status: 'idle',
  result: null,
  message: '',
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

function segmentKey(segment: SegmentSummary, index: number) {
  return segment.id || `${segment.marketing_flight}-${index}`;
}

function parsePassengerCount(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground rounded-md h-12 flex items-center justify-center font-semibold text-lg disabled:bg-primary/70"
    >
      {pending ? "Reserving…" : "Reserve Itinerary"}
    </button>
  );
}


function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offer") ?? "";
  const passengerCount = useMemo(() => parsePassengerCount(searchParams.get("pax")), [searchParams]);

  const [offer, setOffer] = useState<OfferSummary | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [passengers, setPassengers] = useState<PassengerForm[]>(() =>
    createPassengerForms(passengerCount),
  );
  const [contact, setContact] = useState<ContactForm>({email: "", phone_number: ""});
  
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSessionUrl, setPaymentSessionUrl] = useState<string | null>(null);
  
  const [bookingState, bookAction] = useActionState(async (prevState: BookingState, formData: FormData): Promise<BookingState> => {
     if (!offer) {
        return { status: 'error', message: 'Offer details are not available.' };
     }

      const passengersPayload = passengers.map((_, index) => ({
          id: `pas_${index + 1}`,
          type: "adult",
          title: formData.get(`title-${index}`) as string,
          given_name: formData.get(`given-${index}`) as string,
          family_name: formData.get(`family-${index}`) as string,
          born_on: formData.get(`dob-${index}`) as string,
          email: formData.get(`email-${index}`) as string,
          phone_number: formData.get(`phone-${index}`) as string,
      }));

      const contactPayload = {
          email: formData.get('contact-email') as string,
          phone_number: formData.get('contact-phone') as string,
      };

      try {
        const payload = {
          offerId,
          passengers: passengersPayload,
          contact: contactPayload,
        };

        const response = await fetch(`/api/travel/book`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        });

        const body = await response.json().catch(() => ({error: "Booking failed"}));

        if (!response.ok) {
          const {error} = body;
          let message = "Booking failed. Please review passenger details.";
          if (typeof error === "string") {
            message = error;
          } else if (Array.isArray(error) && error.length) {
            message = error[0]?.message ?? message;
          }
          throw new Error(message);
        }

        const resultData = {
          order_id: body.order_id,
          booking_reference: body.booking_reference,
          status: body.status,
          documents: Array.isArray(body.documents) ? body.documents : [],
          pricing: body.pricing ?? offer.pricing,
        };

        return { status: 'success', result: resultData };

      } catch (error: any) {
        console.error(error);
        return { status: 'error', message: error?.message ?? "Booking failed. Please try again." };
      }
  }, initialBookingState);


  const bookingResult = bookingState.result;
  const bookingError = bookingState.status === 'error' ? bookingState.message : null;
  const currentStep = bookingResult ? 3 : 2;

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
      .then((data: {offer?: OfferSummary}) => {
        if (data?.offer) {
          setOffer(data.offer);
        } else {
          throw new Error("Offer details were unavailable.");
        }
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

  const canSubmit = !missingPassengerDetails && !missingContact && !loadingOffer && !!offer;

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
      const target = event.target as HTMLInputElement | HTMLSelectElement | null;
      if (!target) return;
      const value = target.value ?? "";
      updatePassenger(index, field, value);
      if (index === 0 && (field === "email" || field === "phone_number")) {
        setContact(prev => ({
          ...prev,
          [field]: prev[field] ? prev[field] : value,
        }));
      }
    };
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="px-6 pb-24 pt-24 w-full">
        <section className="max-w-4xl mx-auto space-y-8">
          <Link
            href="/travel#flight-search"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to flight options
          </Link>
          <BookingFlowIndicator currentStep={currentStep} />
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Confirm your booking</h1>
            <p className="text-muted-foreground">
              Enter traveller details exactly as they appear on passports. We’ll reserve your seats and then redirect you to Stripe to complete payment securely.
            </p>
          </div>

          {loadError && (
            <div className="border border-destructive/50 bg-destructive/10 text-destructive rounded-lg p-4">
              {loadError}
            </div>
          )}

          {offer && (
            <div className="border border-border rounded-xl bg-card shadow-md p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {offer.owner?.iata_code}
                  </p>
                  <h2 className="text-xl font-semibold">{offer.owner?.name ?? "Selected flight"}</h2>
                  <p className="text-sm text-muted-foreground">Travellers: {passengerCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">MapleLeed all-in price</p>
                  <p className="text-3xl font-headline font-bold">
                    {offer.pricing.display_total_amount} {offer.pricing.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This includes airline fare and our $75/ticket service fee.
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

          <form action={bookAction} className="border border-border rounded-xl bg-card shadow-md p-6 space-y-6">
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
                        name={`title-${index}`}
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
                        name={`given-${index}`}
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
                        name={`family-${index}`}
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
                        name={`dob-${index}`}
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
                        name={`email-${index}`}
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
                        name={`phone-${index}`}
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
                    name="contact-email"
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
                    name="contact-phone"
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
             <div className="text-center space-y-2">
                <SubmitButton />
                <p className="text-xs text-muted-foreground">
                    This will reserve your itinerary with the airline. Payment will be handled separately by our team.
                </p>
             </div>
          </form>

          {bookingResult && (
            <div className="border border-border rounded-xl bg-muted/20 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Booking confirmed</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Your Duffel order is confirmed with the airline. Our team will be in touch shortly to arrange payment and finalize ticketing. Keep an eye on your inbox for e-ticket documents once payment is complete.
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                  <dd className="text-muted-foreground">{bookingResult.status || 'Confirmed'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Total to be paid</dt>
                  <dd className="text-muted-foreground">
                    {bookingResult.pricing.display_total_amount} {bookingResult.pricing.currency}
                  </dd>
                </div>
              </dl>
              {Array.isArray(bookingResult.documents) && bookingResult.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground">Travel documents</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {bookingResult.documents.map((doc, index) => {
                      const label = doc.type ? doc.type.toUpperCase() : "DOCUMENT";
                      const identifier = doc.unique_identifier ?? "Awaiting issuance";
                      const key = doc.id ?? doc.unique_identifier ?? `${label}-${index}`;
                      return (
                        <li key={key}>
                          {label}: {identifier}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow flex items-center justify-center px-6 py-24 text-sm text-muted-foreground">
            Loading checkout…
          </main>
          <Footer />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

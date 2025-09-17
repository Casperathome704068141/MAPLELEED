'use client';

import type { FlightOffer, FlightSlice } from '@/lib/duffel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CardPayment, type CardPaymentProps } from '@duffel/components';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { DurationFormatter, TimeFormatter } from './formatters';
import {
  ArrowRight,
  Info,
  Loader2,
  Plane,
  Plus,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';

// IMPORTANT: Replace with your Firebase Project ID
const FIREBASE_PROJECT_ID = 'studio-9298040015-4934f';
const createDuffelPaymentIntentUrl = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/createDuffelPaymentIntent`;
const confirmDuffelPaymentIntentUrl = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/confirmDuffelPaymentIntent`;
const bookOrderUrl = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/bookOrder`;


type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type FlightSearchDetails = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  adults: number;
  cabinClass: CabinClass;
  tripType: 'one-way' | 'return';
};

type Passenger = {
  id?: string;
  title: 'mr' | 'ms' | 'mrs';
  gender: 'm' | 'f';
  given_name: string;
  family_name: string;
  born_on: string;
  email: string;
  phone_number: string;
  type: 'adult' | 'child' | 'infant_without_seat';
};

const passengerInitialState: Passenger = {
  title: 'mr',
  gender: 'm',
  given_name: '',
  family_name: '',
  born_on: '',
  email: '',
  phone_number: '',
  type: 'adult',
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatCabin = (cabin?: string | null) =>
  cabin
    ? cabin
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Economy';

const CarrierLogo = ({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) => {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={32}
        height={32}
        className="rounded-full border bg-white object-contain"
      />
    );
  }

  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-secondary text-xs font-semibold uppercase text-secondary-foreground">
      {initials}
    </div>
  );
};

const SliceDetails = ({ slice }: { slice: FlightSlice }) => {
  const stops = slice.segments.length - 1;
  const firstSegment = slice.segments[0];
  const lastSegment = slice.segments[slice.segments.length - 1];

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-4">
          <CarrierLogo
            name={firstSegment.operating_carrier.name}
            logoUrl={firstSegment.operating_carrier.logo_symbol_url}
          />
          <div className="flex flex-wrap items-center gap-6 font-mono text-sm">
            <div>
              <TimeFormatter time={firstSegment.departing_at} />
              <div className="text-xs text-muted-foreground">
                {firstSegment.origin.iata_code}
              </div>
            </div>
            <div className="text-center">
              <DurationFormatter duration={slice.duration} />
              <div className="h-px w-16 bg-border" />
              <div className="text-xs text-muted-foreground">
                {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
              </div>
            </div>
            <div>
              <TimeFormatter time={lastSegment.arriving_at} />
              <div className="text-xs text-muted-foreground">
                {lastSegment.destination.iata_code}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Operated by {firstSegment.operating_carrier.name}</span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground md:inline-block" />
          <span>
            {format(new Date(firstSegment.departing_at), 'eee, MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
};

export const FlightResults = ({
  offers,
  searchDetails,
}: {
  offers: FlightOffer[];
  searchDetails?: FlightSearchDetails;
}) => {
  const [selectedOffer, setSelectedOffer] = React.useState<FlightOffer | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setSelectedOffer(null);
  }, [offers]);

  const handleBookingSuccess = (data: any) => {
    toast({
      title: 'Booking Confirmed!',
      description: `Your flight is booked. Your reference is ${data.booking_reference}.`,
    });
    setSelectedOffer(null);
  };

  const handleBookingError = (error: any) => {
    toast({
      title: 'Booking Failed',
      description: error?.message || 'An unexpected error occurred during booking.',
      variant: 'destructive',
    });
  };

  const passengerCountForOffer = React.useCallback(
    (offer: FlightOffer) =>
      searchDetails?.adults ??
      offer.slices[0]?.segments[0]?.passengers?.length ??
      1,
    [searchDetails?.adults]
  );

  const summaryDeparture = searchDetails?.departureDate
    ? format(parseISO(searchDetails.departureDate), 'eee, MMM d, yyyy')
    : null;
  const summaryReturn = searchDetails?.returnDate
    ? format(parseISO(searchDetails.returnDate), 'eee, MMM d, yyyy')
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-headline font-bold">Your Flight Results</h2>
        <p className="text-muted-foreground">
          All fares shown include our service fee and Duffel payment processing so you can check out securely.
        </p>
      </div>

      {searchDetails && (
        <div className="rounded-lg border bg-card/60 p-5 text-left shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {searchDetails.tripType === 'return' ? 'Return trip' : 'One-way trip'}
              </p>
              <h3 className="text-xl font-semibold">
                {searchDetails.origin.toUpperCase()} → {searchDetails.destination.toUpperCase()}
              </h3>
              <p className="text-sm text-muted-foreground">
                Depart {summaryDeparture}
                {searchDetails.tripType === 'return' && summaryReturn
                  ? ` • Return ${summaryReturn}`
                  : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Users className="mr-1 h-4 w-4" /> {searchDetails.adults}{' '}
                {searchDetails.adults === 1 ? 'traveller' : 'travellers'}
              </Badge>
              <Badge variant="secondary">
                {formatCabin(searchDetails.cabinClass)} cabin
              </Badge>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {offers.length} option{offers.length === 1 ? '' : 's'} sourced live from Duffel.
          </p>
        </div>
      )}

      {offers.map((offer) => {
        const travellerCount = passengerCountForOffer(offer);
        const perTraveller = formatCurrency(
          +(offer.final_amount / travellerCount).toFixed(2),
          offer.currency
        );
        const cabinLabel = formatCabin(
          offer.slices[0]?.segments[0]?.passengers?.[0]?.cabin_class ?? searchDetails?.cabinClass
        );

        return (
          <Card
            key={offer.offer_id}
            className="overflow-hidden border-border/70 shadow-md transition-shadow hover:shadow-lg"
          >
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start">
              <div className="flex w-full flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <CarrierLogo name={offer.owner.name} logoUrl={offer.owner.logo_symbol_url} />
                  <div>
                    <p className="font-medium text-foreground">{offer.owner.name}</p>
                    <p className="text-xs uppercase tracking-wide">Offer {offer.offer_id.slice(0, 8)}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {cabinLabel}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {offer.slices.map((slice, index) => (
                    <SliceDetails key={index} slice={slice} />
                  ))}
                </div>
              </div>

              <div className="flex w-full flex-row items-center justify-between gap-4 border-t pt-4 md:w-auto md:flex-col md:items-end md:border-l md:border-t-0 md:pl-4 md:pt-0">
                <div className="text-right">
                  <p className="text-2xl font-headline font-bold">
                    {formatCurrency(offer.final_amount, offer.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Includes {formatCurrency(offer.base_amount, offer.currency)} base fare
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {perTraveller} per traveller · {travellerCount}{' '}
                    {travellerCount === 1 ? 'passenger' : 'passengers'}
                  </p>
                </div>
                <Button onClick={() => setSelectedOffer(offer)}>
                  Review &amp; pay <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {offers.length === 0 && (
        <Alert className="mx-auto max-w-2xl">
          <Info className="h-4 w-4" />
          <AlertTitle>No flights found</AlertTitle>
          <AlertDescription>
            We couldn't find any flights for the selected route and dates. Please try a different search.
          </AlertDescription>
        </Alert>
      )}

      {selectedOffer && (
        <BookingDialog
          offer={selectedOffer}
          passengerCount={passengerCountForOffer(selectedOffer)}
          onOpenChange={(isOpen) => !isOpen && setSelectedOffer(null)}
          onBookingSuccess={handleBookingSuccess}
          onBookingError={handleBookingError}
        />
      )}
    </div>
  );
};

type BookingDialogProps = {
  offer: FlightOffer;
  passengerCount: number;
  onOpenChange: (isOpen: boolean) => void;
  onBookingSuccess: (data: any) => void;
  onBookingError: (error: any) => void;
};

const BookingDialog = ({
  offer,
  passengerCount,
  onOpenChange,
  onBookingSuccess,
  onBookingError,
}: BookingDialogProps) => {
  const [passengers, setPassengers] = React.useState<Passenger[]>([passengerInitialState]);
  const [paymentIntent, setPaymentIntent] = React.useState<{
    id: string;
    clientToken: string;
  } | null>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const maxPassengers = 6;

  React.useEffect(() => {
    setPassengers(
      Array.from({ length: Math.max(passengerCount, 1) }, () => ({
        ...passengerInitialState,
      }))
    );
  }, [offer, passengerCount]);

  React.useEffect(() => {
    const controller = new AbortController();
    const createPaymentIntent = async () => {
      setIsCreatingPaymentIntent(true);
      setError(null);
      setPaymentIntent(null);
      try {
        const res = await fetch(createDuffelPaymentIntentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            final_amount: offer.final_amount,
            currency: offer.currency,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await res.json();
        setPaymentIntent({
          id: data.payment_intent_id,
          clientToken: data.client_token,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message ?? 'Failed to initialize payment');
      } finally {
        setIsCreatingPaymentIntent(false);
      }
    };

    createPaymentIntent();
    return () => controller.abort();
  }, [offer]);

  const onSuccessfulPayment = async (paymentIntentId: string) => {
    setIsBooking(true);
    setError(null);
    try {
      const confirmRes = await fetch(confirmDuffelPaymentIntentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_intent_id: paymentIntentId }),
      });

      if (!confirmRes.ok) {
        const errorData = await confirmRes.json();
        throw new Error(errorData.error || 'Payment confirmation failed');
      }

      const confirmedPayment = await confirmRes.json();
      if (confirmedPayment.status !== 'succeeded') {
        throw new Error('Payment was not successful.');
      }

      const passengerPayload = passengers.map((p, index) => ({
        ...p,
        id: `passenger-${index + 1}`,
      }));
      
      const bookRes = await fetch(bookOrderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.offer_id,
          base_amount: offer.base_amount,
          currency: offer.currency,
          payment_intent_id: paymentIntentId,
          passengers: passengerPayload,
        }),
      });

      if (!bookRes.ok) {
        const errorData = await bookRes.json();
        throw new Error(errorData.error || 'Booking failed');
      }

      const bookingData = await bookRes.json();
      onBookingSuccess(bookingData);
    } catch (err: any) {
      setError(err.message);
      onBookingError(err);
    } finally {
      setIsBooking(false);
    }
  };

  const isFormValid =
    passengers.length > 0 &&
    passengers.every(
      (p) =>
        p.given_name &&
        p.family_name &&
        p.born_on &&
        p.email &&
        p.phone_number
    );

  const cabinLabel = formatCabin(
    offer.slices[0]?.segments[0]?.passengers?.[0]?.cabin_class
  );

  const addPassenger = () => {
    setPassengers((prev) =>
      prev.length >= maxPassengers ? prev : [...prev, { ...passengerInitialState }]
    );
  };

  const removePassenger = (index: number) => {
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(isOpen) => {
        if (!isBooking) {
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Complete Your Booking</DialogTitle>
          <DialogDescription>
            Confirm passenger details and pay securely to lock in this fare.
          </DialogDescription>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'}
            </Badge>
            <Badge variant="outline">{cabinLabel}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-2 -mr-6 pl-6">
          <div className="space-y-4 py-4">
            {offer.slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-4 rounded-md bg-secondary p-3">
                <Plane className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {slice.segments[0].origin.city_name} to {slice.segments[slice.segments.length - 1].destination.city_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(slice.segments[0].departing_at), 'eee, MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline text-lg font-semibold">
                <User className="h-5 w-5" />
                Passenger Details
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPassenger}
                disabled={passengers.length >= maxPassengers || isBooking}
              >
                <Plus className="mr-1 h-4 w-4" /> Add passenger
              </Button>
            </div>

            {passengers.map((passenger, index) => (
              <PassengerForm
                key={index}
                index={index}
                total={passengers.length}
                passenger={passenger}
                setPassenger={(updatedPassenger) => {
                  setPassengers((prev) => {
                    const next = [...prev];
                    next[index] = updatedPassenger;
                    return next;
                  });
                }}
                onRemove={
                  passengers.length > 1
                    ? () => removePassenger(index)
                    : undefined
                }
              />
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="font-headline text-lg font-semibold">Payment</h3>
            {isCreatingPaymentIntent && (
              <div className="flex h-40 flex-col items-center justify-center space-y-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p>Initializing secure payment...</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {paymentIntent && !isCreatingPaymentIntent && (
              <>
                {!isFormValid && (
                  <Alert>
                    <AlertTitle>Complete passenger details</AlertTitle>
                    <AlertDescription>
                      Enter required passenger information to enable the payment form.
                    </AlertDescription>
                  </Alert>
                )}
                {isFormValid && CardPayment && (
                  <div className="rounded-lg border p-4">
                    <CardPayment
                      key={paymentIntent.id}
                      duffelPaymentIntentClientToken={paymentIntent.clientToken}
                      onSuccessfulPayment={() => onSuccessfulPayment(paymentIntent.id)}
                      onFailedPayment={(stripeError) => {
                        setError(stripeError?.message ?? 'Payment failed');
                        onBookingError(stripeError);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="mt-auto border-t pt-4">
          <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              Charged in {offer.currency}. Includes our $59 service fee and secure Duffel payment processing.
              {isBooking && (
                <span className="ml-2 inline-flex items-center gap-1 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing booking…
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wide text-muted-foreground">Total price</span>
              <span className="text-2xl font-headline font-bold">
                {formatCurrency(offer.final_amount, offer.currency)}
              </span>
              <p className="text-xs text-muted-foreground">
                Base fare {formatCurrency(offer.base_amount, offer.currency)} + service markup
              </p>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PassengerForm = ({
  passenger,
  index,
  total,
  setPassenger,
  onRemove,
}: {
  passenger: Passenger;
  index: number;
  total: number;
  setPassenger: (passenger: Passenger) => void;
  onRemove?: () => void;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPassenger({ ...passenger, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">
            {index + 1}
          </span>
          Passenger {index + 1}
        </div>
        {onRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <X className="mr-1 h-4 w-4" /> Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor={`type-${index}`}>Passenger Type</Label>
          <select
            id={`type-${index}`}
            name="type"
            value={passenger.type}
            onChange={handleChange}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="adult">Adult (16+)</option>
            <option value="child">Child (2-15)</option>
            <option value="infant_without_seat">Infant (on lap)</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`title-${index}`}>Title</Label>
          <select
            id={`title-${index}`}
            name="title"
            value={passenger.title}
            onChange={handleChange}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="mr">Mr</option>
            <option value="ms">Ms</option>
            <option value="mrs">Mrs</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`gender-${index}`}>Gender</Label>
          <select
            id={`gender-${index}`}
            name="gender"
            value={passenger.gender}
            onChange={handleChange}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="m">Male</option>
            <option value="f">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`given_name-${index}`}>First Name</Label>
          <Input
            id={`given_name-${index}`}
            name="given_name"
            value={passenger.given_name}
            onChange={handleChange}
            required
            placeholder="John"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`family_name-${index}`}>Last Name</Label>
          <Input
            id={`family_name-${index}`}
            name="family_name"
            value={passenger.family_name}
            onChange={handleChange}
            required
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor={`born_on-${index}`}>Date of Birth</Label>
          <Input
            id={`born_on-${index}`}
            name="born_on"
            type="date"
            value={passenger.born_on}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`email-${index}`}>Email</Label>
          <Input
            id={`email-${index}`}
            name="email"
            type="email"
            value={passenger.email}
            onChange={handleChange}
            required
            placeholder="john.doe@example.com"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`phone_number-${index}`}>Phone Number</Label>
          <Input
            id={`phone_number-${index}`}
            name="phone_number"
            type="tel"
            value={passenger.phone_number}
            onChange={handleChange}
            required
            placeholder="+14155552671"
          />
        </div>
      </div>
    </div>
  );
};

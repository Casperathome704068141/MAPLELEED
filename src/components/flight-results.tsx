
'use client';

import type { FlightOffer, FlightSlice } from '@/lib/duffel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { DuffelAncillaries, DuffelCardForm, DuffelNext } from '@duffel/components';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DurationFormatter, TimeFormatter } from './formatters';
import { ArrowRight, Info, Loader2, Plane, User } from 'lucide-react';
import { DUFFEL_CURRENCY } from '@/lib/duffel';
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

const isDuffelComponentsCssAdded = () => {
  return !![...document.getElementsByTagName('link')].find(
    (l) => l.href === 'https://assets.duffel.com/components/v2/main.css'
  );
};

const SliceDetails = ({ slice }: { slice: FlightSlice }) => {
  const stops = slice.segments.length - 1;
  const firstSegment = slice.segments[0];
  const lastSegment = slice.segments[slice.segments.length - 1];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Image
          src={firstSegment.operating_carrier.logo_symbol_url!}
          alt={firstSegment.operating_carrier.name}
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="flex items-center gap-4 font-mono text-sm">
          <div>
            <TimeFormatter time={firstSegment.departing_at} />
            <div className="text-xs text-muted-foreground">{firstSegment.origin.iata_code}</div>
          </div>
          <div className="text-center">
            <DurationFormatter duration={slice.duration} />
            <div className="h-px w-16 bg-border" />
            <div className="text-xs text-muted-foreground">{stops === 0 ? 'Direct' : `${stops} stop`}</div>
          </div>
          <div>
            <TimeFormatter time={lastSegment.arriving_at} />
            <div className="text-xs text-muted-foreground">{lastSegment.destination.iata_code}</div>
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground shrink-0">{firstSegment.operating_carrier.name}</div>
    </div>
  );
};

export const FlightResults = ({ offers }: { offers: FlightOffer[] }) => {
  const [selectedOffer, setSelectedOffer] = React.useState<FlightOffer | null>(null);
  const { toast } = useToast();

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

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h2 className="text-3xl font-headline font-bold text-center">Your Flight Results</h2>

      {offers.map((offer) => (
        <Card key={offer.offer_id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-grow w-full space-y-3">
              {offer.slices.map((slice, index) => (
                <SliceDetails key={index} slice={slice} />
              ))}
            </div>

            <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
              <div className="text-right">
                <p className="text-2xl font-bold font-headline">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: offer.currency }).format(
                    offer.final_amount
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total for {offer.slices[0].segments[0].passengers?.length || 1} passenger
                  {offer.slices[0].segments[0].passengers?.length > 1 ? 's' : ''}
                </p>
              </div>
              <Button onClick={() => setSelectedOffer(offer)}>
                Select Flight <ArrowRight className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedOffer && (
        <BookingDialog
          offer={selectedOffer}
          onOpenChange={(isOpen) => !isOpen && setSelectedOffer(null)}
          onBookingSuccess={handleBookingSuccess}
          onBookingError={handleBookingError}
        />
      )}
    </div>
  );
};

const passengerInitialState = {
  title: 'mr' as const,
  gender: 'm' as const,
  given_name: '',
  family_name: '',
  born_on: '',
  email: '',
  phone_number: '',
};

type Passenger = typeof passengerInitialState;

const BookingDialog = ({
  offer,
  onOpenChange,
  onBookingSuccess,
  onBookingError,
}: {
  offer: FlightOffer;
  onOpenChange: (isOpen: boolean) => void;
  onBookingSuccess: (data: any) => void;
  onBookingError: (error: any) => void;
}) => {
  const [passengers, setPassengers] = React.useState<Passenger[]>([passengerInitialState]);
  const [paymentIntentClientToken, setPaymentIntentClientToken] = React.useState('');
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const createPaymentIntent = async () => {
      setIsCreatingPaymentIntent(true);
      setError(null);
      try {
        const res = await fetch('/api/payments/duffel/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            final_amount: offer.final_amount,
            currency: offer.currency,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await res.json();
        setPaymentIntentClientToken(data.client_token);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsCreatingPaymentIntent(false);
      }
    };
    createPaymentIntent();
  }, [offer]);

  const onSuccessfulPayment = async (paymentIntentId: string) => {
    setIsBooking(true);
    setError(null);
    try {
      // Duffel test mode requires server-side confirmation
      const confirmRes = await fetch('/api/payments/duffel/confirm-intent', {
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

      // Create the order
      const bookRes = await fetch('/api/flights/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.offer_id,
          base_amount: offer.base_amount,
          currency: offer.currency,
          payment_intent_id: paymentIntentId,
          passengers,
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

  const isFormValid = passengers.every(p => 
    p.given_name && p.family_name && p.born_on && p.email && p.phone_number
  );

  return (
    <DuffelNext>
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Complete Your Booking</DialogTitle>
            <DialogDescription>
              Confirm passenger details and complete payment for your flight.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto pr-2 -mr-6 pl-6">
            <div className="space-y-4 my-4">
              {offer.slices.map((slice, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-md bg-secondary">
                  <Plane className="size-5 text-primary"/>
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
              <h3 className="font-headline font-semibold text-lg flex items-center gap-2"><User /> Passenger Details</h3>
              {passengers.map((p, index) => (
                <PassengerForm key={index} passenger={p} setPassenger={(updatedPassenger) => {
                  const newPassengers = [...passengers];
                  newPassengers[index] = updatedPassenger;
                  setPassengers(newPassengers);
                }} />
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="font-headline font-semibold text-lg">Payment</h3>
              {isCreatingPaymentIntent && (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Initializing secure payment...</p>
                </div>
              )}
              {error && (
                 <Alert variant="destructive" className="my-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {paymentIntentClientToken && !isCreatingPaymentIntent && (
                <div className="mt-4">
                  <DuffelCardForm
                    paymentIntentClientToken={paymentIntentClientToken}
                    onSuccess={(data) => onSuccessfulPayment(data.id)}
                    onError={(err) => {
                       setError(err.message);
                       onBookingError(err);
                    }}
                    disabled={!isFormValid || isBooking}
                    amount={offer.final_amount}
                    currency={offer.currency}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
              <div className="flex justify-between items-center w-full">
                <span className="text-muted-foreground">Total Price</span>
                <span className="text-2xl font-bold font-headline">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: offer.currency }).format(
                        offer.final_amount
                    )}
                </span>
              </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DuffelNext>
  );
};

const PassengerForm = ({ passenger, setPassenger }: { passenger: Passenger, setPassenger: (p: Passenger) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPassenger({ ...passenger, [e.target.name]: e.target.value });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-lg">
       <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
         <select name="title" value={passenger.title} onChange={handleChange} className="h-10 border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
          <option value="mr">Mr</option>
          <option value="ms">Ms</option>
          <option value="mrs">Mrs</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="given_name">First Name</Label>
        <Input name="given_name" value={passenger.given_name} onChange={handleChange} required placeholder="John" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="family_name">Last Name</Label>
        <Input name="family_name" value={passenger.family_name} onChange={handleChange} required placeholder="Doe" />
      </div>
       <div className="space-y-1">
        <Label htmlFor="gender">Gender</Label>
         <select name="gender" value={passenger.gender} onChange={handleChange} className="h-10 w-full border-input bg-background rounded-md border px-3 py-2 text-sm">
          <option value="m">Male</option>
          <option value="f">Female</option>
          <option value="u">Unspecified</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="born_on">Date of Birth</Label>
        <Input name="born_on" type="date" value={passenger.born_on} onChange={handleChange} required />
      </div>
      <div className="space-y-1 col-span-2 md:col-span-1">
        <Label htmlFor="email">Email</Label>
        <Input name="email" type="email" value={passenger.email} onChange={handleChange} required placeholder="john.doe@example.com"/>
      </div>
      <div className="space-y-1 col-span-2 md:col-span-3">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input name="phone_number" type="tel" value={passenger.phone_number} onChange={handleChange} required placeholder="+14155552671" />
      </div>
    </div>
  )
}

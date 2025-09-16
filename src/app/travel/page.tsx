'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Plane,
  BedDouble,
  Search,
  ShieldCheck,
  Wallet,
  Globe,
  Loader2,
  Info,
  PlaneTakeoff,
  PlaneLanding,
  Headset,
  Ticket,
  Compass,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { add, format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { FlightOffer } from '@/lib/duffel';
import { FlightResults, type FlightSearchDetails } from '@/components/flight-results';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type CabinClass = FlightSearchDetails['cabinClass'];

// IMPORTANT: Replace with your Firebase Project ID
const FIREBASE_PROJECT_ID = 'studio-9298040015-4934f';
const searchFlightsUrl = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/searchFlights`;


function TravelHero() {
  const travelImage = PlaceHolderImages.find((p) => p.id === 'travel-hero');
  return (
    <section className="relative flex h-[400px] items-center justify-center text-center text-white md:h-[500px]">
      {travelImage && (
        <Image
          src={travelImage.imageUrl}
          alt={travelImage.description}
          fill
          className="object-cover"
          data-ai-hint={travelImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="container relative z-10 mx-auto px-4">
        <h1 className="text-4xl font-headline font-bold tracking-tighter lg:text-5xl xl:text-6xl">
          Your Journey Starts Here
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg">
          Find student-friendly fares and trusted accommodation partners in minutes. We connect directly with Duffel&apos;s global airline network so every itinerary is ready for your visa interview and arrival on campus.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
            <a href="#travel-search">Plan my travel</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TravelSearchSection() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<FlightOffer[] | null>(null);
  const [searchSummary, setSearchSummary] = React.useState<FlightSearchDetails | null>(null);
  const [tripType, setTripType] = React.useState<'one-way' | 'return'>('return');
  const [adultCount, setAdultCount] = React.useState('1');
  const [selectedCabin, setSelectedCabin] = React.useState<CabinClass>('economy');
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const tomorrow = format(add(new Date(), { days: 1 }), 'yyyy-MM-dd');
  const sevenDaysFromTomorrow = format(add(new Date(), { days: 8 }), 'yyyy-MM-dd');

  const handleFlightSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setSearchSummary(null);

    const formData = new FormData(e.currentTarget);
    const originRaw = (formData.get('origin') as string) || '';
    const destinationRaw = (formData.get('destination') as string) || '';
    const departureDate = (formData.get('departureDate') as string) || '';
    const returnDateValue = (formData.get('returnDate') as string) || '';
    const submittedAdults = Math.max(
      1,
      Number((formData.get('adults') as string) || adultCount || '1')
    );
    const cabinClass = (formData.get('cabinClass') as CabinClass) || selectedCabin;

    const origin = originRaw.trim().toUpperCase();
    const destination = destinationRaw.trim().toUpperCase();

    if (!origin || !destination || !departureDate) {
      setError('Please fill out all required flight fields.');
      setLoading(false);
      return;
    }

    if (origin.length !== 3 || destination.length !== 3) {
      setError('Please use three-letter IATA airport codes (for example YYZ or NBO).');
      setLoading(false);
      return;
    }

    if (origin === destination) {
      setError('Origin and destination must be different airports.');
      setLoading(false);
      return;
    }

    if (tripType === 'return' && returnDateValue && returnDateValue < departureDate) {
      setError('Return date must be after your departure date.');
      setLoading(false);
      return;
    }

    const searchDetails: FlightSearchDetails = {
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'return' && returnDateValue ? returnDateValue : null,
      adults: submittedAdults,
      cabinClass,
      tripType,
    };

    try {
      const payload: Record<string, unknown> = {
        origin,
        destination,
        departureDate,
        adults: submittedAdults,
        cabin_class: cabinClass,
      };

      if (tripType === 'return' && returnDateValue) {
        payload.returnDate = returnDateValue;
      }

      const response = await fetch(searchFlightsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch flight offers.');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchSummary(searchDetails);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Search Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccommodationSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Search initiated!',
      description: 'Searching for accommodations... (demo feature)',
    });
  };

  return (
    <section id="travel-search" className="pb-20 lg:pb-28">
      <div className="container mx-auto px-4">
        <div className="relative z-20 mx-auto -mt-32 max-w-4xl md:-mt-40">
          <Tabs defaultValue="flights" className="w-full">
            <TabsList className="grid h-14 w-full grid-cols-2 rounded-t-lg rounded-b-none">
              <TabsTrigger
                value="flights"
                className="h-full rounded-b-none text-base data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Plane className="mr-2" /> Flights
              </TabsTrigger>
              <TabsTrigger
                value="accommodations"
                className="h-full rounded-b-none text-base data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <BedDouble className="mr-2" /> Stays
              </TabsTrigger>
            </TabsList>
            <TabsContent value="flights">
              <Card className="rounded-t-none shadow-2xl">
                <CardContent className="space-y-4 p-6">
                  <form onSubmit={handleFlightSearch} className="space-y-4">
                    <input type="hidden" name="adults" value={adultCount} />
                    <input type="hidden" name="cabinClass" value={selectedCabin} />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={tripType === 'one-way' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTripType('one-way')}
                        >
                          One-way
                        </Button>
                        <Button
                          type="button"
                          variant={tripType === 'return' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTripType('return')}
                        >
                          Return
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Use three-letter IATA airport codes (for example YYZ or NBO).
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Input name="origin" placeholder="From (e.g., YYZ for Toronto)" className="h-12" required />
                      <Input name="destination" placeholder="To (e.g., NBO for Nairobi)" className="h-12" required />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input name="departureDate" type="date" min={tomorrow} defaultValue={tomorrow} className="h-12" required />
                      <Input
                        name="returnDate"
                        type="date"
                        min={tomorrow}
                        defaultValue={sevenDaysFromTomorrow}
                        className="h-12"
                        disabled={tripType === 'one-way'}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Select value={adultCount} onValueChange={setAdultCount}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Passengers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 traveller</SelectItem>
                          <SelectItem value="2">2 travellers</SelectItem>
                          <SelectItem value="3">3 travellers</SelectItem>
                          <SelectItem value="4">4 travellers</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedCabin} onValueChange={(value) => setSelectedCabin(value as CabinClass)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Cabin class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="premium_economy">Premium Economy</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" /> Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2" /> Search flights
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="accommodations">
              <Card className="rounded-t-none shadow-2xl">
                <CardContent className="space-y-4 p-6">
                  <form onSubmit={handleAccommodationSearch} className="space-y-4">
                    <Input placeholder="Destination, city, or hotel" className="h-12" />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input type="date" placeholder="Check-in" className="h-12" />
                      <Input type="date" placeholder="Check-out" className="h-12" />
                    </div>
                    <div>
                      <Select defaultValue="1g1r">
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Guests & Rooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1g1r">1 guest · 1 room</SelectItem>
                          <SelectItem value="2g1r">2 guests · 1 room</SelectItem>
                          <SelectItem value="2g2r">2 guests · 2 rooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" size="lg" className="h-12 w-full text-base">
                      <Search className="mr-2" /> Search stays
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div ref={resultsRef} className="mt-12 space-y-6">
          {loading && (
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">Finding the best flights for you...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mx-auto max-w-2xl">
              <AlertTitle>Search error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {results && !loading && (
            <>
              {results.length > 0 ? (
                <FlightResults offers={results} searchDetails={searchSummary ?? undefined} />
              ) : (
                <Alert className="mx-auto max-w-2xl">
                  <Info className="h-4 w-4" />
                  <AlertTitle>No flights found</AlertTitle>
                  <AlertDescription>
                    We couldn&apos;t find any flights for the selected route and dates. Try adjusting your travel window or switching to a nearby airport.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function BookingJourney() {
  const steps: Array<{ title: string; description: string; icon: React.ReactNode }> = [
    {
      title: 'Search & compare',
      description:
        'Enter your preferred airports and we pull live fares directly from Duffel. Every result shows the total amount you will authorize in USD.',
      icon: <Search className="h-6 w-6" />,
    },
    {
      title: 'Secure checkout',
      description:
        'Lock in pricing with our built-in Duffel Card Payment experience. No redirects, hidden fees, or surprise currency conversions.',
      icon: <Ticket className="h-6 w-6" />,
    },
    {
      title: 'Receive travel pack',
      description:
        'Once the payment intent is confirmed we issue your order, send e-tickets, and provide a visa-ready itinerary plus proof of payment.',
      icon: <PlaneTakeoff className="h-6 w-6" />,
    },
  ];

  return (
    <section className="bg-muted/40 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-headline font-bold">How booking with VisaPilot works</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            From search to boarding pass, we keep you updated at each step so you can focus on preparing for life abroad.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="border border-border/60">
              <CardHeader className="items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularRoutes() {
  const routes = [
    {
      route: 'Lagos (LOS) → Toronto (YYZ)',
      price: '$735',
      duration: '17h 50m total • 1 stop via Frankfurt',
      carrier: 'Lufthansa + Air Canada',
      description: 'Arrive before orientation with two checked bags and student-friendly layovers.',
      badge: 'Student favourite',
    },
    {
      route: 'Nairobi (NBO) → London (LHR)',
      price: '$612',
      duration: '8h 40m total • Direct with British Airways',
      carrier: 'British Airways',
      description: 'Perfect for UK visa appointments—flexible ticketing and easy onward connections.',
    },
    {
      route: 'São Paulo (GRU) → Dublin (DUB)',
      price: '$684',
      duration: '13h 15m total • 1 stop via Lisbon',
      carrier: 'TAP Air Portugal',
      description: 'Includes proof of onward travel and digital boarding passes for immigration checks.',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-headline font-bold">Popular student routes</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Realistic sample fares sourced from Duffel to inspire your planning. Prices refresh constantly—use the search tool above for the latest availability.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {routes.map((route) => (
            <Card key={route.route} className="flex h-full flex-col border border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline text-lg">{route.route}</CardTitle>
                  <Badge variant="outline">{route.price}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{route.duration}</p>
                {route.badge && (
                  <Badge className="mt-2 w-fit" variant="secondary">
                    {route.badge}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="mt-auto space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span>{route.carrier}</span>
                </div>
                <p>{route.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TravelConcierge() {
  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-headline font-bold">Travel concierge at every step</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            VisaPilot combines travel booking with visa support. Every itinerary is reviewed by our advisors so you have documents that embassies and border officers recognise.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary">
                <Headset className="h-6 w-6" />
                <CardTitle className="font-headline text-xl text-foreground">Dedicated travel specialists</CardTitle>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Share your confirmed booking with our advisors and we&apos;ll align your flights with visa appointments, airport pickups, and school arrival windows.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>concierge@visapilot.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (437) 555-0199 · WhatsApp &amp; Telegram</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/60">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary">
                <Globe className="h-6 w-6" />
                <CardTitle className="font-headline text-xl text-foreground">Documentation handled</CardTitle>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Receive visa letters, proof of onward travel, and payment receipts automatically once your order is ticketed.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Airlines across 190+ countries</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <PlaneLanding className="h-4 w-4 text-primary" />
                <span>Emergency support for missed connections</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function WhyBookWithUs() {
  const features = [
    {
      icon: <Wallet className="h-10 w-10 text-primary" />,
      title: 'Transparent pricing',
      description:
        'All fares include our $59 service fee and estimated taxes so you know the exact amount being authorised through Duffel.',
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: 'Secure payments',
      description:
        'Card details are encrypted by Duffel and Stripe. VisaPilot never stores your payment information and receipts are issued instantly.',
    },
    {
      icon: <Compass className="h-10 w-10 text-primary" />,
      title: 'Built for students abroad',
      description:
        'Itineraries highlight transit visas, baggage allowances, and arrival deadlines required by universities and embassies.',
    },
  ];

  return (
    <section id="why-book" className="bg-card py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-headline font-bold">Why book with VisaPilot</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Travel booking designed for international students, backed by real humans who understand visa timelines.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border border-transparent text-center shadow-lg transition-shadow duration-300 hover:border-primary hover:shadow-xl"
            >
              <CardHeader className="items-center">
                <div className="rounded-full bg-primary/10 p-4">{feature.icon}</div>
                <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TravelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <TravelHero />
        <TravelSearchSection />
        <BookingJourney />
        <PopularRoutes />
        <TravelConcierge />
        <WhyBookWithUs />
      </main>
      <Footer />
    </div>
  );
}

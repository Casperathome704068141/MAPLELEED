
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Plane, BedDouble, Search, ShieldCheck, Wallet, Globe, Loader2, Info } from 'lucide-react';
import { add, format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { FlightOffer } from '@/lib/duffel';
import { FlightResults } from '@/components/flight-results';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function TravelHero() {
  const travelImage = PlaceHolderImages.find((p) => p.id === 'travel-hero');
  return (
    <section className="relative h-[400px] md:h-[500px] flex items-center justify-center text-center text-white">
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
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-headline font-bold tracking-tighter">
          Your Journey Starts Here
        </h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto">
          Find competitive prices for flights and accommodations, tailored for international students. We handle the
          bookings so you can focus on your studies.
        </p>
      </div>
    </section>
  );
}

function TravelSearchSection() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<FlightOffer[] | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const handleFlightSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData(e.currentTarget);
    const origin = formData.get('origin') as string;
    const destination = formData.get('destination') as string;
    const departureDate = formData.get('departureDate') as string;
    const returnDate = formData.get('returnDate') as string;
    const adults = Number(formData.get('adults') as string);
    const cabinClass = formData.get('cabinClass') as 'economy' | 'premium_economy' | 'business' | 'first';

    if (!origin || !destination || !departureDate) {
      setError('Please fill out all required flight fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, departureDate, returnDate, adults, cabinClass }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch flight offers.');
      }

      const data = await response.json();
      setResults(data.results || []);

      // Scroll to results after a short delay
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

  const handleAccomodationSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Search initiated!',
      description: `Searching for Accommodations... (This is a demo feature)`,
    });
  };
  const tomorrow = format(add(new Date(), { days: 1 }), 'yyyy-MM-dd');
  const sevenDaysFromTomorrow = format(add(new Date(), { days: 8 }), 'yyyy-MM-dd');

  return (
    <section id="travel-search" className="pb-20 lg:pb-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto -mt-32 md:-mt-40 relative z-20">
          <Tabs defaultValue="flights" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 rounded-t-lg rounded-b-none">
              <TabsTrigger
                value="flights"
                className="text-base h-full rounded-b-none data-[state=active]:border-b-2 border-primary"
              >
                <Plane className="mr-2" /> Flights
              </TabsTrigger>
              <TabsTrigger
                value="accommodations"
                className="text-base h-full rounded-b-none data-[state=active]:border-b-2 border-primary"
              >
                <BedDouble className="mr-2" /> Stays
              </TabsTrigger>
            </TabsList>
            <TabsContent value="flights">
              <Card className="shadow-2xl rounded-t-none">
                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleFlightSearch}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input name="origin" placeholder="From (e.g., YYZ for Toronto)" className="h-12" required />
                      <Input name="destination" placeholder="To (e.g., NBO for Nairobi)" className="h-12" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <Input name="departureDate" type="date" defaultValue={tomorrow} className="h-12" required />
                      <Input name="returnDate" type="date" className="h-12" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                       <Select name="adults" defaultValue="1">
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Passengers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Adult</SelectItem>
                          <SelectItem value="2">2 Adults</SelectItem>
                          <SelectItem value="3">3 Adults</SelectItem>
                          <SelectItem value="4">4+ Adults</SelectItem>
                        </SelectContent>
                      </Select>
                       <Select name="cabinClass" defaultValue="economy">
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Cabin Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="premium_economy">Premium Economy</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" size="lg" className="w-full mt-6 h-12 text-base" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" /> Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2" /> Search Flights
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="accommodations">
              <Card className="shadow-2xl rounded-t-none">
                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleAccomodationSearch}>
                    <Input placeholder="Destination, city, or hotel" className="h-12" />
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <Input type="date" placeholder="Check-in" className="h-12" />
                      <Input type="date" placeholder="Check-out" className="h-12" />
                    </div>
                    <div className="mt-4">
                      <Select defaultValue="1g1r">
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Guests & Rooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1g1r">1 Guest, 1 Room</SelectItem>
                          <SelectItem value="2g1r">2 Guests, 1 Room</SelectItem>
                          <SelectItem value="2g2r">2 Guests, 2 Rooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" size="lg" className="w-full mt-6 h-12 text-base">
                      <Search className="mr-2" /> Search Accommodations
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div ref={resultsRef} className="mt-12">
          {loading && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">Finding the best flights for you...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {results && (
            <>
              {results.length > 0 ? (
                <FlightResults offers={results} />
              ) : (
                <Alert className="max-w-2xl mx-auto">
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Flights Found</AlertTitle>
                  <AlertDescription>
                    We couldn't find any flights for the selected route and dates. Please try a different search.
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

function WhyBookWithUs() {
  const features = [
    {
      icon: <Wallet className="w-10 h-10 text-primary" />,
      title: 'Transparent Pricing',
      description:
        'The price you see is the price you pay. Our final price includes our service markup and estimated taxes, so there are no surprises.',
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-primary" />,
      title: 'Secure & Reliable',
      description:
        'We partner with leading global travel suppliers. All payments are processed securely, and your bookings are confirmed directly with providers.',
    },
    {
      icon: <Globe className="w-10 h-10 text-primary" />,
      title: 'Designed for Students',
      description:
        'We focus on routes and accommodations that are popular and convenient for international students, saving you research time.',
    },
  ];

  return (
    <section id="why-book" className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Book With Us?</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Travel booking built with the international student in mind.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-transparent hover:border-primary"
            >
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full">{feature.icon}</div>
                <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <TravelHero />
        <TravelSearchSection />
        <WhyBookWithUs />
      </main>
      <Footer />
    </div>
  );
}

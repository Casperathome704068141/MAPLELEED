'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Plane,
  BedDouble,
  Search,
  ShieldCheck,
  Percent,
  Wallet,
  Globe,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function TravelHero() {
    const travelImage = PlaceHolderImages.find(p => p.id === 'travel-hero');
    return (
        <section className="relative h-[400px] md:h-[500px] flex items-center justify-center text-center text-white">
            {travelImage && (
                <Image
                    src={travelImage.imageUrl}
                    alt={travelImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={travelImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 container mx-auto px-4">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-headline font-bold tracking-tighter">
                    Your Journey Starts Here
                </h1>
                <p className="mt-4 text-lg max-w-3xl mx-auto">
                    Find competitive prices for flights and accommodations, tailored for international students. We handle the bookings so you can focus on your studies.
                </p>
            </div>
        </section>
    );
}

function TravelSearchSection() {
  const { toast } = useToast();
  const handleTravelSearch = (e: React.FormEvent, type: 'Flights' | 'Accommodations') => {
    e.preventDefault();
    toast({
      title: 'Search initiated!',
      description: `Searching for ${type}... (This is a demo feature)`,
    })
  }

  return (
    <section id="travel-search" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto -mt-40 relative z-20">
            <Tabs defaultValue="flights" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="flights">
                <Plane className="mr-2 h-4 w-4" /> Flights
                </TabsTrigger>
                <TabsTrigger value="accommodations">
                <BedDouble className="mr-2 h-4 w-4" /> Accommodations
                </TabsTrigger>
            </TabsList>
            <TabsContent value="flights">
                <Card className="shadow-2xl">
                <CardContent className="p-6 space-y-4">
                    <form onSubmit={(e) => handleTravelSearch(e, 'Flights')}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="From (e.g., Mumbai)" />
                        <Input placeholder="To (e.g., New York)" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <Input type="date" placeholder="Departure" />
                        <Input type="date" placeholder="Return (Optional)" />
                        <Select defaultValue='1'>
                        <SelectTrigger>
                            <SelectValue placeholder="Passengers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 Passenger</SelectItem>
                            <SelectItem value="2">2 Passengers</SelectItem>
                            <SelectItem value="3">3 Passengers</SelectItem>
                            <SelectItem value="4">4+ Passengers</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full mt-6">
                        <Search className="mr-2 h-4 w-4" /> Search Flights
                    </Button>
                    </form>
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="accommodations">
                <Card className="shadow-2xl">
                <CardContent className="p-6 space-y-4">
                    <form onSubmit={(e) => handleTravelSearch(e, 'Accommodations')}>
                    <Input placeholder="Destination, city, or hotel" />
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <Input type="date" placeholder="Check-in" />
                        <Input type="date" placeholder="Check-out" />
                    </div>
                    <div className="mt-4">
                        <Select defaultValue='1g1r'>
                        <SelectTrigger>
                            <SelectValue placeholder="Guests & Rooms" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1g1r">1 Guest, 1 Room</SelectItem>
                            <SelectItem value="2g1r">2 Guests, 1 Room</SelectItem>
                            <SelectItem value="2g2r">2 Guests, 2 Rooms</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full mt-6">
                        <Search className="mr-2 h-4 w-4" /> Search Accommodations
                    </Button>
                    </form>
                </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
      </div>
    </section>
  );
}


function TravelResourcesSection() {
    const features = [
    {
      icon: <Wallet className="w-8 h-8 text-primary" />,
      title: 'All-In-One Pricing',
      description: 'The price you see is the price you pay. Our final price includes our service markup and estimated taxes, so there are no surprises.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: 'Secure & Reliable',
      description: 'We partner with leading global travel suppliers to bring you reliable options. All payments are processed securely via Stripe.',
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: 'Designed for Students',
      description: 'We focus on routes and accommodations that are popular and convenient for international students, saving you research time.',
    },
  ];

  return (
    <section id="resources" className="pb-20 lg:pb-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Book With Us?</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Travel booking built with the international student in mind.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
             <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
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
        <TravelResourcesSection />
      </main>
      <Footer />
    </div>
  );
}

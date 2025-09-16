'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  Plane,
  GraduationCap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function HeroSection() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-students');
  return (
    <section className="relative pt-24 md:pt-32 lg:pt-40">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-headline font-bold tracking-tighter">
              Your Journey to Canada Starts Here.
            </h1>
            <p className="text-lg text-muted-foreground">
              From expert Canadian study permit consultations to seamless flight and accommodation booking, we're your partner for a successful journey abroad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link href="/study#appointments">Book a Free Consultation <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/travel">Explore Travel Options</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto md:w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
    const services = [
    {
      icon: <GraduationCap className="w-10 h-10 text-primary" />,
      title: 'Canada Study Permit Guidance',
      description: 'Navigate your Canadian study permit application with expert consultations and AI-powered checklists tailored for you.',
      href: '/study',
      cta: 'Explore Study Services',
    },
    {
      icon: <Plane className="w-10 h-10 text-primary" />,
      title: 'Student Travel & Stays',
      description: 'Find and book your flights and initial accommodation seamlessly through our integrated platform designed for students.',
      href: '/travel',
      cta: 'Book Your Travel',
    },
    {
      icon: <CalendarCheck className="w-10 h-10 text-primary" />,
      title: '1-on-1 Expert Consultations',
      description: 'Schedule a free consultation call with our visa experts to get your questions answered and start your journey with confidence.',
      href: '/study#appointments',
      cta: 'Book a Free Call',
    },
  ];

  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Your Journey, Simplified</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            We streamline the entire process of studying in Canada, from expert advice to travel arrangements.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="flex flex-col text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full">{service.icon}</div>
                <CardTitle className="font-headline mt-4">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-muted-foreground">{service.description}</p>
                 <Button asChild className="mt-6" variant="outline">
                    <Link href={service.href}>{service.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      step: 1,
      title: "Book Your Free Consultation",
      description: "Schedule a free call with our Canadian visa experts to discuss your study plans and get your questions answered.",
    },
    {
      step: 2,
      title: "Get Your Personalized Plan",
      description: "Choose a service tier and receive a tailored document checklist and a clear action plan for your visa application.",
    },
    {
      step: 3,
      title: "Travel with Confidence",
      description: "Let us handle your flight and accommodation bookings, so you can embark on your journey with complete peace of mind.",
    },
  ];

  return (
    <section id="process" className="py-20 lg:py-28 bg-card">
       <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground mt-2">A simple, three-step path to your new adventure in Canada.</p>
        </div>
        <div className="relative max-w-5xl mx-auto">
          {/* Desktop timeline */}
          <div className="absolute left-0 right-0 top-1/2 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block" aria-hidden="true"></div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-0">
            {steps.map((step, index) => (
              <div key={index} className="relative p-4 text-center">
                 <div className="md:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center z-10">
                    <div className="hidden md:flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground font-bold text-2xl ring-8 ring-card">
                        {step.step}
                    </div>
                 </div>
                 <div className="md:pt-12">
                    <div className="md:hidden flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mx-auto mb-4">
                        {step.step}
                    </div>
                    <h3 className="font-headline text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground mt-2">{step.description}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
       </div>
    </section>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16">
        <HeroSection />
        <ServicesSection />
        <ProcessSection />
      </main>
      <Footer />
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  Plane,
  GraduationCap,
  ShieldCheck,
  Headphones,
  MapPinned,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { LoaderVisual, PageLoader } from '@/components/page-loader';

function HeroSection() {
  const stats = [
    { value: '1.2k+', label: 'Students guided to Canada' },
    { value: '97%', label: 'Visa plan satisfaction' },
    { value: '50+', label: 'Travel & housing partners' },
  ];

  return (
    <section className="relative overflow-hidden pb-24 pt-24 sm:pt-28 lg:pb-28 lg:pt-32">
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/12 via-background to-background"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-[-24rem] -z-10 hidden h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl sm:block"
        aria-hidden="true"
      />
      <div
        className="absolute right-[-16rem] top-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-accent/35 blur-3xl"
        aria-hidden="true"
      />
      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              <span>Canada study &amp; travel concierge</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-headline font-bold leading-tight sm:text-5xl lg:text-6xl">
                Plot your move to Canada with confidence.
              </h1>
              <p className="max-w-xl text-pretty text-lg text-muted-foreground">
                MapleLeed blends regulated Canadian visa expertise with intelligent automation so every document, deadline, and
                booking stays on track from day one.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/study#appointments">
                  Start with a free planning call
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/travel">Browse travel coordination</Link>
              </Button>
            </div>
            <dl className="grid gap-6 sm:grid-cols-3">
              {stats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur"
                >
                  <dt className="text-sm font-medium text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-3 text-2xl font-headline font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-card/95 to-card p-10 text-center shadow-[0_40px_120px_-60px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="inline-flex size-2 rounded-full bg-primary" />
                Real-time progress
              </div>
              <LoaderVisual className="size-36 text-primary" aria-hidden="true" focusable="false" />
              <div className="space-y-5 text-left">
                <p className="text-sm text-muted-foreground">
                  Bookings, documentation, and approvals sync inside MapleLeed so you see what is complete, what is pending, and
                  what happens next.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                      <span>Visa dossier</span>
                      <span className="text-foreground">75% ready</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <span className="block h-full w-3/4 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                      <span>Flight coordination</span>
                      <span className="text-foreground">On track</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex size-2 rounded-full bg-accent" />
                      Lock ideal itinerary 45 days before departure
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: <GraduationCap className="size-12" />,
      title: 'Visa strategy & document prep',
      description:
        'Partner with regulated Canadian visa experts while MapleLeed AI builds curated task lists and checks every upload before submission.',
      href: '/study',
      cta: 'Design your study plan',
      badge: 'Study',
    },
    {
      icon: <CalendarCheck className="size-12" />,
      title: 'Smart submission workspace',
      description:
        'Generate precise checklists, collaborate securely with sponsors, and receive real-time nudges so nothing stalls your application.',
      href: '/study#appointments',
      cta: 'Book your review',
      badge: 'Workspace',
    },
    {
      icon: <Plane className="size-12" />,
      title: 'Travel & arrival concierge',
      description:
        'Lock in flights, housing, insurance, and airport pickups through MapleLeed’s vetted partner network across Canada.',
      href: '/travel',
      cta: 'Plan the journey',
      badge: 'Travel',
    },
  ];

  return (
    <section id="services" className="relative py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5" />
            Signature services
          </span>
          <h2 className="mt-5 text-balance text-3xl font-headline font-bold sm:text-4xl">
            Concierge support for every milestone
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the mix of human expertise and intelligent tooling that keeps your Canadian journey moving forward without stress.
          </p>
        </div>
        <div className="mt-16 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {services.map(service => (
            <div key={service.title} className="maple-tilt">
              <div className="maple-tilt-card">
                <div className="maple-tilt-card__badge">{service.badge}</div>
                <div className="maple-tilt-card__content">
                  <div className="maple-tilt-card__icon">{service.icon}</div>
                  <h3 className="maple-tilt-card__title">{service.title}</h3>
                  <p className="maple-tilt-card__description">{service.description}</p>
                  <Button asChild size="sm" className="maple-tilt-card__cta" variant="secondary">
                    <Link href={service.href}>
                      {service.cta}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureHighlights() {
  const features = [
    {
      title: 'Regulated experts reviewing every milestone',
      description:
        'ICCRC-regulated advisors audit your strategy, paperwork, and submissions so you feel confident at every step.',
      icon: ShieldCheck,
    },
    {
      title: 'Automation that keeps you ahead',
      description:
        'Intelligent reminders, document validation, and progress forecasting remove guesswork from your planning.',
      icon: Sparkles,
    },
    {
      title: 'Nationwide arrival network',
      description:
        'Book trusted flights, housing, and settlement services in the city you choose with MapleLeed’s partner ecosystem.',
      icon: MapPinned,
    },
    {
      title: 'Care team that stays close',
      description:
        'Chat, call, or video with specialists in your timezone when you need clarity—before, during, and after arrival.',
      icon: Headphones,
    },
  ];

  return (
    <section className="bg-secondary/40 py-24">
      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[0.6fr_1fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Why MapleLeed
          </span>
          <h2 className="text-balance text-3xl font-headline font-bold sm:text-4xl">
            People-first expertise elevated by modern tooling
          </h2>
          <p className="text-lg text-muted-foreground">
            MapleLeed gives you a collaborative workspace, real humans who know the system, and curated partner services so you can focus on what matters—studying in Canada.
          </p>
          <Button variant="ghost" asChild className="inline-flex items-center gap-2 px-0 text-primary">
            <Link href="/study#appointments">
              Talk to a specialist
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="h-full border-border/60 bg-card/80 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold leading-snug">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      title: 'Book your planning session',
      description:
        'Share your background and program goals in a collaborative strategy call. We outline priorities, funding needs, and critical deadlines together.',
      detail:
        'Receive a personalised MapleLeed workspace that organises tasks, school forms, and supporting documents for you and any family members.',
    },
    {
      title: 'Build a winning application',
      description:
        'Upload documents into secure checklists, polish your statement of purpose, and manage sponsors with guided templates.',
      detail:
        'Every upload is reviewed by MapleLeed specialists while our AI assistant flags missing items instantly so you submit with confidence.',
    },
    {
      title: 'Coordinate travel & arrival',
      description:
        'Once your permit is approved we help you secure flights, accommodation, insurance, and arrival services in your destination city.',
      detail:
        'Receive curated city briefs, settlement resources, and on-the-ground support that stays with you long after touchdown.',
    },
  ];

  const highlights = [
    'Personal dashboards track every milestone for you and your supporters.',
    'Secure collaboration keeps sponsors and guardians aligned in one place.',
    'Automatic nudges ensure you never miss a deadline or booking window.',
  ];

  return (
    <section id="process" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </span>
          <h2 className="mt-5 text-balance text-3xl font-headline font-bold sm:text-4xl">
            From first idea to landing in Canada
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple, transparent journey where you always know the next task, the upcoming deadline, and the support channel to tap into.
          </p>
        </div>
        <div className="mt-16 grid gap-12 lg:grid-cols-[0.5fr_1fr]">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur">
            <h3 className="text-2xl font-headline font-semibold">Stay oriented at every checkpoint</h3>
            <p className="mt-4 text-muted-foreground">
              Access a collaborative workspace with live updates, curated guidance, and timely reminders tailored to your study plan.
            </p>
            <ul className="mt-6 space-y-4">
              {highlights.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarCheck className="size-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <ol className="relative space-y-10">
            <div
              className="absolute left-[1.5rem] top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-border to-transparent sm:left-[1.75rem] lg:left-4"
              aria-hidden="true"
            />
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-6 sm:gap-8">
                <span className="relative z-10 mt-1 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30">
                  0{index + 1}
                </span>
                <div className="w-full rounded-2xl border border-border/60 bg-card/90 p-6 shadow-[0_16px_48px_-32px_rgba(15,23,42,0.6)] backdrop-blur">
                  <h3 className="font-headline text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{step.description}</p>
                  <p className="mt-3 text-sm text-muted-foreground/90">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="pb-24 pt-12">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary via-primary/85 to-primary/70 p-10 text-center text-primary-foreground shadow-[0_40px_120px_-60px_rgba(14,116,144,0.8)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_rgba(255,255,255,0))]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl space-y-6">
            <span className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider">
              Ready to move?
            </span>
            <h2 className="text-balance text-3xl font-headline font-bold sm:text-4xl">
              Let’s tailor your MapleLeed launch plan.
            </h2>
            <p className="text-base text-primary-foreground/85 sm:text-lg">
              Share your ambitions and timelines—we’ll build a personalised roadmap covering permits, travel logistics, and arrival support so you can focus on your studies.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-background text-primary shadow-lg shadow-primary/20 hover:bg-background/90"
              >
                <Link href="/study#appointments">Schedule your consultation</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/travel">See travel planning in action</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsLoading(false);
      return;
    }

    const timer = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageLoader active={isLoading} label="Preparing your MapleLeed experience…" />
      <Header />
      <main className="flex-grow pt-16">
        <HeroSection />
        <ServicesSection />
        <FeatureHighlights />
        <ProcessSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

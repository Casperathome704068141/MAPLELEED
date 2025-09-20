'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Globe2,
  GraduationCap,
  Headphones,
  LineChart,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { LoaderVisual, PageLoader } from '@/components/page-loader';
import { WeatherCard } from '@/components/weather-card';
import { DEFAULT_MARKETING_ASSETS, useMarketingAssets, type MarketingAssets } from '@/hooks/use-marketing-assets';

function ConfidenceStrip() {
  const pillars = [
    {
      icon: <ShieldCheck className="size-5" />,
      title: 'Licensed immigration strategy',
      description:
        'RCIC & RISIA advisors co-design every permit roadmap, annotate document checklists, and track approvals inside MapleLeed.',
      stat: '98% dossier completion accuracy',
    },
    {
      icon: <LineChart className="size-5" />,
      title: 'Predictive operations layer',
      description:
        'Automations forecast risk windows, surface biometrics deadlines, and update sponsors when requirements change.',
      stat: '3.5 hrs average response time',
    },
    {
      icon: <Globe2 className="size-5" />,
      title: 'Nationwide arrival network',
      description:
        'Concierges across 45 Canadian cities coordinate flights, housing, insurance, and orientation support on launch week.',
      stat: '150+ vetted local partners',
    },
  ];

  return (
    <section className="relative -mt-10 pb-16">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-border/60 bg-background/70 p-6 shadow-xl backdrop-blur">
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map(pillar => (
              <div key={pillar.title} className="flex flex-col justify-between rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {pillar.icon}
                    <span>{pillar.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </div>
                <p className="mt-6 text-sm font-semibold text-primary">{pillar.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection({ assets }: { assets: MarketingAssets }) {
  const stats = [
    { value: '1.2k+', label: 'Students launched to Canada' },
    { value: '72 hrs', label: 'Average readiness turnaround' },
    { value: '45 cities', label: 'Arrival partners nationwide' },
  ];
  const blueprint = [
    {
      title: 'Visa dossier',
      status: 'In quality review',
      detail: 'RCIC specialist validating finances & ties.',
    },
    {
      title: 'Travel logistics',
      status: 'Itinerary drafted',
      detail: 'Preferred airline + baggage waivers locked.',
    },
    {
      title: 'Arrival concierge',
      status: 'Housing shortlisted',
      detail: 'Toronto campus partner securing move-in.',
    },
  ];
  const heroPrimary = assets.hero[0] ?? assets.study[0] ?? assets.gallery[0] ?? '';
  const heroSecondary = assets.hero[1] ?? assets.travel[0] ?? assets.gallery[1];

  return (
    <section className="relative overflow-hidden pb-24 pt-24 sm:pt-28 lg:pb-28 lg:pt-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/12 via-background to-background" aria-hidden="true" />
      <div className="absolute left-1/2 top-[-24rem] -z-10 hidden h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl sm:block" aria-hidden="true" />
      <div className="absolute right-[-16rem] top-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-accent/35 blur-3xl" aria-hidden="true" />
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
                MapleLeed pairs regulated visa specialists with modern automation so every checklist, document, and itinerary stays on track from the moment you say yes.
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
            <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <LineChart className="size-4" />
                MapleLeed launch blueprint
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {blueprint.map(item => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-inner shadow-primary/5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.title}</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{item.status}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <dl className="grid gap-6 sm:grid-cols-3">
              {stats.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur">
                  <dt className="text-sm font-medium text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-3 text-2xl font-headline font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="relative mx-auto h-full min-h-[420px] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-border/60 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.45)]">
              {heroPrimary ? (
                <Image
                  src={heroPrimary}
                  alt="Visa experts guiding an international student"
                  fill
                  priority
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-background" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-6 bottom-6 rounded-3xl bg-background/85 p-6 text-left shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <span className="inline-flex size-2 rounded-full bg-primary" />
                  Real-time progress
                </div>
                <div className="mt-4 flex items-start gap-4">
                  <LoaderVisual className="size-16 text-primary" aria-hidden="true" focusable="false" />
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p className="text-foreground">
                      Dashboards surface what is approved, what needs review, and upcoming milestones so you always know the next action.
                    </p>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                        <span>Visa dossier</span>
                        <span className="text-foreground">75% ready</span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <span className="block h-full w-3/4 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute left-6 top-6 hidden w-64 rounded-3xl border border-white/60 bg-white/90 p-5 text-slate-900 shadow-xl backdrop-blur-lg lg:block">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <FileText className="size-4" />
                  Next milestone
                </div>
                <p className="mt-3 text-sm font-semibold">Biometrics confirmed</p>
                <p className="mt-1 text-xs text-slate-600">
                  Toronto VAC · 12 April · Student and guardian both scheduled.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <CheckCircle2 className="size-3.5" /> On-track
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <BarChart3 className="size-3.5" /> 92%
                  </span>
                </div>
              </div>
            </div>
            {heroSecondary ? (
              <div className="absolute -top-6 right-6 hidden w-32 overflow-hidden rounded-3xl border border-white/40 shadow-lg shadow-primary/10 md:block">
                <Image
                  src={heroSecondary}
                  alt="Celebrating MapleLeed arrivals"
                  width={192}
                  height={160}
                  sizes="192px"
                  className="h-40 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="absolute -bottom-14 right-4 hidden md:block">
              <WeatherCard />
            </div>
          </div>
        </div>
        <div className="mt-16 flex justify-center md:hidden">
          <WeatherCard />
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

function OperatingSystemSection({ assets }: { assets: MarketingAssets }) {
  const workspaceImage = assets.study[0] ?? assets.hero[0] ?? assets.gallery[0] ?? '';
  const analyticsImage = assets.gallery[1] ?? assets.travel[0] ?? '';
  const conciergeImage = assets.team[0] ?? assets.gallery[2] ?? assets.travel[1] ?? '';

  const advantages = [
    'Personalised dashboards keep sponsors, guardians, and students aligned in one secure workspace.',
    'AI-assisted validation flags missing documents before a consultant ever reviews your file.',
    'Arrival tasks—insurance, housing, SIM setup—unlock automatically once your permit is issued.',
  ];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/30 via-background to-background" aria-hidden="true" />
      <div className="container relative mx-auto grid gap-12 px-4 lg:grid-cols-[0.55fr_0.45fr] lg:items-start">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            MapleLeed OS
          </span>
          <h2 className="text-balance text-3xl font-headline font-bold sm:text-4xl">
            One workspace orchestrating every move
          </h2>
          <p className="text-lg text-muted-foreground">
            MapleLeed blends concierge expertise with a secure digital command centre. Monitor progress, collaborate with supporters, and launch travel logistics from the same shared timeline.
          </p>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {advantages.map(item => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Task automation</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Secure collaboration</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Arrival concierge</span>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-primary/10">
            {workspaceImage ? (
              <Image src={workspaceImage} alt="MapleLeed workspace" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card to-background" aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-background/85 p-4 text-sm text-muted-foreground shadow-lg backdrop-blur">
              <p className="text-foreground font-medium">Secure submissions space</p>
              <p className="mt-1 text-xs">
                Upload financial proofs, sponsor letters, and tuition receipts with dual approvals before they reach IRCC.
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-5 shadow-lg">
              {analyticsImage ? (
                <Image src={analyticsImage} alt="Timeline analytics" fill sizes="240px" className="object-cover opacity-70" />
              ) : null}
              <div className="relative space-y-2 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  <BarChart3 className="size-3.5" />
                  Timeline intelligence
                </div>
                <p>
                  Forecasts spotlight biometrics deadlines, travel readiness, and settlement tasks with risk scoring for each cohort.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-5 shadow-lg">
              {conciergeImage ? (
                <Image src={conciergeImage} alt="Arrival concierge" fill sizes="240px" className="object-cover opacity-70" />
              ) : null}
              <div className="relative space-y-2 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  <MapPinned className="size-3.5" />
                  Concierge network
                </div>
                <p>
                  Local specialists arrange airport reception, short-term housing, and orientation for families landing together.
                </p>
              </div>
            </div>
          </div>
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

function CaseStudySection({ assets }: { assets: MarketingAssets }) {
  const hero = assets.team[1] ?? assets.gallery[2] ?? assets.hero[0] ?? '';
  const supporting = [assets.travel[1], assets.gallery[0], assets.study[2], assets.travel[2]].filter(
    (value): value is string => Boolean(value),
  );

  const milestones = [
    {
      title: 'Outcome',
      detail: 'Study permit approved in 28 days',
      description: 'Sheridan College · Business Analytics · Managed for student + sponsor duo.',
      icon: <CheckCircle2 className="size-5 text-primary" />,
    },
    {
      title: 'Why MapleLeed',
      detail: 'Full concierge for a family arrival',
      description: 'Flights, housing, airport pickup, and bank setup organised in one itinerary.',
      icon: <Plane className="size-5 text-primary" />,
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[0.6fr_0.4fr] lg:items-start">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Case file
          </span>
          <h2 className="text-balance text-3xl font-headline font-bold sm:text-4xl">
            Sheridan College launch with MapleLeed concierge
          </h2>
          <p className="text-lg text-muted-foreground">
            A Nigerian family trusted MapleLeed to manage visas, housing, and travel for a September intake. Our team packaged sponsor documentation, coordinated institutional letters, and staged a seamless arrival in Toronto.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {milestones.map(step => (
              <Card key={step.title} className="h-full border-border/60 bg-card/80 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {step.icon}
                    <span>{step.title}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">{step.detail}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{step.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg shadow-primary/10">
            {hero ? (
              <Image src={hero} alt="Family celebrating MapleLeed approval" fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-background" aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-background/80 p-4 text-sm text-muted-foreground shadow-lg backdrop-blur">
              <p className="font-medium text-foreground">Toronto touchdown</p>
              <p className="text-xs">Airport reception, furnished housing, and bank appointments confirmed before arrival.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {supporting.slice(0, 2).map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-border/60 bg-card">
                <Image src={image} alt="MapleLeed concierge moment" fill sizes="240px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GlobalExperienceSection({ assets }: { assets: MarketingAssets }) {
  const galleryEntries = [
    { src: assets.travel[0], label: 'Airport concierge check-ins' },
    { src: assets.study[1] ?? assets.gallery[0], label: 'Document readiness workshops' },
    { src: assets.team[0] ?? assets.gallery[1], label: 'Visa planning huddles with families' },
    { src: assets.gallery[2] ?? assets.travel[1], label: 'Campus arrival tours across Canada' },
  ].filter((entry): entry is { src: string; label: string } => Boolean(entry.src));

  return (
    <section className="bg-secondary/40 py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[0.55fr_1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Inside MapleLeed
            </span>
            <h2 className="text-balance text-3xl font-headline font-bold sm:text-4xl">
              Real people powering every arrival story
            </h2>
            <p className="text-lg text-muted-foreground">
              From the first planning call to campus orientation, MapleLeed coordinators stay in lockstep with you and your supporters so every permit, booking, and welcome is handled with care.
            </p>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Sparkles className="mt-1 size-4 text-primary" />
                <span>Concierges stationed in Toronto, Vancouver, Calgary, and Montreal coordinate trusted partners for housing, insurance, and settlement services.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="mt-1 size-4 text-primary" />
                <span>Weekly visa readiness labs walk families through biometrics, interview prep, and proof of funds documentation.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="mt-1 size-4 text-primary" />
                <span>Arrival day playbooks cover airport reception, SIM activation, and residence onboarding so you land with confidence.</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Launch briefings</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Sponsor coordination</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Arrival concierge</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {galleryEntries.map(({ src, label }, index) => (
              <div
                key={`${src}-${index}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg shadow-primary/10"
              >
                <Image
                  src={src}
                  alt={label}
                  fill
                  sizes="(min-width: 1024px) 320px, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" aria-hidden="true" />
                <p className="absolute bottom-4 left-4 right-4 text-xs font-semibold uppercase tracking-wider text-background">
                  {label}
                </p>
              </div>
            ))}
          </div>
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

function MetricsSection() {
  const metrics = [
    {
      value: '87%',
      label: 'Multi-entry visa approvals',
      description: '2024 MapleLeed cohorts spanning Nigeria, India, UAE, and the Philippines.',
    },
    {
      value: '4.8/5',
      label: 'Concierge satisfaction score',
      description: 'Post-arrival feedback across housing, transport, and orientation services.',
    },
    {
      value: '120+',
      label: 'Academic & travel partners',
      description: 'Colleges, universities, airlines, and insurance providers integrated with MapleLeed.',
    },
    {
      value: '15 hrs',
      label: 'Average time saved monthly',
      description: 'Automations eliminate repetitive document checks and sponsor coordination.',
    },
  ];

  return (
    <section className="bg-secondary/40 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <BarChart3 className="size-3.5" />
            Proven outcomes
          </span>
          <h2 className="mt-5 text-balance text-3xl font-headline font-bold sm:text-4xl">
            Data-backed impact from launch to arrival
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            MapleLeed’s concierge and automation stack consistently deliver faster approvals, higher satisfaction, and smoother landings for international students and their families.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(metric => (
            <Card key={metric.label} className="border-border/60 bg-card/80 p-6 text-center backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle className="text-3xl font-headline font-semibold text-primary">{metric.value}</CardTitle>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{metric.description}</CardContent>
            </Card>
          ))}
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
  const { assets } = useMarketingAssets(DEFAULT_MARKETING_ASSETS);

  React.useEffect(() => {
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotionQuery.matches) {
      setIsLoading(false);
      return;
    }

    let finished = false;
    let animationFrameId = 0;
    let fallbackTimeoutId: number | undefined;

    const finishLoading = () => {
      if (finished) {
        return;
      }

      finished = true;
      if (fallbackTimeoutId !== undefined) {
        window.clearTimeout(fallbackTimeoutId);
        fallbackTimeoutId = undefined;
      }
      window.removeEventListener('load', finishLoading);

      animationFrameId = window.requestAnimationFrame(() => {
        setIsLoading(false);
      });
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true });
    }

    fallbackTimeoutId = window.setTimeout(finishLoading, 800);

    return () => {
      window.removeEventListener('load', finishLoading);
      if (fallbackTimeoutId !== undefined) {
        window.clearTimeout(fallbackTimeoutId);
      }
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageLoader active={isLoading} label="Preparing your MapleLeed experience…" />
      <Header />
      <main className="flex-grow pt-16">
        <HeroSection assets={assets} />
        <ConfidenceStrip />
        <ServicesSection />
        <OperatingSystemSection assets={assets} />
        <FeatureHighlights />
        <CaseStudySection assets={assets} />
        <GlobalExperienceSection assets={assets} />
        <ProcessSection />
        <MetricsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

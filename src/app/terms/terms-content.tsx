'use client';

import Image from 'next/image';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { DEFAULT_MARKETING_ASSETS, useMarketingAssets } from '@/hooks/use-marketing-assets';

const terms = [
  {
    title: '1. Service scope',
    body:
      "MapleLeed delivers study permit planning, consultation, and travel coordination services for international students and their sponsors. We provide guidance, document preparation, and concierge support, but we do not represent the Government of Canada or guarantee visa approvals.",
  },
  {
    title: '2. Account responsibility',
    body:
      'You are responsible for the accuracy of the information and documents you share with us. If you grant collaborators access to your MapleLeed workspace, you are accountable for their actions while using the platform.',
  },
  {
    title: '3. Payments and refunds',
    body:
      'Fees for consultations, study services, and travel bookings are due at the time of checkout. Refunds follow the schedule outlined in your engagement letter and may be affected by third-party providers such as airlines, colleges, or insurers.',
  },
  {
    title: '4. Acceptable use',
    body:
      'Do not upload fraudulent, misleading, or defamatory materials. MapleLeed may suspend access if we identify behaviour that compromises immigration compliance, payment integrity, or platform security.',
  },
  {
    title: '5. Data protection',
    body:
      'We protect your information using encryption, role-based controls, and secure storage. Review our Privacy Policy to understand how we collect, use, and retain your data across study and travel engagements.',
  },
  {
    title: '6. Updates and contact',
    body:
      'We may update these terms to reflect new services or regulatory guidance. Significant changes will be posted here with the date of revision. Contact support@mapleleed.com with questions or to request a signed copy.',
  },
];

export default function TermsContent() {
  const { assets } = useMarketingAssets(DEFAULT_MARKETING_ASSETS);
  const heroImage = assets.gallery[0] ?? assets.hero[0] ?? '';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden py-24 text-white sm:py-32">
          <div className="absolute inset-0 -z-10">
            {heroImage ? (
              <Image
                src={heroImage}
                alt="Students reviewing MapleLeed service agreement"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-slate-900/80" aria-hidden="true" />
          </div>
          <div className="container mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
                Service Agreement
              </span>
              <h1 className="text-balance text-4xl font-headline font-bold sm:text-5xl">MapleLeed Terms of Service</h1>
              <p className="text-lg text-white/80">
                These terms explain how MapleLeed works with aspiring students, sponsors, and travellers. Please read them carefully so you understand the commitments on both sides before engaging our team.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-secondary/40 py-20">
          <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.65fr_1fr] lg:items-start">
            <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg">
              <h2 className="text-2xl font-headline font-semibold">Summary</h2>
              <p className="text-sm text-muted-foreground">
                MapleLeed pairs regulated immigration specialists with travel coordinators to streamline your move to Canada. We focus on accuracy, transparency, and proactive communication throughout your journey.
              </p>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Effective date: <strong>{new Intl.DateTimeFormat('en-CA', { dateStyle: 'long' }).format(new Date())}</strong>
                </p>
                <p>
                  Questions? Email <a href="mailto:support@mapleleed.com" className="text-primary underline">support@mapleleed.com</a> or call our concierge line during North American business hours.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              {terms.map(term => (
                <article key={term.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground">{term.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{term.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

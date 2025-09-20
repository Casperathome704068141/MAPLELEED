'use client';

import Image from 'next/image';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { useMarketingAssets } from '@/hooks/use-marketing-assets';

type PrivacySection = {
  title: string;
  body: string;
  bullets?: string[];
};

const sections: PrivacySection[] = [
  {
    title: '1. Information we collect',
    body:
      'We gather details you provide directly (such as identity documents, application history, and contact information) as well as activity from your VisaPilot workspace. We may append publicly available data to better match you with housing, travel, or study opportunities.',
    bullets: [
      'Consultation notes and uploaded documents',
      'Payment records and invoices',
      'Log data that helps us troubleshoot and improve performance',
    ],
  },
  {
    title: '2. How we use your data',
    body:
      'Your information enables us to advise on visa strategy, prepare documentation, coordinate bookings, and communicate updates. We use anonymised insights to improve VisaPilot services, never to sell your personal data.',
    bullets: [
      'Delivering expert guidance and checklists tailored to your case',
      'Coordinating travel, insurance, and settlement partners on your behalf',
      'Sending reminders and transactional emails related to your journey',
    ],
  },
  {
    title: '3. Sharing with trusted partners',
    body:
      'We only share information required to deliver the services you request—such as admissions partners, travel suppliers, or payment processors. Each partner signs confidentiality commitments that align with Canadian privacy legislation.',
  },
  {
    title: '4. Your controls and choices',
    body:
      'You can request access, corrections, or deletion of your records by emailing privacy@visapilot.com. We retain core immigration and financial records for the period mandated by regulators and professional associations.',
  },
  {
    title: '5. Security',
    body:
      'VisaPilot uses encryption in transit and at rest, restricted access to files, multi-factor authentication, and continuous monitoring. We conduct regular audits of permissions and vendor practices to ensure your information stays protected.',
  },
  {
    title: '6. International transfers',
    body:
      'Our infrastructure is hosted in Canada with secure backups in North America. If we need to process data in other jurisdictions, we apply the same safeguards and contractual protections.',
  },
  {
    title: '7. Contact',
    body:
      'Email privacy@visapilot.com or write to VisaPilot Privacy Office, 1250 Bay Street, Toronto, ON, Canada. We respond to verified privacy requests within 30 days.',
  },
];

export default function PrivacyContent() {
  const { assets } = useMarketingAssets();
  const heroImage = assets.gallery[1] ?? assets.hero[1] ?? '';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden py-24 text-white sm:py-32">
          <div className="absolute inset-0 -z-10">
            {heroImage ? (
              <Image
                src={heroImage}
                alt="Student and advisor discussing privacy controls"
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
                Privacy Commitment
              </span>
              <h1 className="text-balance text-4xl font-headline font-bold sm:text-5xl">VisaPilot Privacy Policy</h1>
              <p className="text-lg text-white/80">
                We steward sensitive immigration and travel information every day. This policy explains what we collect, how it is used, and the controls you maintain over your personal data.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-secondary/40 py-20">
          <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.65fr_1fr] lg:items-start">
            <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg">
              <h2 className="text-2xl font-headline font-semibold">At a glance</h2>
              <p className="text-sm text-muted-foreground">
                We only collect information that helps you study and settle in Canada. Your documents stay in secure systems with audit logs and strict access controls.
              </p>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Effective date: <strong>{new Intl.DateTimeFormat('en-CA', { dateStyle: 'long' }).format(new Date())}</strong>
                </p>
                <p>
                  Data requests: <a href="mailto:privacy@visapilot.com" className="text-primary underline">privacy@visapilot.com</a>
                </p>
              </div>
            </div>
            <div className="space-y-8">
              {sections.map(section => (
                <article key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                  {section.bullets ? (
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {section.bullets.map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 inline-block size-1.5 rounded-full bg-primary" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
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

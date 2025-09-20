import type {Metadata} from 'next';

import './globals.css';
import '@duffel/components/dist/CardPayment.min.css';

import { Toaster } from "@/components/ui/toaster"
import { serverEnv } from '@/lib/env/server';

const siteUrl = serverEnv.NEXT_PUBLIC_SITE_URL ?? 'https://visapilot.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VisaPilot',
    template: '%s | VisaPilot',
  },
  description:
    'VisaPilot delivers end-to-end immigration, study permit, and premium travel concierge services for students moving to Canada.',
  openGraph: {
    title: 'VisaPilot',
    description:
      'Navigate your visa, study permit, and travel bookings with an expert concierge dedicated to international students.',
    url: siteUrl,
    siteName: 'VisaPilot',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisaPilot — Study and travel concierge for international students',
    description:
      'Book trusted visa, study permit, and travel services with transparent pricing and concierge support.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

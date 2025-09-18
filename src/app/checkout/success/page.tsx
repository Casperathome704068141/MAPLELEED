import Link from 'next/link';

import Header from '@/components/header';
import Footer from '@/components/footer';

type CheckoutSuccessPageProps = {
  searchParams?: {
    order?: string | string[];
  };
};

export default function CheckoutSuccessPage({searchParams}: CheckoutSuccessPageProps) {
  const orderParam = searchParams?.order;
  const orderId = Array.isArray(orderParam) ? orderParam[0] : orderParam;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow px-6 py-24">
        <div className="max-w-2xl mx-auto border border-border rounded-xl bg-card shadow-md p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Payment confirmed</h1>
            <p className="text-muted-foreground">
              Thanks for completing payment. Stripe has emailed a receipt and invoice. MapleLeed is now
              releasing the ticket with the airline—expect your e-ticket documents shortly.
            </p>
          </div>
          {orderId && (
            <div className="rounded-lg bg-muted/30 border border-border/60 p-4 text-sm">
              <p className="font-medium text-foreground">Duffel order</p>
              <p className="text-muted-foreground">{orderId}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href="/travel"
              className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium"
            >
              Back to travel search
            </Link>
            <Link
              href="/admin/travel"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              Open admin dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

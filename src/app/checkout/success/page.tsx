import Link from 'next/link';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { getOrderBySessionId, type OrderRecord } from '@/lib/repositories/order-repository';

type CheckoutSuccessPageProps = {
  searchParams?: {
    session_id?: string | string[];
  };
};

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${amount / 100} ${currency.toUpperCase()}`;
  }
}

function renderOrderSummary(order: OrderRecord | null) {
  if (!order) {
    return (
      <div className="rounded-lg bg-muted/30 border border-border/60 p-4 text-sm">
        <p className="font-medium text-foreground">We are finalising your order</p>
        <p className="text-muted-foreground">
          We could not find the payment yet. Stripe may still be processing the webhook—refresh this page in a moment or contact support if the issue persists.
        </p>
      </div>
    );
  }

  if (order.type === 'study') {
    return (
      <div className="space-y-3 rounded-lg bg-muted/30 border border-border/60 p-4 text-sm">
        <p className="font-medium text-foreground">Study services payment verified</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="font-medium">{order.planName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total paid</p>
            <p className="font-medium">{formatAmount(order.amount, order.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Add-ons</p>
            <p className="font-medium">{order.addons.length ? order.addons.join(', ') : 'None'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reference</p>
            <p className="font-medium">{order.checkoutReference}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          A receipt has been sent to {order.customerEmail ?? 'your email address'}. Our team will reach out with onboarding details within one business day.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg bg-muted/30 border border-border/60 p-4 text-sm">
      <p className="font-medium text-foreground">Travel booking confirmed</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-muted-foreground">Booking reference</p>
          <p className="font-medium">{order.bookingReference ?? 'Pending with airline'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Duffel order ID</p>
          <p className="font-medium">{order.orderId}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Passengers</p>
          <p className="font-medium">{order.passengers.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total charged</p>
          <p className="font-medium">
            {order.pricing.display_total_amount} {order.pricing.currency?.toUpperCase()}
          </p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Your itinerary and e-ticket will be emailed as soon as the airline issues the documents.
      </p>
    </div>
  );
}

export default async function CheckoutSuccessPage({searchParams}: CheckoutSuccessPageProps) {
  const sessionParam = searchParams?.session_id;
  const sessionId = Array.isArray(sessionParam) ? sessionParam[0] : sessionParam ?? null;

  const order = sessionId ? await getOrderBySessionId(sessionId) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow px-6 py-24">
        <div className="max-w-2xl mx-auto border border-border rounded-xl bg-card shadow-md p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">Payment confirmed</h1>
            <p className="text-muted-foreground">
              Thanks for your purchase. We have verified the payment and emailed a receipt. Our team is preparing the next steps for you now.
            </p>
          </div>
          {renderOrderSummary(order)}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href="/travel"
              className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium"
            >
              Back to travel search
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              Manage in admin dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

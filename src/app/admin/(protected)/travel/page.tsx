import type Stripe from 'stripe';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Plane, BedDouble, CreditCard} from "lucide-react";

import {getStripeClient} from '@/lib/stripe';

type StripeCheckoutSession = Stripe.Checkout.Session;

function formatCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (!amount) return '—';
  const unitAmount = amount / 100;
  const normalizedCurrency = currency ? currency.toUpperCase() : 'CAD';
  try {
    return new Intl.NumberFormat('en-CA', {style: 'currency', currency: normalizedCurrency}).format(unitAmount);
  } catch (error) {
    return `${normalizedCurrency} ${unitAmount.toFixed(2)}`;
  }
}

function formatDateTime(timestamp: number | null | undefined) {
  if (!timestamp) return '—';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp * 1000));
  } catch (error) {
    return new Date(timestamp * 1000).toISOString();
  }
}

export const dynamic = 'force-dynamic';

export default async function TravelBookingsPage() {
  let stripeSessions: StripeCheckoutSession[] = [];
  let stripeError: string | null = null;

  try {
    const stripe = getStripeClient();
    const response = await stripe.checkout.sessions.list({limit: 10});
    stripeSessions = response.data;
  } catch (error: any) {
    stripeError = error?.message ?? 'Stripe credentials are not configured.';
  }

  const paidSessions = stripeSessions.filter(session => session.payment_status === 'paid');
  const totalCollected = paidSessions.reduce((total, session) => total + (session.amount_total ?? 0), 0);
  const displayCurrency = paidSessions[0]?.currency?.toUpperCase() ?? 'CAD';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Travel Bookings</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stripe travel revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalCollected, displayCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Captured via secure checkout sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Duffel orders paid this week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidSessions.length}</div>
            <p className="text-xs text-muted-foreground">Successful Stripe charges linked to Duffel bookings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Stripe payments</CardTitle>
          <CardDescription>
            Every checkout is tagged with the Duffel order so you can reconcile payouts and commissions instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stripeError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {stripeError}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collected</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Duffel Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stripeSessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell>{formatDateTime(session.created)}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                      {session.customer_details?.email ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {session.client_reference_id ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={session.payment_status === 'paid' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {session.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(session.amount_total, session.currency)}
                    </TableCell>
                  </TableRow>
                ))}
                {stripeSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No Stripe transactions yet. As soon as travellers pay through checkout, their sessions will
                      appear here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual bookings & service fees</CardTitle>
          <CardDescription>
            Track any offline bookings that still need invoicing or Duffel reconciliation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 'TRV001',
                  customer: 'John Doe',
                  type: 'Flight',
                  details: 'LHR → JFK, One-way',
                  commission: '$50.00',
                },
                {
                  id: 'TRV002',
                  customer: 'Jane Smith',
                  type: 'Accommodation',
                  details: 'Hilton Times Square, 5 nights',
                  commission: '$75.50',
                },
              ].map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {booking.type === 'Flight' ? <Plane className="h-3 w-3" /> : <BedDouble className="h-3 w-3" />}
                      {booking.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{booking.customer}</TableCell>
                  <TableCell>{booking.details}</TableCell>
                  <TableCell className="text-right">{booking.commission}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

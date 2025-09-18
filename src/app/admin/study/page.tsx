import type Stripe from 'stripe';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {getStripeClient} from '@/lib/stripe';

const resources = [
  {id: 'RES001', title: 'F-1 Visa Document Checklist', type: 'Checklist', country: 'USA'},
  {id: 'RES002', title: 'UK Student Visa Financial Requirements', type: 'Guide', country: 'UK'},
  {id: 'RES003', title: 'Canadian Study Permit Application Steps', type: 'Guide', country: 'Canada'},
  {id: 'RES004', title: 'Schengen Visa Photo Specifications', type: 'Checklist', country: 'EU'},
];

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

export const dynamic = 'force-dynamic';

export default async function StudyAdminPage() {
  let stripeSessions: StripeCheckoutSession[] = [];
  let stripeError: string | null = null;

  try {
    const stripe = getStripeClient();
    const response = await stripe.checkout.sessions.list({limit: 10});
    stripeSessions = response.data.filter(session => session.metadata?.plan);
  } catch (error: any) {
    stripeError = error?.message ?? 'Stripe credentials are not configured.';
  }

  const totalCollected = stripeSessions
    .filter(session => session.payment_status === 'paid')
    .reduce((sum, session) => sum + (session.amount_total ?? 0), 0);
  const displayCurrency = stripeSessions[0]?.currency?.toUpperCase() ?? 'CAD';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Study &amp; Visa Administration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Stripe study programme revenue</CardTitle>
          <CardDescription>Each checkout session corresponds to a MapleLeed study package purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          {stripeError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {stripeError}
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold">{formatCurrency(totalCollected, displayCurrency)}</div>
              <p className="text-xs text-muted-foreground mb-4">
                Total successfully collected via Stripe for study services
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Customer email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stripeSessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell className="capitalize font-medium">
                        {session.metadata?.plan ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.customer_details?.email ?? '—'}
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        {session.payment_status}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(session.amount_total, session.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stripeSessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                        No Stripe activity for study packages yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
          <CardDescription>
            Add, edit, or remove guides and checklists available to students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>{resource.country}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

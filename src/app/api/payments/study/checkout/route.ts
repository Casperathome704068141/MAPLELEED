import {NextResponse} from 'next/server';

import {getStripeClient, resolveBaseUrl} from '@/lib/stripe';
import {savePendingStudyCheckout} from '@/lib/repositories/order-repository';

type StudyCheckoutPayload = {
  planId?: string;
  addons?: string[];
  customer?: {
    name?: string;
    email?: string;
  };
};

const STUDY_PLANS: Record<string, {name: string; amount: number; currency: string}> = {
  standard: {name: 'Standard Study Support', amount: 14500, currency: 'cad'},
  premium: {name: 'Premium Study Support', amount: 35000, currency: 'cad'},
  ultimate: {name: 'Ultimate Study Concierge', amount: 85000, currency: 'cad'},
};

const STUDY_ADDONS: Record<string, {name: string; amount: number}> = {
  sop: {name: 'SOP/LOE Writing', amount: 7900},
  college_application: {name: 'College Application Assistance', amount: 4900},
  flight_booking: {name: 'Flight Booking Service Fee', amount: 2900},
  accommodation_booking: {name: 'Accommodation Booking Service Fee', amount: 4900},
  airport_pickup: {name: 'Airport Pickup Coordination', amount: 9900},
  insurance_setup: {name: 'Insurance Setup Assistance', amount: 2900},
};

export async function POST(request: Request) {
  try {
    const payload: StudyCheckoutPayload = await request.json();

    const planId = payload.planId?.toLowerCase();
    const plan = planId ? STUDY_PLANS[planId] : undefined;

    if (!plan) {
      return NextResponse.json({error: 'A valid planId is required'}, {status: 400});
    }

    const stripe = getStripeClient();
    const baseUrl = resolveBaseUrl(request);

    const lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: plan.currency,
          unit_amount: plan.amount,
          product_data: {
            name: plan.name,
            description: 'MapleLeed study permit advisory services',
          },
        },
      },
    ];

    const addonIds = Array.isArray(payload.addons) ? payload.addons : [];
    const validAddons = addonIds
      .map(addonId => addonId.toLowerCase())
      .filter(id => STUDY_ADDONS[id]);

    for (const addonId of validAddons) {
      const addon = STUDY_ADDONS[addonId];
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: plan.currency,
          unit_amount: addon.amount,
          product_data: {
            name: addon.name,
            description: 'Optional add-on service',
          },
        },
      });
    }

    const addonsTotal = validAddons.reduce((total, addonId) => total + STUDY_ADDONS[addonId].amount, 0);
    const amountTotal = plan.amount + addonsTotal;

    const normalizedPlanId = planId as string;
    const checkoutMetadata: Record<string, string> = {
      plan: normalizedPlanId,
      addons: validAddons.join(','),
      customer_name: payload.customer?.name ?? '',
      plan_name: plan.name,
      base_amount: String(plan.amount),
      addons_amount: String(addonsTotal),
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/study?payment=cancelled&plan=${encodeURIComponent(normalizedPlanId)}`,
      customer_email: payload.customer?.email,
      invoice_creation: {enabled: true},
      metadata: checkoutMetadata,
      line_items: lineItems,
    });

    await savePendingStudyCheckout({
      sessionId: session.id,
      planId: normalizedPlanId,
      planName: plan.name,
      addons: validAddons,
      amount: amountTotal,
      currency: plan.currency,
      customerEmail: payload.customer?.email,
      customerName: payload.customer?.name,
      metadata: checkoutMetadata,
    });

    return NextResponse.json({url: session.url, sessionId: session.id});
  } catch (error: any) {
    console.error('Failed to create study payment session', error);
    const message =
      typeof error?.message === 'string' ? error.message : 'Unable to create payment session';
    return NextResponse.json({error: message}, {status: 500});
  }
}

import { Timestamp } from 'firebase-admin/firestore';
import type Stripe from 'stripe';

import { getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { serverEnv } from '@/lib/env/server';
import { sendStudyOrderReceipt, sendTravelOrderEmail } from '@/lib/emails';

const collectionName = serverEnv.FIREBASE_ORDERS_COLLECTION;

export type StudyOrderRecord = {
  id: string;
  type: 'study';
  status: 'pending' | 'paid' | 'failed';
  planId: string;
  planName: string;
  addons: string[];
  amount: number;
  currency: string;
  checkoutReference: string;
  customerEmail?: string | null;
  customerName?: string | null;
  paymentIntentId?: string | null;
  paymentStatus?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TravelOrderRecord = {
  id: string;
  type: 'travel';
  status: 'pending' | 'paid' | 'failed';
  orderId: string;
  bookingReference?: string | null;
  passengers: Array<Record<string, any>>;
  pricing: Record<string, any>;
  customerEmail: string;
  customerName?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderRecord = StudyOrderRecord | TravelOrderRecord;

type FirestoreOrder = {
  type: 'study' | 'travel';
  status: 'pending' | 'paid' | 'failed';
  planId?: string;
  planName?: string;
  addons?: string[];
  amount?: number;
  currency?: string;
  checkoutReference?: string;
  customerEmail?: string | null;
  customerName?: string | null;
  paymentIntentId?: string | null;
  paymentStatus?: string | null;
  duffelOrderId?: string;
  bookingReference?: string | null;
  passengers?: Array<Record<string, any>>;
  pricing?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verifiedAt?: Timestamp | null;
};

function toOrderRecord(id: string, data: FirestoreOrder): OrderRecord | null {
  if (data.type === 'study' && data.planId && data.planName && data.amount && data.currency && data.checkoutReference) {
    return {
      id,
      type: 'study',
      status: data.status,
      planId: data.planId,
      planName: data.planName,
      addons: data.addons ?? [],
      amount: data.amount,
      currency: data.currency,
      checkoutReference: data.checkoutReference,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      paymentIntentId: data.paymentIntentId,
      paymentStatus: data.paymentStatus,
      verifiedAt: data.verifiedAt ? data.verifiedAt.toDate().toISOString() : null,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    } satisfies StudyOrderRecord;
  }

  if (data.type === 'travel' && data.duffelOrderId && data.pricing && data.customerEmail && data.passengers) {
    return {
      id,
      type: 'travel',
      status: data.status,
      orderId: data.duffelOrderId,
      bookingReference: data.bookingReference ?? null,
      passengers: data.passengers,
      pricing: data.pricing,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      verifiedAt: data.verifiedAt ? data.verifiedAt.toDate().toISOString() : null,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    } satisfies TravelOrderRecord;
  }

  return null;
}

function getOrdersCollection() {
  return getFirebaseAdminFirestore().collection(collectionName);
}

type PendingStudyCheckout = {
  sessionId: string;
  planId: string;
  planName: string;
  addons: string[];
  amount: number;
  currency: string;
  customerEmail?: string | null;
  customerName?: string | null;
  metadata?: Record<string, string>;
};

export async function savePendingStudyCheckout(payload: PendingStudyCheckout) {
  const now = Timestamp.now();
  const docRef = getOrdersCollection().doc(payload.sessionId);

  await docRef.set(
    {
      type: 'study',
      status: 'pending',
      planId: payload.planId,
      planName: payload.planName,
      addons: payload.addons,
      amount: payload.amount,
      currency: payload.currency,
      checkoutReference: payload.sessionId,
      customerEmail: payload.customerEmail ?? null,
      customerName: payload.customerName ?? null,
      metadata: payload.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function markStudyCheckoutFromSession(session: Stripe.Checkout.Session) {
  const docRef = getOrdersCollection().doc(session.id);
  const existing = await docRef.get();
  const existingData = existing.exists ? (existing.data() as FirestoreOrder) : null;
  const now = Timestamp.now();

  const metadata: Record<string, string> = {};
  if (session.metadata) {
    for (const [key, value] of Object.entries(session.metadata)) {
      metadata[key] = value ?? '';
    }
  }

  const updatePayload: Partial<FirestoreOrder> = {
    type: 'study',
    status: session.payment_status === 'paid' ? 'paid' : 'pending',
    planId: metadata.plan ?? existingData?.planId,
    planName: existingData?.planName ?? metadata.plan_name ?? metadata.plan ?? 'Study plan',
    addons: metadata.addons ? metadata.addons.split(',').filter(Boolean) : existingData?.addons ?? [],
    amount: session.amount_total ?? existingData?.amount ?? 0,
    currency: (session.currency ?? existingData?.currency ?? 'cad').toLowerCase(),
    checkoutReference: session.id,
    customerEmail: session.customer_details?.email ?? existingData?.customerEmail ?? null,
    customerName: session.customer_details?.name ?? existingData?.customerName ?? null,
    paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
    paymentStatus: session.payment_status ?? existingData?.paymentStatus ?? null,
    createdAt: existingData?.createdAt ?? now,
    updatedAt: now,
    verifiedAt: now,
    metadata: {
      ...(existingData?.metadata ?? {}),
      ...metadata,
    },
  } as FirestoreOrder;

  await docRef.set(updatePayload, { merge: true });

  const updatedDoc = await docRef.get();
  const order = toOrderRecord(updatedDoc.id, updatedDoc.data() as FirestoreOrder);

  if (order && order.type === 'study') {
    await sendStudyOrderReceipt({
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      planName: order.planName,
      addons: order.addons,
      amount: order.amount,
      currency: order.currency,
      checkoutReference: order.checkoutReference,
    }).catch(error => {
      console.warn('Failed to send study order email', error);
    });
  }
}

export async function getOrderBySessionId(sessionId: string): Promise<OrderRecord | null> {
  const doc = await getOrdersCollection().doc(sessionId).get();
  if (!doc.exists) {
    return null;
  }

  return toOrderRecord(doc.id, doc.data() as FirestoreOrder);
}

type TravelOrderPayload = {
  orderId: string;
  bookingReference?: string | null;
  passengers: Array<Record<string, any>>;
  pricing: Record<string, any>;
  contactEmail: string;
  contactName?: string | null;
};

export async function recordTravelOrder(payload: TravelOrderPayload) {
  const now = Timestamp.now();
  const docRef = getOrdersCollection().doc(`travel_${payload.orderId}`);

  await docRef.set(
    {
      type: 'travel',
      status: 'paid',
      duffelOrderId: payload.orderId,
      bookingReference: payload.bookingReference ?? null,
      passengers: payload.passengers,
      pricing: payload.pricing,
      customerEmail: payload.contactEmail,
      customerName: payload.contactName ?? null,
      createdAt: now,
      updatedAt: now,
      verifiedAt: now,
    } satisfies FirestoreOrder,
    { merge: true },
  );

  await sendTravelOrderEmail({
    contactEmail: payload.contactEmail,
    customerName: payload.contactName,
    bookingReference: payload.bookingReference ?? 'Pending',
    orderId: payload.orderId,
    totalAmount: payload.pricing.display_total_amount ?? '0.00',
    currency: payload.pricing.currency ?? 'cad',
  }).catch(error => {
    console.warn('Failed to send travel order email', error);
  });
}

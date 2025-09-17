import {onRequest} from 'firebase-functions/v2/https';
import {defineSecret} from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import * as corsLib from 'cors';
import {Duffel} from '@duffel/api';

const cors = corsLib({origin: true});
const DUFFEL_ACCESS_TOKEN = defineSecret('DUFFEL_ACCESS_TOKEN');

// util: flat $59 markup
function addFlatMarkup(base: number): number {
  return +(base + 59).toFixed(2);
}

// helper to build Duffel client per request (reads secret safely)
function client(token: string) {
  return new Duffel({token});
}

// ===== 1) SEARCH FLIGHTS =====
export const searchFlights = onRequest(
  {secrets: [DUFFEL_ACCESS_TOKEN], cors: true, region: 'us-central1'},
  async (req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'POST')
          return res.status(405).send('Method Not Allowed');

        const {
          origin,
          destination,
          departureDate,
          returnDate,
          adults = 1,
          cabin_class = 'economy',
        } = req.body || {};
        if (!origin || !destination || !departureDate) {
          return res
            .status(400)
            .json({error: 'origin, destination, departureDate required'});
        }

        const duffel = client(DUFFEL_ACCESS_TOKEN.value());
        const offerReq = await duffel.offerRequests.create({
          slices: [
            {origin, destination, departure_date: departureDate},
            ...(returnDate
              ? [
                  {
                    origin: destination,
                    destination: origin,
                    departure_date: returnDate,
                  },
                ]
              : []),
          ],
          passengers: Array.from({length: Number(adults)}, () => ({
            type: 'adult',
          })),
          cabin_class,
          return_offers: true,
        });

        const offers = offerReq.data.offers || [];
        const results = offers.map(o => {
          const base = Number(o.total_amount);
          const final = addFlatMarkup(base);
          return {
            offer_id: o.id,
            base_amount: base,
            final_amount: final,
            currency: o.total_currency,
            owner: o.owner,
            slices: o.slices,
            conditions: o.conditions,
          };
        });

        return res.json({results});
      } catch (err: any) {
        logger.error(err);
        return res
          .status(500)
          .json({error: err?.message ?? 'Duffel search failed'});
      }
    });
  }
);

// ===== 2) CREATE PAYMENT INTENT (FINAL PRICE) =====
export const createDuffelPaymentIntent = onRequest(
  {secrets: [DUFFEL_ACCESS_TOKEN], cors: true, region: 'us-central1'},
  async (req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'POST')
          return res.status(405).send('Method Not Allowed');
        const {final_amount, currency} = req.body || {};
        if (!final_amount || !currency)
          return res
            .status(400)
            .json({error: 'final_amount, currency required'});

        const duffel = client(DUFFEL_ACCESS_TOKEN.value());
        const intent = await duffel.payments.paymentIntents.create({
          amount: Number(final_amount).toFixed(2),
          currency,
        });

        return res.json({
          payment_intent_id: intent.data.id,
          client_token: intent.data.client_token, // use on client to render card form in prod
          status: intent.data.status,
        });
      } catch (err: any) {
        logger.error(err);
        return res
          .status(500)
          .json({error: err?.message ?? 'Create PaymentIntent failed'});
      }
    });
  }
);

// ===== 3) CONFIRM PAYMENT INTENT (TEST SHORTCUT) =====
// In production, confirm on client with Duffel's card element using client_token.
export const confirmDuffelPaymentIntent = onRequest(
  {secrets: [DUFFEL_ACCESS_TOKEN], cors: true, region: 'us-central1'},
  async (req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'POST')
          return res.status(405).send('Method Not Allowed');
        const {payment_intent_id} = req.body || {};
        if (!payment_intent_id)
          return res.status(400).json({error: 'payment_intent_id required'});

        const duffel = client(DUFFEL_ACCESS_TOKEN.value());
        const confirmed =
          await duffel.payments.paymentIntents.confirm(payment_intent_id);
        return res.json({status: confirmed.data.status});
      } catch (err: any) {
        logger.error(err);
        return res
          .status(500)
          .json({error: err?.message ?? 'Confirm PaymentIntent failed'});
      }
    });
  }
);

// ===== 4) BOOK ORDER (PAY AIRLINE BASE USING BALANCE) =====
export const bookOrder = onRequest(
  {secrets: [DUFFEL_ACCESS_TOKEN], cors: true, region: 'us-central1'},
  async (req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== 'POST')
          return res.status(405).send('Method Not Allowed');

        const {
          offer_id,
          base_amount,
          currency,
          payment_intent_id,
          passengers,
        } = req.body || {};
        if (
          !offer_id ||
          !base_amount ||
          !currency ||
          !payment_intent_id ||
          !Array.isArray(passengers) ||
          !passengers.length
        ) {
          return res.status(400).json({
            error:
              'offer_id, base_amount, currency, payment_intent_id, passengers[] required',
          });
        }

        const duffel = client(DUFFEL_ACCESS_TOKEN.value());
        const order = await duffel.orders.create({
          type: 'instant',
          selected_offers: [offer_id],
          payments: [
            {
              type: 'balance',
              amount: Number(base_amount).toFixed(2),
              currency,
            },
          ],
          passengers,
          metadata: {duffel_payment_intent_id: payment_intent_id},
        });

        return res.json({
          order_id: order.data.id,
          booking_reference: order.data.booking_reference,
          documents: order.data.documents,
          status: order.data.status,
        });
      } catch (err: any) {
        logger.error(err);
        return res
          .status(500)
          .json({error: err?.message ?? 'Booking failed'});
      }
    });
  }
);

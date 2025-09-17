// server/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { duffel } from "./duffel.js";
import { applyMarkup } from "./pricing.js";
import Stripe from "stripe";

const app = express();

// A more open CORS policy for development.
// In production, you should restrict this to your specific frontend domain.
app.use(cors());

app.use(express.json());

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// 1) Search flights (Offer Request with inline offers)
app.post("/api/search", async (req, res) => {
  try {
    const {
      origin,
      destination,
      departure_date,
      return_date,
      adults = 1,
      cabin_class = "economy",
      max_connections = 1,
    } = req.body;

    const slices = [{ origin, destination, departure_date }];
    if (return_date) slices.push({ origin: destination, destination: origin, departure_date: return_date });

    const { data: offerRequest } = await duffel.offerRequests.create({
      slices,
      passengers: Array.from({ length: adults }).map(() => ({ type: "adult" })),
      cabin_class,
      max_connections,
      return_offers: true, 
    });

    const offers = (offerRequest.offers || []).map((o) => {
      // keep only UI-friendly fields + markup
      const paxCount = offerRequest.passengers.length;
      const withM = applyMarkup(
        {
          id: o.id,
          total_amount: o.total_amount,
          total_currency: o.total_currency,
          slices: o.slices.map((s) => ({
            origin: s.origin.iata_code,
            destination: s.destination.iata_code,
            segments: s.segments.map((seg) => ({
              dep: seg.departing_at,
              arr: seg.arriving_at,
              marketing_flight: `${seg.marketing_carrier?.iata_code}${seg.marketing_flight_number}`,
              carrier_name: seg.operating_carrier?.name || seg.marketing_carrier?.name,
            })),
          })),
        },
        paxCount
      );
      return withM;
    });

    res.json({ offer_request_id: offerRequest.id, offers });
  } catch (e) {
    console.error("SEARCH_ERR", e);
    res.status(500).json({ error: "search_failed" });
  }
});

// 2) Get fresh offer (price can change; also fetch services if you’ll add bags/seats later)
app.get("/api/offers/:id", async (req, res) => {
  try {
    const { data: offer } = await duffel.offers.get(req.params.id, {
      return_available_services: true,
    }); 
  const paxCount = 1; // you can store the count in session or pass via query
    res.json(applyMarkup(offer, paxCount));
  } catch (e) {
    res.status(500).json({ error: "offer_get_failed" });
  }
});

// 3) (Optional) Create a Stripe PaymentIntent for (fare + markup)
app.post("/api/checkout-intent", async (req, res) => {
  try {
    if (!stripe) return res.status(400).json({ error: "Stripe not configured" });
    const { offer_id, pax = 1 } = req.body;
    const { data: offer } = await duffel.offers.get(offer_id);
    const priced = applyMarkup(offer, pax);
    const amountCents = Math.round(Number(priced.pricing.display_total_amount) * 100);

    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: offer.total_currency.toLowerCase(),
      description: `Flight booking ${offer_id}`,
      automatic_payment_methods: { enabled: true },
      metadata: { offer_id, pax: String(pax) },
    });

    res.json({ client_secret: pi.client_secret, pricing: priced.pricing });
  } catch (e) {
    res.status(500).json({ error: "payment_intent_failed" });
  }
});

// 4) Book with Duffel Balance (lets you keep the markup difference)
app.post("/api/book-with-balance", async (req, res) => {
  try {
    const { offer_id, passengers, contact } = req.body;

    // Good hygiene: recheck the offer before purchase
    const { data: offer } = await duffel.offers.get(offer_id);

    const { data: order } = await duffel.orders.create({
      type: "instant",
      selected_offers: [offer_id],
      passengers,
      contact, // { email, phone_number }
      payments: [
        {
          type: "balance",                 // pay airline from Duffel Balance
          amount: offer.total_amount,      // airline amount only
          currency: offer.total_currency,
        },
      ],
    });

    res.json({ order });
  } catch (e) {
    console.error("BOOK_ERR", e);
    res.status(500).json({ error: "book_failed" });
  }
});

// 5) Webhooks: Duffel order events (delays, schedule changes, cancellations)
app.post("/api/webhooks/duffel", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    // Duffel posts JSON; you can trust the source IPs or implement HMAC if provided
    const event = JSON.parse(req.body.toString("utf8"));
    // Persist event.id to avoid reprocessing; update order status in DB
    // Respond 2xx fast
    res.status(200).send("ok");
  } catch (e) {
    res.status(200).send("ignored");
  }
});

app.listen(process.env.PORT || 3001, () =>
  console.log(`API listening on ${process.env.PORT || 3001}`)
);

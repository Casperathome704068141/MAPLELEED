// server/pricing.js
const LOWER_TIER_MARKUP = 75;
const UPPER_TIER_MARKUP = 100;
const MARKUP_THRESHOLD = 999;

function normaliseAmount(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function applyMarkup(offer, paxCount) {
  const passengers = Math.max(1, paxCount);
  const baseTotal = normaliseAmount(offer.total_amount);
  const basePerTicket = baseTotal / passengers;
  const markupPerTicket =
    basePerTicket >= MARKUP_THRESHOLD ? UPPER_TIER_MARKUP : LOWER_TIER_MARKUP;
  const markupTotal = markupPerTicket * passengers;
  const displayTotal = baseTotal + markupTotal;
  const displayPerTicket = displayTotal / passengers;

  return {
    ...offer,
    pricing: {
      currency: offer.total_currency ?? 'USD',
      base_total_amount: baseTotal.toFixed(2),
      base_per_ticket_amount: basePerTicket.toFixed(2),
      markup_per_ticket: markupPerTicket.toFixed(2),
      tickets: passengers,
      markup_total: markupTotal.toFixed(2),
      display_total_amount: displayTotal.toFixed(2),
      display_per_ticket_amount: displayPerTicket.toFixed(2),
    },
  };
}

// server/pricing.js
export function applyMarkup(offer, paxCount) {
  const base = Number(offer.total_amount);
  const markupPerTicket = 75;            // USD/CAD/etc. — same currency as offer.total_currency
  const markupTotal = markupPerTicket * paxCount;
  const displayTotal = (base + markupTotal).toFixed(2);

  return {
    ...offer,
    pricing: {
      currency: offer.total_currency,
      base_total_amount: offer.total_amount,
      markup_per_ticket: markupPerTicket.toFixed(2),
      tickets: paxCount,
      markup_total: markupTotal.toFixed(2),
      display_total_amount: displayTotal,
    },
  };
}

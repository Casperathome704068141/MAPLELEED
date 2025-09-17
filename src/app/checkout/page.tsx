"use client";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Checkout({ searchParams }: { searchParams: { offer: string } }) {
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const offerId = searchParams.offer;

  useEffect(() => {
    if (!offerId) return;
    setLoading(true);
    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/offers/" + offerId)
      .then(r => r.json())
      .then(setOffer)
      .finally(() => setLoading(false));
  }, [offerId]);

  async function book() {
    setLoading(true);
    // This is hardcoded for the demo as per the user's blueprint
    const passengers = [{
      type: "adult",
      title: "mr",
      given_name: "John",
      family_name: "Doe",
      born_on: "1990-05-12",
      email: "john@example.com",
      phone_number: "+14165550123"
    }];

    const contact = { email: "john@example.com", phone_number: "+14165550123" };

    try {
        const r = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/book-with-balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offer_id: offerId, passengers, contact }),
        });
        const data = await r.json();
        if (data.error) {
            throw new Error(data.error);
        }
        alert(data.order ? "Booked! Order " + data.order.id : "Booking failed");
    } catch (error: any) {
        console.error(error);
        alert(`Booking failed: ${error.message}`);
    } finally {
        setLoading(false);
    }
  }

  if (loading && !offer) return <main className="p-6 text-center pt-24">Loading offer details...</main>;
  if (!offer) return <main className="p-6 text-center pt-24">Offer not found or invalid.</main>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="p-6 max-w-2xl mx-auto pt-24">
        <h1 className="text-3xl font-headline font-bold mb-6">Confirm Your Booking</h1>
        <div className="border p-6 rounded-lg bg-card shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Offer Details</h2>
            <p className="text-muted-foreground">Offer ID: {offerId}</p>
          </div>
          <div className="text-2xl font-bold font-headline mb-6">
            Total Price: {offer.pricing.display_total_amount} {offer.pricing.currency}
          </div>
          <p className="text-sm text-muted-foreground mb-6">You are about to book a flight with a hardcoded passenger, "John Doe". The booking will be made using the Duffel Balance method.</p>
          <button onClick={book} disabled={loading} className="w-full bg-primary text-primary-foreground p-3 rounded-md h-12 flex items-center justify-center font-semibold text-lg disabled:bg-primary/70">
            {loading ? 'Booking...' : 'Confirm & Book'}
            </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

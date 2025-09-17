
"use client";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Home() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(formData: FormData) {
    setLoading(true);
    setError(null);
    const body = {
      origin: formData.get("origin"),
      destination: formData.get("destination"),
      departure_date: formData.get("departure_date"),
      return_date: formData.get("return_date") || undefined,
      adults: Number(formData.get("adults") || 1),
      cabin_class: "economy",
    };
    try {
      const r = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        throw new Error('Search request failed. Please check the API server.');
      }
      const data = await r.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setOffers(data.offers || []);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="p-6 max-w-3xl mx-auto pt-24 w-full">
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold mb-2 text-center">Search for Flights</h1>
                <p className="text-muted-foreground text-center">Find the best flights for your journey to your new school.</p>
            </div>
          <form action={onSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-6 rounded-lg bg-card shadow-lg">
            <input name="origin" placeholder="Origin (e.g., YYZ)" className="border p-2 rounded-md h-12" required />
            <input name="destination" placeholder="Destination (e.g., NBO)" className="border p-2 rounded-md h-12" required />
            <div className="flex flex-col">
              <label htmlFor="departure_date" className="text-sm font-medium text-muted-foreground mb-1">Departure Date</label>
              <input id="departure_date" name="departure_date" type="date" className="border p-2 rounded-md h-12" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="return_date" className="text-sm font-medium text-muted-foreground mb-1">Return Date</label>
              <input id="return_date" name="return_date" type="date" className="border p-2 rounded-md h-12" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="adults" className="text-sm font-medium text-muted-foreground mb-1">Adults</label>
              <input id="adults" name="adults" type="number" min={1} defaultValue={1} className="border p-2 rounded-md h-12" />
            </div>
            <button disabled={loading} className="col-span-1 sm:col-span-2 bg-primary text-primary-foreground p-3 rounded-md h-12 flex items-center justify-center font-semibold text-lg disabled:bg-primary/70">
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          {error && <div className="text-red-500 text-center p-4 border border-red-500 bg-red-50 rounded-md">{error}</div>}

          <div className="mt-8 space-y-4">
            {offers.map((o) => (
              <div key={o.id} className="border p-4 rounded-lg bg-card shadow-md">
                <div className="font-bold text-lg text-primary">{o.slices[0].origin} → {o.slices[0].destination}</div>
                <div className="text-muted-foreground">{o.slices[0].segments[0].carrier_name}</div>
                <div className="text-xl font-headline font-bold mt-2">Total (with $75/ticket): {o.pricing.display_total_amount} {o.pricing.currency}</div>
                <a href={`/checkout?offer=${o.id}`} className="underline text-primary font-semibold mt-2 inline-block">Book Now</a>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

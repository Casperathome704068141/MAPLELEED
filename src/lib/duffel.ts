
'use server';
import { Duffel } from '@duffel/api';

export const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export const DUFFEL_CURRENCY = 'USD';

export interface FlightOffer {
  offer_id: string;
  base_amount: number;
  final_amount: number;
  currency: string;
  owner: {
    name: string;
    logo_symbol_url: string | null;
    iata_code: string;
  };
  slices: FlightSlice[];
  conditions: any; // Simplified for this example
}

export interface FlightSlice {
  duration: string;
  origin: Airport;
  destination: Airport;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departing_at: string;
  arriving_at: string;
  duration: string;
  origin: Airport;
  destination: Airport;
  operating_carrier: {
    name: string;
    logo_symbol_url: string | null;
  };
  passengers: { passenger_id: string; cabin_class: string }[];
}

export interface Airport {
  iata_code: string;
  city_name: string;
  name: string;
}

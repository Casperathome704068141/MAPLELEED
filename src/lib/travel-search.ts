export type TravelSearchState = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  adults: number;
  cabinClass: string;
};

function toSingleValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

export function normaliseTravelSearchState(
  state: Partial<TravelSearchState>,
): TravelSearchState {
  const origin = state.origin?.toString().trim().toUpperCase() ?? '';
  const destination = state.destination?.toString().trim().toUpperCase() ?? '';
  const departureDate = state.departureDate?.toString().trim() ?? '';

  const rawReturn = state.returnDate ?? null;
  const cleanedReturn = rawReturn ? rawReturn.toString().trim() : '';
  const returnDate = cleanedReturn ? cleanedReturn : null;

  const adultsValue = Number(state.adults ?? 1);
  const adults = Number.isFinite(adultsValue) ? Math.max(1, adultsValue) : 1;

  const cabinClass = state.cabinClass?.toString().trim() || 'economy';

  return {
    origin,
    destination,
    departureDate,
    returnDate,
    adults,
    cabinClass,
  };
}

export type TravelSearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export function travelSearchFromParams(
  input: TravelSearchParamsInput,
): TravelSearchState {
  if (input instanceof URLSearchParams) {
    return normaliseTravelSearchState({
      origin: input.get('origin') ?? '',
      destination: input.get('destination') ?? '',
      departureDate: input.get('departureDate') ?? '',
      returnDate: input.get('returnDate'),
      adults: input.get('adults') ?? '1',
      cabinClass: input.get('cabinClass') ?? 'economy',
    });
  }

  return normaliseTravelSearchState({
    origin: toSingleValue(input.origin),
    destination: toSingleValue(input.destination),
    departureDate: toSingleValue(input.departureDate),
    returnDate: toSingleValue(input.returnDate) || null,
    adults: toSingleValue(input.adults) || '1',
    cabinClass: toSingleValue(input.cabinClass) || 'economy',
  });
}

export function travelSearchToParams(
  state: Partial<TravelSearchState>,
): URLSearchParams {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults,
    cabinClass,
  } = normaliseTravelSearchState(state);

  const params = new URLSearchParams();

  if (origin) params.set('origin', origin);
  if (destination) params.set('destination', destination);
  if (departureDate) params.set('departureDate', departureDate);
  if (returnDate) params.set('returnDate', returnDate);
  if (adults) params.set('adults', adults.toString());
  if (cabinClass) params.set('cabinClass', cabinClass);

  return params;
}

export function travelSearchToString(state: Partial<TravelSearchState>) {
  const params = travelSearchToParams(state);
  return params.toString();
}

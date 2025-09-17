import {Duffel} from '@duffel/api';

let cachedClient: Duffel | null = null;

export function getDuffelClient() {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('DUFFEL_ACCESS_TOKEN is not configured.');
  }

  if (!cachedClient) {
    cachedClient = new Duffel({token});
  }

  return cachedClient;
}

import { Duffel } from '@duffel/api';

import { serverEnv } from './env/server';

let cachedClient: Duffel | null = null;

export function getDuffelClient() {
  if (!cachedClient) {
    cachedClient = new Duffel({ token: serverEnv.DUFFEL_ACCESS_TOKEN });
  }

  return cachedClient;
}

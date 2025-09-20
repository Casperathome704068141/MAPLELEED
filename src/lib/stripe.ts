import Stripe from 'stripe';

import { clientEnv } from './env/client';
import { serverEnv } from './env/server';

let cachedClient: Stripe | null = null;

export function getStripeClient() {
  if (!cachedClient) {
    cachedClient = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });
  }

  return cachedClient;
}

export function getStripePublishableKey() {
  return clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

export function resolveBaseUrl(request: Request) {
  if (serverEnv.NEXT_PUBLIC_SITE_URL) {
    return serverEnv.NEXT_PUBLIC_SITE_URL;
  }

  try {
    const { protocol, host } = new URL(request.url);
    return `${protocol}//${host}`;
  } catch (error) {
    return 'http://localhost:3000';
  }
}

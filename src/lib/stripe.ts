import Stripe from 'stripe';

let cachedClient: Stripe | null = null;

export function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  if (!cachedClient) {
    cachedClient = new Stripe(secret, {
      apiVersion: '2024-06-20',
    });
  }

  return cachedClient;
}

export function getStripePublishableKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured.');
  }

  return key;
}

export function resolveBaseUrl(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  try {
    const {protocol, host} = new URL(request.url);
    return `${protocol}//${host}`;
  } catch (error) {
    return 'http://localhost:3000';
  }
}

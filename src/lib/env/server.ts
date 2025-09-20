import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.string().default('development'),
  DUFFEL_ACCESS_TOKEN: z.string().min(1, 'DUFFEL_ACCESS_TOKEN is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'FIREBASE_ADMIN_PROJECT_ID is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1, 'FIREBASE_ADMIN_CLIENT_EMAIL is required'),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'FIREBASE_ADMIN_PRIVATE_KEY is required'),
  FIREBASE_APPOINTMENTS_COLLECTION: z.string().min(1).default('appointments'),
  FIREBASE_ORDERS_COLLECTION: z.string().min(1).default('orders'),
  ADMIN_ALLOWED_UID: z.string().min(1, 'ADMIN_ALLOWED_UID is required'),
  ADMIN_SHARED_SECRET: z.string().min(1, 'ADMIN_SHARED_SECRET is required'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().email().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export const serverEnv: ServerEnv = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DUFFEL_ACCESS_TOKEN: process.env.DUFFEL_ACCESS_TOKEN,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_APPOINTMENTS_COLLECTION: process.env.FIREBASE_APPOINTMENTS_COLLECTION,
  FIREBASE_ORDERS_COLLECTION: process.env.FIREBASE_ORDERS_COLLECTION,
  ADMIN_ALLOWED_UID: process.env.ADMIN_ALLOWED_UID,
  ADMIN_SHARED_SECRET: process.env.ADMIN_SHARED_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
});

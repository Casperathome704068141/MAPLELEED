
import { createHmac, timingSafeEqual } from 'crypto';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { serverEnv } from './env/server';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

type SignedSession = {
  expiresAt: number;
};

export type AdminSession = {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

const SESSION_EXPIRY_MS = ADMIN_SESSION_MAX_AGE * 1000;

function signSessionPayload(expiresAt: number) {
  const payload = `${serverEnv.ADMIN_ALLOWED_EMAIL.toLowerCase()}:${expiresAt}`;
  return createHmac('sha256', serverEnv.ADMIN_SHARED_SECRET).update(payload).digest('base64url');
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;
  const signature = signSessionPayload(expiresAt);
  const token = `${expiresAt}.${signature}`;

  return { token, expiresAt } as const;
}

function decodeSignedSession(value: string): SignedSession | null {
  const [expiresAtRaw, providedSignature] = value.split('.');

  if (!expiresAtRaw || !providedSignature) {
    return null;
  }

  const expiresAt = Number.parseInt(expiresAtRaw, 10);

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  try {
    const expectedSignature = signSessionPayload(expiresAt);
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    const providedBuffer = Buffer.from(providedSignature, 'base64url');

    if (expectedBuffer.length !== providedBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
      return null;
    }

    return { expiresAt };
  } catch (error) {
    console.warn('Failed to decode admin session cookie', error);
    return null;
  }
}

export async function verifyAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie) {
    return null;
  }

  const decoded = decodeSignedSession(sessionCookie.value);

  if (!decoded) {
    return null;
  }

  if (decoded.expiresAt <= Date.now()) {
    return null;
  }

  return {
    uid: 'admin',
    email: serverEnv.ADMIN_ALLOWED_EMAIL,
    name: 'Administrator',
    picture: null,
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await verifyAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

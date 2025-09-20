import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getFirebaseAdminAuth } from './firebase-admin';
import { serverEnv } from './env/server';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SHARED_SECRET_COOKIE = 'admin_shared_secret';

export type AdminSession = {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

export async function verifyAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sharedSecret = cookieStore.get(ADMIN_SHARED_SECRET_COOKIE);

  if (!sharedSecret || sharedSecret.value !== serverEnv.ADMIN_SHARED_SECRET) {
    return null;
  }

  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie.value, true);

    if (decoded.uid !== serverEnv.ADMIN_ALLOWED_UID) {
      return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  } catch (error) {
    console.warn('Admin session verification failed', error);
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await verifyAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

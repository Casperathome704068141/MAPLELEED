import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ADMIN_SESSION_COOKIE, ADMIN_SHARED_SECRET_COOKIE } from '@/lib/auth';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';
import { serverEnv } from '@/lib/env/server';

const bodySchema = z.object({
  idToken: z.string().min(10),
  sharedSecret: z.string().min(1),
});

const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { idToken, sharedSecret } = bodySchema.parse(payload);

    if (sharedSecret !== serverEnv.ADMIN_SHARED_SECRET) {
      return NextResponse.json({ error: 'Invalid shared secret.' }, { status: 401 });
    }

    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);

    const allowedEmail = serverEnv.ADMIN_ALLOWED_EMAIL.toLowerCase();
    const isAllowedUid = decoded.uid === serverEnv.ADMIN_ALLOWED_UID;
    const isAllowedEmail = decoded.email?.toLowerCase() === allowedEmail;

    if (!isAllowedUid && !isAllowedEmail) {
      return NextResponse.json({ error: 'You do not have admin access.' }, { status: 403 });
    }

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRY_MS });
    const secure = serverEnv.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      sameSite: 'strict',
      secure,
      path: '/',
      maxAge: SESSION_EXPIRY_MS / 1000,
    });

    response.cookies.set({
      name: ADMIN_SHARED_SECRET_COOKIE,
      value: serverEnv.ADMIN_SHARED_SECRET,
      httpOnly: true,
      sameSite: 'strict',
      secure,
      path: '/',
      maxAge: SESSION_EXPIRY_MS / 1000,
    });

    return response;
  } catch (error: any) {
    console.error('Failed to create admin session', error);
    const message = error instanceof z.ZodError ? 'Invalid request payload.' : 'Authentication failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const response = NextResponse.json({ success: true });
  const secure = serverEnv.NODE_ENV === 'production';

  if (cookieStore.get(ADMIN_SESSION_COOKIE)) {
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: '',
      httpOnly: true,
      sameSite: 'strict',
      secure,
      path: '/',
      maxAge: 0,
    });
  }

  if (cookieStore.get(ADMIN_SHARED_SECRET_COOKIE)) {
    response.cookies.set({
      name: ADMIN_SHARED_SECRET_COOKIE,
      value: '',
      httpOnly: true,
      sameSite: 'strict',
      secure,
      path: '/',
      maxAge: 0,
    });
  }

  return response;
}

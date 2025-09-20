
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSessionToken } from '@/lib/auth';
import { serverEnv } from '@/lib/env/server';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { email, password } = bodySchema.parse(payload);

    const allowedEmail = serverEnv.ADMIN_ALLOWED_EMAIL.toLowerCase();
    const providedEmail = email.toLowerCase();

    if (allowedEmail !== providedEmail || password !== serverEnv.ADMIN_SHARED_SECRET) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const { token } = createAdminSessionToken();
    const secure = serverEnv.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure,
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error: unknown) {
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

  return response;
}

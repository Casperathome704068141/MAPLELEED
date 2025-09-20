
import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE);

  if (pathname.startsWith('/admin')) {
    // If trying to access the login page with a session, redirect to dashboard
    if (sessionCookie && pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // If trying to access a protected admin page without a session, redirect to login
    if (!sessionCookie && !pathname.startsWith('/admin/login')) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

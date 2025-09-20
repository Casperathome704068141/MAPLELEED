import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_SESSION_COOKIE, ADMIN_SHARED_SECRET_COOKIE } from '@/lib/auth';
import { serverEnv } from '@/lib/env/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
  const secretCookie = request.cookies.get(ADMIN_SHARED_SECRET_COOKIE);

  const hasValidSession = sessionCookie && secretCookie && secretCookie.value === serverEnv.ADMIN_SHARED_SECRET;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === '/admin/login' && hasValidSession) {
    // If the user is logged in and tries to access the login page, redirect them to the dashboard.
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all paths under /admin, except for the login page itself.
   * This uses a negative lookahead to exclude /admin/login from the match.
   * It also ignores static files and image optimization paths.
   */
  matcher: ['/admin/:path((?!login$).*)'],
};

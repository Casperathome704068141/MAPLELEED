import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_SHARED_SECRET = process.env.ADMIN_SHARED_SECRET;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the user is trying to access the login page, let them through.
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // For any other /admin route, verify the session.
  if (pathname.startsWith('/admin')) {
    if (!ADMIN_SHARED_SECRET) {
      // If the secret isn't configured, allow access but maybe log a warning.
      // For production, you'd likely want to deny access.
      return NextResponse.next();
    }

    const cookieSecret = request.cookies.get('admin_shared_secret')?.value;
    if (cookieSecret === ADMIN_SHARED_SECRET) {
      // If the cookie is valid, let them proceed.
      return NextResponse.next();
    }

    // If the cookie is missing or invalid, redirect to the login page.
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply the middleware to all routes under /admin.
  // The logic inside the middleware now correctly handles the /admin/login exception.
  matcher: ['/admin/:path*'],
};

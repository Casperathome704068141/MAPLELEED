import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_SHARED_SECRET = process.env.ADMIN_SHARED_SECRET;

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (!ADMIN_SHARED_SECRET) {
    return NextResponse.next();
  }

  const cookieSecret = request.cookies.get('admin_shared_secret')?.value;
  if (cookieSecret === ADMIN_SHARED_SECRET) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};

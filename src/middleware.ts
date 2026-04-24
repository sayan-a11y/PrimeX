import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all routes starting with /secure-root-ax91/admin
  // Except the login page
  if (pathname.startsWith('/secure-root-ax91/admin') && !pathname.includes('/login')) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/secure-root-ax91/admin/login', request.url));
    }

    // In a real production app, we would verify the JWT here.
    // For this demonstration, we assume the client-side login handles the cookie correctly.
    // We could decode the JWT without verifying to check the role.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/secure-root-ax91/:path*'],
};

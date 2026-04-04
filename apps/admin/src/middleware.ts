import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't need auth
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '?'))) {
    return NextResponse.next();
  }

  // Admin uses sessionStorage — not readable from middleware (server-side).
  // We rely on the client-side providers.tsx → onUnauthorized callback to
  // redirect to /login when a 401 is received from the API.
  //
  // For an extra layer of protection at the edge, we check a lightweight
  // "admin_authed" cookie that the login page sets (httpOnly: false so
  // JS can write it, but it just signals presence — not a security token).
  const authed = request.cookies.get('admin_session')?.value;

  if (!authed && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};

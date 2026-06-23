import { NextResponse } from 'next/server';

// public pages ; everything else is reserved for logged-in users
const PUBLIC = ['/', '/login', '/restricted'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const loggedIn = request.cookies.get('trend_token');

  if (!loggedIn && !PUBLIC.includes(pathname)) {
    return NextResponse.redirect(new URL('/restricted', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

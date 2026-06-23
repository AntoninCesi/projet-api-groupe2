import { NextResponse } from 'next/server';

// pages publiques ; tout le reste est réservé aux users connectés
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

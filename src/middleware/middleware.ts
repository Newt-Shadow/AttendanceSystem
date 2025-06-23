// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  const { pathname } = request.nextUrl;

  if (pathname === '/login' || pathname === '/') {
    console.log('Middleware: Bypassing auth for path:', pathname);
    return NextResponse.next();
  }

  if (!token) {
    console.log('Middleware: No token provided, redirecting to /login from', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    console.log('Middleware: JWT payload:', decoded, 'for path:', pathname);

    const role = decoded.role.toLowerCase();
    if (pathname.startsWith(`/${role}`)) {
      request.headers.set('user', JSON.stringify(decoded));
      return NextResponse.next();
    }

    console.log(`Middleware: Redirecting to /${role} from ${pathname}`);
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  } catch (error) {
    console.error('Middleware: Error verifying token:', error, 'for path:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
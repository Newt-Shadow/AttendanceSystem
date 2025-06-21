import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    request.headers.set('user', JSON.stringify(decoded));

    const { pathname } = request.nextUrl;
    const role = decoded.role.toLowerCase();

    if (pathname.startsWith(`/${role}`)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(`/${role}`, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
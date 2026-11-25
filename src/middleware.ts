import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/jwt-secret';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);

    if (!token) {
      return NextResponse.redirect(loginUrl);
    }

    const secret = new TextEncoder().encode(getJwtSecret());

    try {
      const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
      if (payload.role !== 'ADMIN') {
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('admin_token');
        return response;
      }
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

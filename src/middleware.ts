import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clone headers and inject the custom x-pathname tracking header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      
      // Token is valid, allow request with custom headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    } catch (error) {
      // Token is invalid or expired
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Allow all other routes (and pass down pathname header for server layout checks)
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  // Match all request paths except for internal Next.js assets, static files, and media
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|otf|mp4)).*)',
  ],
};

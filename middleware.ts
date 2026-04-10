import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false // Siempre inglés por defecto
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes with Supabase auth
  if (pathname.startsWith('/admin')) {
    return updateSession(request);
  }

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files with extensions (images, etc)
  ) {
    return NextResponse.next();
  }

  // Redirect unknown paths without locale prefix to home
  // Valid paths start with /es, /en, /admin, or are just /
  const isValidPath =
    pathname === '/' ||
    pathname.startsWith('/es') ||
    pathname.startsWith('/en') ||
    pathname.startsWith('/admin');

  if (!isValidPath) {
    // Return 404 for unknown paths instead of redirecting to home.
    // Rewrite to a non-existent path so Next.js serves not-found.tsx with 404 status.
    // This tells Google to drop these URLs from the index instead of following redirects.
    const url = request.nextUrl.clone();
    url.pathname = '/en/_not-found';
    return NextResponse.rewrite(url);
  }

  // Handle internationalized routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(es|en)/:path*', '/admin/:path*', '/:path*']
};

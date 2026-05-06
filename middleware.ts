/**
 * Middleware for i18n routing and auth protection
 * ✅ Combines next-intl i18n with Supabase Auth protection
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, localePrefix, pathnames } from './lib/i18n/config';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/pages',
  '/admin/media',
  '/admin/plugins',
  '/admin/settings',
  '/owner',
  '/owner/dashboard',
  '/guest',
  '/guest/dashboard',
  '/edit',
];

// Auth routes (redirect if already logged in)
const authRoutes = ['/login', '/register', '/forgot-password'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
});

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.includes(route)
  );
  const isAuthRoute = authRoutes.some(route =>
    pathname.includes(route)
  );

  if (isProtectedRoute || isAuthRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (isProtectedRoute && !user) {
      const locale = pathname.split('/')[1] || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (isAuthRoute && user) {
      const locale = pathname.split('/')[1] || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/(en|es)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};

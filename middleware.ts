/**
 * Next.js Middleware — Auth guard + rate-limit hint
 *
 * Protects all routes under /admin and /editor.
 * Public routes (/, /[slug], /api/ai/*) pass through.
 *
 * Uses @supabase/ssr for cookie-based session refresh on every
 * request, which is required to keep Supabase sessions alive
 * across Server Components.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = ["/admin", "/editor"];

/** Routes that are always public (even if they match a prefix above). */
const PUBLIC_PATHS = ["/admin/login", "/admin/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through public paths immediately
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Only run auth check on protected prefixes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Refresh session cookies via @supabase/ssr
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};

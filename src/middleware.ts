import {
  apiAuthPrefix,
  Default_login_Redirect,
  protectedRoutes,
  PublicRoute,
} from "@/lib/routes";
import authConfig from "../auth.config";
import NextAuth from "next-auth";
import { getLocales } from '@/locales/dictionary';
import { defaultLocale } from '@/locales/config';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextResponse } from 'next/server';

// Locale detection function
function detectLocale(request: Request): string {
  try {
    const acceptLanguage = request.headers.get('accept-language') ?? '';
    const headers = { 'accept-language': acceptLanguage };
    const languages = new Negotiator({ headers }).languages();
    const locales = getLocales();
    return match(languages, locales, defaultLocale);
  } catch (error) {
    console.error("Error detecting locale:", error);
    return defaultLocale;
  }
}

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const response = NextResponse.next();
  // Create response early to allow modifications
  const allowedOrigins = [
    'https://app.ocean00.com',
    'https://www.ocean00.com',
    'http://localhost:3000', // for development
    'http://localhost:3010'
  ]

  const origin = req.headers.get('origin')

  // if (allowedOrigins.includes(origin!)) {
  //   console.log(`Setting CORS headers for origin: ${origin}`);
  //   response.headers.set('Access-Control-Allow-Origin', origin!)
  // }

  response.headers.set('Access-Control-Allow-Origin', '*'); // Or specify your Flutter app's origin
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT,PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Handle locale detection and cookie setting
  try {
    if (!req.cookies.get('locale')) {
      const detectedLocale = detectLocale(req);
      response.cookies.set('locale', detectedLocale, {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }
  } catch (error) {
    console.error("Error setting locale cookie:", error);
  }

  // Debug information
  console.log({
    path: nextUrl.pathname,
    isLoggedIn,
    isPublicRoute: PublicRoute.some(route =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(route)
    ),
    isProtectedRoute: protectedRoutes.some(route =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(route)
    ),
  });

  // Early return for API authentication routes
  if (apiAuthPrefix.some(prefix => nextUrl.pathname.startsWith(prefix))) {
    const authHeader = req.headers.get('Authorization')
    console.log("🚀 ~ auth ~ authHeader:", authHeader)
    return response;
  }

  // Check route types with more robust checking
  const isPublicRoute = PublicRoute.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route)
  );

  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route)
  );

  // 1. Handle protected routes - MOST IMPORTANT FIX
  if (isProtectedRoute) {
    // If not logged in, always redirect away from protected routes
    if (!isLoggedIn) {
      console.log("Redirecting unauthenticated user from protected route");
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // User is logged in and can access protected routes
    return response;
  }

  // 2. Redirect logged-in users from home page to dashboard
  if (isLoggedIn && nextUrl.pathname === "/") {
    console.log("Redirecting authenticated user from homepage to dashboard");
    return NextResponse.redirect(new URL(Default_login_Redirect, nextUrl));
  }

  // 3. Handle non-protected routes
  if (!isLoggedIn && !isPublicRoute) {
    // Redirect unauthenticated users to login page for non-public routes
    console.log("Redirecting unauthenticated user from non-public route");
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Default: allow access
  return response;
});

// Matcher configuration
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|css|js)$).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
import {
  apiAuthPrefix,
  Default_login_Redirect,
  protectedRoutes,
  PublicRoute,
} from "@/lib/routes";
import authConfig from "../auth.config";
import NextAuth from "next-auth";
import { getLocales } from '@/locales/dictionary';  // Import the locales
import { defaultLocale } from '@/locales/config'; // Import the default locale
import { match } from '@formatjs/intl-localematcher'; // Import match for locale matching
import Negotiator from 'negotiator'; // Import Negotiator to parse languages
import { NextResponse } from 'next/server'; // Import NextResponse for handling responses

// Locale detection logic
function detectLocale(request: Request) {
  const headers = { 'accept-language': request.headers.get('accept-language') ?? '' };
  const languages = new Negotiator({ headers }).languages(); // Get preferred languages
  const locales = getLocales(); // Get available locales from your locales dictionary

  // Match the browser language with available locales
  const locale = match(languages, locales, defaultLocale); // Default to `defaultLocale` if no match
  return locale;
}

const { auth } = NextAuth(authConfig);

/* @ts-ignore */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // Check if the user is logged in
  console.log("🚀 ~ auth ~ isLoggedIn:", isLoggedIn);
  console.log("path name", nextUrl.pathname);

  // Detect and set locale if not already set
  const detectedLocale = detectLocale(req);
  
  // Use NextResponse to set the locale cookie if not already set
  const response = NextResponse.next(); // Create a response using NextResponse
  if (!req.cookies.get('locale')) {
    response.cookies.set('locale', detectedLocale); // Set locale cookie to the detected one
  }

  const isApiAuthRoutes = apiAuthPrefix.includes(nextUrl.pathname); // Check if it's an API route
  const isPublicRoutes = PublicRoute.includes(nextUrl.pathname); // Check if it's a public route
  const isAuthRoutes = protectedRoutes.includes(nextUrl.pathname); // Check if it's a protected route

  // Do not process API authentication routes
  if (isApiAuthRoutes) return response;

  // Redirect user to login if not logged in and accessing non-public routes
  if (!isLoggedIn && !isPublicRoutes) {
    console.log("Redirecting to public route");
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Handle redirection for auth routes (protected routes)
  if (isAuthRoutes) {
    console.log("Handling API route logic");
    if (isLoggedIn) {
      if (nextUrl.pathname === "/dashboard") {
        return response; // Allow access to the dashboard if logged in
      }
      return NextResponse.redirect(new URL(Default_login_Redirect, nextUrl)); // Redirect to the default login redirect
    }
    return response;
  }

  console.log("Proceeding with other routes");
  return response;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

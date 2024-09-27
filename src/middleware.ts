"use server";
import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import {
  apiAuthPrefix,
  Default_login_Redirect,
  protectedRoutes,
  PublicRoute,
} from "./lib/routes";

// 1. Specify protected and public routes
// const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = PublicRoute.includes(path);
  const isApiRoute = apiAuthPrefix.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = cookies().get("session")?.value;
  const session = await decrypt(cookie);
  if (isApiRoute) {
    let token = req.headers.get("authorization");
    // if (!token) return Response.json({ Error: "no token" }, { status: 404 });
    // const session2 = await decrypt(token.substring(7));
    // if (!session2?.userId)
    //   return Response.json({ error: "Token Invalid" }, { status: 404 });
  }

  // 5. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL(Default_login_Redirect, req.nextUrl));
  }

  // 6. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

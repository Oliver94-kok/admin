import {
  apiAuthPrefix,
  Default_login_Redirect,
  protectedRoutes,
  PublicRoute,
} from "@/lib/routes";
import authConfig from "../auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);
/* @ts-ignore */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  console.log("🚀 ~ auth ~ isLoggedIn:", isLoggedIn);
  console.log("path name", nextUrl.pathname);
  const isApiAuthRoutes = apiAuthPrefix.includes(nextUrl.pathname);
  const isPublicRoutes = PublicRoute.includes(nextUrl.pathname);
  const isAuthRoutes = protectedRoutes.includes(nextUrl.pathname);
  if (isApiAuthRoutes) return null;

  if (!isLoggedIn && !isPublicRoutes) {
    console.log("masuk public route ke");
    return Response.redirect(new URL("/", nextUrl));
  }
  if (isAuthRoutes) {
    console.log("masuk api route ke");
    if (isLoggedIn) {
      if (nextUrl.pathname == "/dashboard") {
        return null;
      }
      return Response.redirect(new URL(Default_login_Redirect, nextUrl));
    }
    return null;
  }
  console.log("masuk  route ke");
  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

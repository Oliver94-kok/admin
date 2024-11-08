import NextAuth from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "@/data/user";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  callbacks: {
    // async signIn({ user, account }) {
    //   console.log("🚀 ~ signIn ~ user:", user);

    //   if (account?.provider !== "credentials") return true;
    //   const existingUser = await getUserById(user.id!);
    //   if (!existingUser) return false;

    //   return true;
    // },
    async session({ token, session }) {
      session.user = token.user as any;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});

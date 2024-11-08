import credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import bcrypt from "bcryptjs";
import { SignInSchema } from "@/lib/schema";
import { getUserByUsername } from "@/data/user";

export default {
  providers: [
    credentials({
      async authorize(credentials) {
        console.log("🚀 ~ authorize ~ credentials:", credentials);
        const validateField = SignInSchema.safeParse(credentials);
        console.log("🚀 ~ authorize ~ validateField:", validateField);
        if (validateField.success) {
          const { username, password } = validateField.data;
          const user = await getUserByUsername(username);
          console.log("🚀 ~ authorize ~ user:", user);
          if (!user || !user.password) return null;

          const passwordmatch = await bcrypt.compare(password, user.password);
          console.log("🚀 ~ authorize ~ passwordmatch:", passwordmatch);
          if (passwordmatch) return user;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

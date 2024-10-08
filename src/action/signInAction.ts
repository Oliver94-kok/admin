"use server";
import { getUserByUsername } from "@/data/user";
import { checkPassword } from "@/lib/function";
import { SignInSchema } from "@/lib/schema";
import { createSession } from "@/lib/session";
import { z } from "zod";

export const SignInAction = async (data: z.infer<typeof SignInSchema>) => {
  const validateField = SignInSchema.safeParse(data);
  if (!validateField.success) return { error: "Invalid field" };
  const { username, password } = validateField.data;
  let user = await getUserByUsername(username);
  if (!user) return { error: "User not found" };
  let hashPassword = await checkPassword(password, user.password);
  if (!hashPassword) return { error: "Username or password not match" };
  if (user.role != "ADMIN") return { error: "Please contact administrator" };
  createSession(username);
  return { success: "success" };
};

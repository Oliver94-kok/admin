"use server";
import { getUserByUsername } from "@/data/user";
import { checkPassword } from "@/lib/function";
import { SignInSchema } from "@/lib/schema";
import { createSession } from "@/lib/session";
import { z } from "zod";
import { signIn } from "../../auth";
import { Default_login_Redirect } from "@/lib/routes";
import { AuthError } from "next-auth";

export const SignInAction = async (data: z.infer<typeof SignInSchema>) => {
  const validateField = SignInSchema.safeParse(data);
  if (!validateField.success) return { error: "Invalid field" };
  const { username, password } = validateField.data;
  let user = await getUserByUsername(username);
  if (!user) return { error: "User not found" };
  let hashPassword = await checkPassword(password, user.password);
  if (!hashPassword) return { error: "Username or password not match" };
  if (user.role == "USER") return { error: "Please contact administrator" };
  createSession(username);
  try {
    let resutl = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (resutl.success) {
      return { success: "sucess" };
    }
  } catch (error) {
    console.log("🚀 ~ SignInAction ~ error:", error);
    if (error instanceof AuthError) {
      console.log("🚀 ~ SignInAction ~ error:", error);
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credential" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
  return { success: "success" };
};

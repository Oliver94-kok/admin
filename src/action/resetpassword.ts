"use server";
import { getUserById, getUserByUsername } from "@/data/user";
import { db } from "@/lib/db";
import { hashPassword, randomPassword } from "@/lib/function";

export const resetPasswordUser = async (id: string) => {
  console.log("🚀 ~ resetPasswordUser ~ id:", id);
  const user = await getUserByUsername(id);
  console.log("🚀 ~ resetPasswordUser ~ user:", user);
  if (!user) return { error: "User not exist" };
  let password = await randomPassword();
  let hash = await hashPassword(password);
  try {
    await db.user.update({ where: { id: user.id }, data: { password: hash } });
    return { success: password };
  } catch (error) {
    return { error: "error update user" };
  }
};

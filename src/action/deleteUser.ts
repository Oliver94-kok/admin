"use server";

import { getUserByUsername } from "@/data/user";
import { db } from "@/lib/db";

export const deleteUsers = async (username: string) => {
  let user = await getUserByUsername(username);
  if (!user) return { error: "User not exist" };

  try {
    await db.attendBranch.delete({ where: { userId: user.id } });
    await db.attends.deleteMany({ where: { userId: user.id } });
    await db.salary.deleteMany({ where: { userId: user.id } });
    await db.notificationUser.delete({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
    return { success: "user has been delete" };
  } catch (error) {
    console.log("🚀 ~ deleteUsers ~ error:", error);
    return { error: "cannot delete" };
  }
};

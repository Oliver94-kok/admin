"use server";

import { Logging } from "@/data/log";
import { getUserByUsername } from "@/data/user";
import { db } from "@/lib/db";
import { auth } from "../../auth";

export const deleteUsers = async (username: string) => {
  const session = await auth()
  let user = await getUserByUsername(username);
  if (!user) return { error: "User not exist" };

  try {

    await db.user.update({ where: { id: user.id }, data: { isDelete: true } });
    await Logging(user.id, "Success delete user", `Delete user ${user.username}`)
    return { success: "User has been delete" };
  } catch (error) {
    console.log("🚀 ~ deleteUsers ~ error:", error);
    await Logging(session?.user.id, "Error delete user", `Delete user ${user.username}`)
    return { error: "cannot delete" };
  }
};

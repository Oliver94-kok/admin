"use server";

import { db } from "@/lib/db";

export const addPerDay = async (id: string, perDay: number) => {
  const user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = perDay * user.workingDay!;
  console.log("🚀 ~ addPerDay ~ total:", total);
  try {
    await db.salary.update({ where: { id }, data: { perDay, total } });
    return { success: "Success", total };
  } catch (error) {
    return { error: "error while update data" };
  }
};

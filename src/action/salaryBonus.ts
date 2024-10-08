"use server";

import { db } from "@/lib/db";

export const AddBonus = async (id: string, bonus: number) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! + bonus;
  try {
    await db.salary.update({ where: { id }, data: { bonus, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delBonus = async (id: string) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.bonus!;
  try {
    await db.salary.update({ where: { id }, data: { bonus: null, total } });
    return { success: "success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

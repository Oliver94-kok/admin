"use server";

import { db } from "@/lib/db";

export const AddAllow = async (id: string, allowance: number) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! + allowance;
  try {
    await db.salary.update({ where: { id }, data: { allowance, total } });
    return { success: "Success ", total };
  } catch (error) {
    return { error: "error while update data" };
  }
};

export const delAllow = async (id: string) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.allowance!;
  try {
    await db.salary.update({ where: { id }, data: { allowance: null, total } });
    return { success: "success ", total };
  } catch (error) {
    return { error: "error while delete" };
  }
};

"use server";

import { db } from "@/lib/db";

export const AddCover = async (id: string, cover: number) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! + cover;
  try {
    await db.salary.update({ where: { id }, data: { cover, total } });
    return { success: "Success ", total };
  } catch (error) {
    return { error: "error while update data" };
  }
};

export const delCover = async (id: string) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.cover!;
  try {
    await db.salary.update({ where: { id }, data: { cover: null, total } });
    return { success: "success ", total };
  } catch (error) {
    return { error: "error while delete" };
  }
};

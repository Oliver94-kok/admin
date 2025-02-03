"use server";

import { db } from "@/lib/db";

export const AddAdvance = async (id: string, advance: number) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! + advance;
  try {
    await db.salary.update({ where: { id }, data: { Advance: advance, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delAdvance = async (id: string) => {
  console.log("masuk sini", id);
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.Advance!;
  try {
    await db.salary.update({ where: { id }, data: { Advance: null, total } });
    return { success: "success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

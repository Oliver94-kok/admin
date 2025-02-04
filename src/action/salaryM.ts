"use server";

import { db } from "@/lib/db";

export const AddM = async (id: string, M: number) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    let total = 0;
    if (user.total == null) {
      let t = user?.workingDay! * user?.perDay!;
      total = t + M;
    } else {
      total = user?.total! + M;
    }

    await db.salary.update({ where: { id }, data: { m: M, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delM = async (id: string) => {
  console.log("masuk sini", id);
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.m!;
  try {
    await db.salary.update({ where: { id }, data: { m: null, total } });
    return { success: "success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

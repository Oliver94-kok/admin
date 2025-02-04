"use server";

import { db } from "@/lib/db";

export const AddAllow = async (id: string, allowance: number) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let total = user?.total! + allowance;

    let total = 0;
    if (user.total == null) {
      let t = user?.workingDay! * user?.perDay!;
      total = t + allowance;
    } else {
      total = user?.total! + allowance;
    }
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

"use server";

import { db } from "@/lib/db";

export const AddShort = async (id: string, short: number) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };

    let total = 0;
    if (user.total == null) {
      let t = user?.workingDay! * user?.perDay!;
      total = t + short;
    } else {
      total = user?.total! + short;
    }
    await db.salary.update({ where: { id }, data: { short: short, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delShort = async (id: string) => {
  console.log("masuk sini", id);
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user.total;
  if (user.short! > 0) {
    total = user?.total! - user.short!;
  }
  try {
    await db.salary.update({ where: { id }, data: { short: null, total } });
    return { success: "success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

"use server";

import { db } from "@/lib/db";

export const AddBonus = async (id: string, bonus: number) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };

    let total = 0;
    if (user.total == null) {
      let t = user?.workingDay! * user?.perDay!;
      total = t + bonus;
    } else {
      total = user?.total! + bonus;
    }

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

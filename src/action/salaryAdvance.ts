"use server";

import { db } from "@/lib/db";

export const AddAdvance = async (id: string, advance: number) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let total = user?.total! + advance;

    let total = 0;
    if (user.total == null) {
      let t = user?.workingDay! * user?.perDay!;
      total = t + advance;
    } else {
      total = user?.total! + advance;
    }
    await db.salary.update({
      where: { id },
      data: { advances: advance, total },
    });
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
  // let total = user?.total! - user.advances!;
  let total = user.total;
  try {
    await db.salary.update({ where: { id }, data: { advances: null, total } });
    return { success: "success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

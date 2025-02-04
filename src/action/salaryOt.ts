"use server";

import { db } from "@/lib/db";

export const AddOverTime = async (id: string, ot: number) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let total = user?.total! + ot;

    let total = 0;
    if (user.total == null) {
      let t = user?.workingDay! * user?.perDay!;
      total = t + ot;
    } else {
      total = user?.total! + ot;
    }
    await db.salary.update({ where: { id }, data: { overTime: ot, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delOvetime = async (id: string) => {
  console.log("masuk sini", id);
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.overTime!;
  try {
    await db.salary.update({ where: { id }, data: { overTime: null, total } });
    return { success: "success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

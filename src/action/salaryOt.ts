"use server";

import { calculateTotalSalaryUserBySalaryId } from "@/data/salary";
import { db } from "@/lib/db";

export const AddOverTime = async (id: string, ot: number) => {
  try {
    await calculateTotalSalaryUserBySalaryId(id);
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    let total = user?.total! + ot;

    await db.salary.update({ where: { id }, data: { overTime: ot, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delOvetime = async (id: string) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let t/otal = user?.total! - user.overTime!;

    await db.salary.update({ where: { id }, data: { overTime: null } });
    await calculateTotalSalaryUserBySalaryId(id);
    let salary = await db.salary.findFirst({ where: { id } });
    return { success: "success ", total: salary?.total! };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

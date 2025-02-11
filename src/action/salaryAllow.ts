"use server";

import { calculateTotalSalaryUserBySalaryId } from "@/data/salary";
import { db } from "@/lib/db";

export const AddAllow = async (id: string, allowance: number) => {
  try {
    await calculateTotalSalaryUserBySalaryId(id);
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    let total = user?.total! + allowance;

    await db.salary.update({ where: { id }, data: { allowance, total } });
    return { success: "Success ", total };
  } catch (error) {
    return { error: "error while update data" };
  }
};

export const delAllow = async (id: string) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let total = user?.total! - user.allowance!;

    await db.salary.update({ where: { id }, data: { allowance: null } });
    await calculateTotalSalaryUserBySalaryId(id);
    let salary = await db.salary.findFirst({ where: { id } });
    return { success: "success ", total: salary?.total! };
  } catch (error) {
    return { error: "error while delete" };
  }
};

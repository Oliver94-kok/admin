"use server";

import { calculateTotalSalaryUserBySalaryId } from "@/data/salary";
import { db } from "@/lib/db";

export const AddShort = async (id: string, short: number) => {
  try {
    await calculateTotalSalaryUserBySalaryId(id);

    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };

    let total = user?.total! + short;

    await db.salary.update({ where: { id }, data: { short: short, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delShort = async (id: string) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };

    await db.salary.update({ where: { id }, data: { short: null } });
    await calculateTotalSalaryUserBySalaryId(id);
    let salary = await db.salary.findFirst({ where: { id } });
    return { success: "success ", total: salary?.total! };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

"use server";

import { calculateTotalSalaryUserBySalaryId } from "@/data/salary";
import { db } from "@/lib/db";

export const AddM = async (id: string, M: number) => {
  try {
    await calculateTotalSalaryUserBySalaryId(id);
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    let total = user?.total! + M;

    await db.salary.update({ where: { id }, data: { m: M, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delM = async (id: string) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let total = user?.total! - user.m!;

    await db.salary.update({ where: { id }, data: { m: null } });
    await calculateTotalSalaryUserBySalaryId(id);
    let salary = await db.salary.findFirst({ where: { id } });
    return { success: "success ", total: salary?.total! };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

"use server";

import { calculateTotalSalaryUserBySalaryId } from "@/data/salary";
import { db } from "@/lib/db";

export const AddBonus = async (id: string, bonus: number) => {
  try {
    await calculateTotalSalaryUserBySalaryId(id);
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    let total = user?.total! + bonus;

    await db.salary.update({ where: { id }, data: { bonus, total } });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delBonus = async (id: string) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let total = user?.total! - user.bonus!;

    await db.salary.update({ where: { id }, data: { bonus: null } });
    await calculateTotalSalaryUserBySalaryId(id);
    let salary = await db.salary.findFirst({ where: { id } });
    return { success: "success ", total: salary?.total! };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

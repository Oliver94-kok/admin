"use server";

import {
  calculateTotalSalaryUser,
  calculateTotalSalaryUserBySalaryId,
} from "@/data/salary";
import { db } from "@/lib/db";

export const AddAdvance = async (id: string, advance: number) => {
  try {
    await calculateTotalSalaryUserBySalaryId(id);

    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    console.log("🚀 ~ AddAdvance ~ user:", user);
    let total = user?.total! - advance;

    // let total = 0;
    // if (user.total == null) {
    //   let t = user?.workingDay! * user?.perDay!;
    //   total = t - advance;
    // } else {
    //   total = user?.total! - advance;
    // }
    await db.salary.update({
      where: { id },
      data: { advances: Math.abs(advance) * -1, total },
    });
    return { success: "Success ", total };
  } catch (error) {
    console.log(error);
    return { error: "error while update data" };
  }
};

export const delAdvance = async (id: string) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    // let total = user?.total! - user.advances!;
    // let total = user.total;
    await db.salary.update({ where: { id }, data: { advances: null } });
    await calculateTotalSalaryUserBySalaryId(id);
    let result = await db.salary.findFirst({ where: { id } });

    return { success: "success", total: result?.total! };
  } catch (error) {
    console.log(error);
    return { error: "error while delete" };
  }
};

"use server";

import { calculateTotalSalaryUserBySalaryId } from "@/data/salary";
import { db } from "@/lib/db";

export const AddTransport = async (id: string, transport: number) => {
  try {
    await calculateTotalSalaryUserBySalaryId(id);
    let salary = await db.salary.findFirst({ where: { id } });
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };
    let total = 0;
    if (user.total == null) {
      let t = user?.workingDay! * user?.perDay!;
      total = t + transport;
    } else {
      total = user?.total! + transport;
    }

    await db.salary.update({
      where: { id },
      data: { transport: transport, total },
    });
    return { success: "Success ", total };
  } catch (error) {
    return { error: "error while update data" };
  }
};

export const delTransport = async (id: string) => {
  try {
    let user = await db.salary.findFirst({ where: { id } });
    if (!user) return { error: "cannot find user" };

    await db.salary.update({ where: { id }, data: { transport: null } });
    await calculateTotalSalaryUserBySalaryId(id);
    let salary = await db.salary.findFirst({ where: { id } });
    return { success: "success ", total: salary?.total! };
  } catch (error) {
    return { error: "error while delete" };
  }
};

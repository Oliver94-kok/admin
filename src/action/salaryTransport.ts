"use server";

import { db } from "@/lib/db";

export const AddTransport = async (id: string, transport: number) => {
  try {
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
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.transport!;
  try {
    await db.salary.update({ where: { id }, data: { transport: null, total } });
    return { success: "success ", total };
  } catch (error) {
    return { error: "error while delete" };
  }
};

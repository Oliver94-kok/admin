"use server";

import { db } from "@/lib/db";

export const ApproveLeave = async (status: string, id: string) => {
  try {
    let a = await db.leave.update({ where: { id }, data: { status } });
    let user = await db.user.findFirst({ where: { id: a.userId } });
    return { success: "success", leaveId: a.id, username: user?.username };
  } catch (error) {
    return { error: "error " };
  }
};

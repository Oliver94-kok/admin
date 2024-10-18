"use server";

import { deliveryClockAttend, leaveForgetClockAttend } from "@/data/attend";
import { db } from "@/lib/db";

export const ApproveLeave = async (status: string, id: string) => {
  try {
    let check = await db.leave.findFirst({ where: { id } });
    if (check?.type == "Forget clock") {
      let clockdate = check.startDate.split(" ")[0];
      if (status == "Approve") {
        leaveForgetClockAttend(clockdate, check.userId);
      }
    }
    if (check?.type == "Delivery leave") {
      let clockdate = check.startDate.split(" ")[0];
      if (status == "Approve") {
        deliveryClockAttend(clockdate, check.userId);
      }
    }
    let a = await db.leave.update({ where: { id }, data: { status } });
    let user = await db.user.findFirst({ where: { id: a.userId } });
    return { success: "success", leaveId: a.id, username: user?.username };
  } catch (error) {
    return { error: "error " };
  }
};

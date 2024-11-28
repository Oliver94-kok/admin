import { db } from "@/lib/db";
import { auth } from "../../auth";

export const notificationClock = async (userId: string, data: any) => {
  let noti = await db.notificationUser.findFirst({ where: { userId } });
  const currentArray = Array.isArray(noti?.clock) ? noti?.clock : [];
  const updatedArray = [...currentArray, data];
  await db.notificationUser.update({
    where: { id: noti?.id },
    data: { clock: updatedArray },
  });
};

export const getAdminNotify = async (userId: string) => {
  // const session = await auth();
  let notify = await db.notificationUser.findFirst({
    where: { userId },
  });
  const currentArray = Array.isArray(notify?.leave) ? notify?.leave : [];
  return notify?.leave;
};

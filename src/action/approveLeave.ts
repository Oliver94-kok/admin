"use server";

import { deliveryClockAttend, leaveForgetClockAttend } from "@/data/attend";
import { addLeaveAttend, forEachDate } from "@/data/leave";
import { Logging } from "@/data/log";
import { db } from "@/lib/db";
import {
  calculateTimeDifference,
  countDaysBetween,
  extractDateAndDay,
  formatDateTime,
} from "@/lib/function";
import { leaveType } from "@/types/leave";
import dayjs from "dayjs";
const { DateTime } = require("luxon");
import { v7 as uuidv7 } from "uuid";
import { auth } from "../../auth";
export const ApproveLeave = async (status: string, id: string) => {
  const session = await auth()
  let userId
  try {
    let check = await db.leave.findFirst({ where: { id } });
    userId = check?.id
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
    if (status == "Approve") {
      if (check?.type != "Delivery leave" && check?.type != "Forget clock") {
        const startLeave = await extractDateAndDay(check?.startDate!);
        console.log("🚀 ~ ApproveLeave ~ startLeave:", startLeave);
        const endLeave = await extractDateAndDay(check?.endDate!);
        console.log("🚀 ~ ApproveLeave ~ endLeave:", endLeave);
        let checkLeaveType = leaveType.filter((e) => e == check?.type);

        if (startLeave == endLeave) {
          const { hours, isHalfDay } = await calculateTimeDifference(check?.startDate!, check?.endDate!);
          console.log("🚀 ~ ApproveLeave ~ isHalfDay:", isHalfDay)
          const formattedDate = `${startLeave.year}-${startLeave.month}-${startLeave.day}`;
          await addLeaveAttend(
            check?.userId!,
            `${startLeave.year}-${startLeave.month}-${startLeave.day}`,
            isHalfDay
          );
          if (checkLeaveType) {
            let salary = await db.salary.findFirst({
              where: {
                userId: check?.userId,
                year: startLeave.year,
                month: startLeave.month,
              },
            });
            if (!salary)
              throw new Error(
                `User salary for month ${startLeave.month} and year ${startLeave.year} not found`,
              );
            await db.salary.update({
              where: { id: salary.id },
              data: { absent: salary.absent! + 1 },
            });
          }
        } else {
          let totalDays = 0;
          forEachDate(startLeave.date, endLeave.date, async (date) => {
            console.log("🚀 ~ forEachDate ~ date:", date);
            console.log("Date:", dayjs(date).format("YYYY-MM-DD")); // Will show 2024-11-04 and 2024-11-05
            let ndate = dayjs(date).format("YYYY-MM-DD");
            await addLeaveAttend(check?.userId!, ndate);
            totalDays += 1;
          });
          if (checkLeaveType) {
            let salary = await db.salary.findFirst({
              where: {
                userId: check?.userId,
                year: startLeave.year,
                month: startLeave.month,
              },
            });
            if (!salary)
              throw new Error(
                `User salary for month ${startLeave.month} and year ${startLeave.year} not found`,
              );
            await db.salary.update({
              where: { id: salary.id },
              data: { absent: salary.absent! + totalDays },
            });
          }
        }
      }
    }
    let a = await db.leave.update({ where: { id }, data: { status } });
    let user = await db.user.findFirst({ where: { id: a.userId } });
    let randomid = uuidv7();
    // let smdate = await formatDateTime(new Date());
    const currentDates = new Date();
    const currentDate = DateTime.local(currentDates);
    const currentDateInAsia = currentDate.setZone("Asia/Kuala_Lumpur");
    const formattedDateInAsia = currentDateInAsia.toFormat(
      "yyyy-MM-dd HH:mm:ss",
    );
    let smdate = currentDateInAsia.toFormat("dd/MM HH:mm");
    let newnoti = {
      id: randomid,
      type: a.type,
      status: a.status,
      endDate: a.endDate,
      smallDate: smdate,
      startDate: a.startDate,
      create: formattedDateInAsia,
    };
    let noti = await db.notificationUser.findFirst({
      where: { userId: a.userId },
      select: { leave: true, id: true },
    });
    const currentArray = Array.isArray(noti?.leave) ? noti?.leave : [];
    const updatedArray = [...currentArray, newnoti];
    await db.notificationUser.update({
      where: { id: noti?.id },
      data: { leave: updatedArray },
    });
    await Logging(session?.user.id, "Success user leave", `success user leave ${userId} ${status}`)
    return { success: "success", leaveId: a.id, username: user?.username };
  } catch (error) {
    await Logging(session?.user.id, "Error user leave", `Error user leave ${userId}`)
    return { error: "error " };
  }
};

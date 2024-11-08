"use server";

import { deliveryClockAttend, leaveForgetClockAttend } from "@/data/attend";
import { db } from "@/lib/db";
import {
  countDaysBetween,
  extractDateAndDay,
  formatDateTime,
  updateSalaryDays,
} from "@/lib/function";
const { DateTime } = require("luxon");
import { v7 as uuidv7 } from "uuid";
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
    if (status == "Approve") {
      if (check?.type != "Delivery leave") {
        if (check?.type != "Forget clock") {
          const startLeave = await extractDateAndDay(check?.startDate!);
          const endLeave = await extractDateAndDay(check?.endDate!);
          if (startLeave.day == endLeave.day) {
            var day = [
              {
                id: startLeave.day,
                date: startLeave.date,
                clockIn: null,
                clockOut: null,
                late: null,
                noClockin: null,
                fine: null,
                absent: 0,
                leave: 1,
              },
            ];
            await updateSalaryDays({
              userId: check?.userId!,
              month: startLeave.month,
              year: startLeave.year,
              newData: day,
            });
          } else {
            var nArray = [];
            for (
              startLeave.day - 1;
              startLeave.day <= endLeave.day;
              startLeave.day++
            ) {
              var d = `${startLeave.day}-${startLeave.month}-${startLeave.year}`;
              var days = {
                id: startLeave.day,
                date: d,
                clockIn: null,
                clockOut: null,
                late: null,
                noClockin: null,
                fine: null,
                absent: 0,
                leave: 1,
              };
              nArray.push(days);
            }
            console.log(nArray);
            await updateSalaryDays({
              userId: check?.userId!,
              month: startLeave.month,
              year: startLeave.year,
              newData: nArray,
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
    let smdate = currentDateInAsia.toFormat("MM/dd HH:mm");
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
    return { success: "success", leaveId: a.id, username: user?.username };
  } catch (error) {
    return { error: "error " };
  }
};

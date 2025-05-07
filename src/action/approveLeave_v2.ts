"use server";

import { deliveryClockAttend, leaveForgetClockAttend } from "@/data/attend";
import { addLeaveAttend, forEachDate } from "@/data/leave";
import { Logging } from "@/data/log";
import { db } from "@/lib/db";

import { leaveType } from "@/types/leave";
import dayjs from "dayjs";
const { DateTime } = require("luxon");
import { v7 as uuidv7 } from "uuid";
import { auth } from "../../auth";
export const ApproveLeaveV2 = async (status: "Approve" | "Reject", id: string) => {
  const session = await auth()
  let userId
  try {
    const leave = await db.leave.findFirst({ where: { id } });
    if (!leave) return { error: "Leave not found" };
    console.log("🚀 ~ ApproveLeaveV2 ~ leave:", leave)
    if (status == "Reject") {
      await db.leave.update({
        where: { id },
        data: { status: "Reject" },
      });
      return { success: "Leave rejected" };
    }
    let clockdate = leave.startDate.split(" ")[0];
    if (leave.type == "Forget clock") {
      await leaveForgetClockAttend(clockdate, leave.userId);
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave approved" };
    }
    if (leave.type == "Delivery late") {
      console.log("late")
      await deliveryClockAttend(clockdate, leave.userId);
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave approved" };
    }
    const shift = await db.attendBranch.findFirst({ where: { userId: leave.userId } })
    if (!shift) {
      return { error: "Shift not found" }
    }
    let checkLeaveType = leaveType.filter((e) => e == leave.type);
    const startTime = dayjs(leave.startDate, 'YYYY-MM-DD hh:mm A');

    const endTime = dayjs(leave.endDate, 'YYYY-MM-DD hh:mm A');

    if (leave.duration == 0.5) {
      let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")) } })
      if (attend) {
        await db.attends.update({ where: { id: attend.id }, data: { status: "Half_Day" } })
        await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
        return { success: "Leave has been approve" }
      }
      await db.attends.create({
        data: {
          userId: leave.userId, dates: startTime.toDate(), status: "Half_Day"
        }
      });
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave has been approve" }
    }
    if (leave.duration == 1) {
      let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")) } })
      if (attend) {
        await db.attends.update({ where: { id: attend.id }, data: { status: "Leave" } })
        await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
        return { success: "Leave has been approve" }
      }
      await db.attends.create({
        data: {
          userId: leave.userId, dates: startTime.toDate(), status: "Leave"
        }
      });
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave has been approve" }
    }
    const startTime2 = dayjs(startTime, 'YYYY-MM-DD');
    const endTime2 = dayjs(endTime, 'YYYY-MM-DD');

    // Loop through dates
    let currentDate = startTime2;
    let d = leave.duration!;
    console.log("Lebih 1 hari")
    while (currentDate.isSameOrBefore(endTime2)) {
      // Do something with the current date
      console.log('date lebih 1 duration', currentDate.format('YYYY-MM-DD'));
      if (d <= 0.5) {
        let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")) } })
        if (attend) {
          await db.attends.update({ where: { id: attend.id }, data: { status: "Half_Day" } })
        } else {
          await db.attends.create({
            data: {
              userId: leave.userId, dates: currentDate.toDate(), status: "Half_Day"
            }
          });
        }
      } else {
        let attend = await db.attends.findFirst({
          where: {
            userId: leave.userId,
            dates: new Date(currentDate.format("YYYY-MM-DD"))
          }
        });
        if (attend) {
          await db.attends.update({ where: { id: attend.id }, data: { status: "Leave" } })
        } else {
          await db.attends.create({
            data: {
              userId: leave.userId, dates: currentDate.toDate(), status: "Leave"
            }
          });
        }
      }
      d -= 1;
      // Move to next day
      currentDate = currentDate.add(1, 'day');
    }
    // await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
    return { success: "Leave approved" };

  } catch (error) {
    console.log("🚀 ~ ApproveLeaveV2 ~ error:", error)
    await Logging(session?.user.id, "Error user leave", `Error user leave ${userId}`)
    return { error: "error " };
  }
};

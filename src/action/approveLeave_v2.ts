"use server";

import { deliveryClockAttend, leaveForgetClockAttend } from "@/data/attend";
import { addLeaveAttend, forEachDate } from "@/data/leave";
import { Logging } from "@/data/log";
import { db } from "@/lib/db";

import { leaveType } from "@/types/leave";
import dayjs, { Dayjs } from "dayjs";
const { DateTime } = require("luxon");
import { v7 as uuidv7 } from "uuid";
import { auth } from "../../auth";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { AttendStatus } from "@prisma/client";
import { branchAssistant } from "@/types/branchs";
import { getNoClockOut } from "@/data/salary";
// Extend Dayjs with UTC and Timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
const userTimezone = 'Asia/Kuala_Lumpur'; // Set your desired timezone
export const ApproveLeaveV2 = async (status: "Approve" | "Reject", id: string) => {
  const session = await auth()
  let userId
  try {
    const leave = await db.leave.findFirst({ where: { id } });
    if (!leave) return { error: "Leave not found" };

    if (status == "Reject") {
      await db.leave.update({
        where: { id },
        data: { status: "Reject" },
      });
      return { success: "Leave rejected" };
    }
    let clockdate = leave.startDate.split(" ")[0];
    if (leave.type == "Forget clock" || leave.type == "Lupa clock" || leave.type == "忘记打卡") {
      await leaveForgetClockAttend(clockdate, leave.userId, leave.id);
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave approved" };
    }
    if (leave.type == "Delivery late" || leave.type == "Penghantaran lewat" || leave.type == "载送延迟") {

      await deliveryClockAttend(clockdate, leave.userId, leave.id);
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave approved" };
    }
    const shift = await db.attendBranch.findFirst({ where: { userId: leave.userId } })
    if (!shift) {
      return { error: "Shift not found" }
    }
    let checkLeaveType = leaveType.filter((e) => e == leave.type);
    let startTime;
    let endTime
    if (leave.duration == null || leave.duration == undefined) {
      startTime = dayjs(leave.startDate, 'YYYY-MM-DD HH:mm ', userTimezone)
      endTime = dayjs(leave.endDate, 'YYYY-MM-DD HH:mm ', userTimezone);
    } else {
      startTime = dayjs(leave.startDate, 'YYYY-MM-DD HH:mm', userTimezone);
      endTime = dayjs(leave.endDate, 'YYYY-MM-DD HH:mm ', userTimezone);
    }
    if (leave.duration == null || leave.duration == undefined) {
      // let duration = endTime.diff(startTime, 'day');
      let duration = calculateShiftLeaveDuration2(startTime, endTime, shift.clockIn!, shift.clockOut!);
      console.log("🚀 ~ ApproveLeaveV2 ~ duration:", leave.id, duration)

      if (duration == 0.5) {
        let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")) } })
        if (attend) {
          let status;
          let fine2;
          if (attend.fine) {
            status = AttendStatus.Half_Day_Late
          } else if (attend.clockIn == null || attend.clockOut == null) {
            let fine200 = branchAssistant.find((e) => e === shift?.branch)
            if (fine200) {
              fine2 = 200;
            } else {
              fine2 = await getNoClockOut(
                attend.userId,
                new Date().getMonth() + 1,
                new Date().getFullYear()
              );
            }
            status = AttendStatus.Half_Day_NoClockIn_Out
          } else {
            status = AttendStatus.Half_Day
          }
          await db.attends.update({ where: { id: attend.id }, data: { status, fine2, leaveId: leave.id } })
          await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
          return { success: "Leave has been approve" }
        }
        await db.attends.create({
          data: {
            userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")), status: "Half_Day", leaveId: leave.id
          }
        });
        await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
        return { success: "Leave has been approve" }
      }
      if (duration == 1 || duration == 0) {
        let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")) } })
        if (attend) {
          await db.attends.update({ where: { id: attend.id }, data: { status: "Leave", leaveId: leave.id } })
          await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
          return { success: "Leave has been approve" }
        }
        await db.attends.create({
          data: {
            userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")), status: "Leave", leaveId: leave.id
          }
        });
        await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
        return { success: "Leave has been approve" }
      }
      const startTime2 = dayjs(startTime, 'YYYY-MM-DD', userTimezone);
      const endTime2 = dayjs(endTime, 'YYYY-MM-DD', userTimezone);
      // Loop through dates
      let currentDate = startTime2;
      let d = leave.duration == null ? duration : leave.duration;
      let startHalfDay;
      if (d % 1 === 0.5) {
        let [hourOut, minuteOut] = shift.clockOut!.split(':').map(Number)
        let [hourIn, minuteIn] = shift.clockIn!.split(':').map(Number);
        let result = (hourOut - hourIn) / 2
        let result2 = Math.abs(result)
        let newtoday = startTime.set('hours', hourIn).set("minutes", minuteIn).add(result2, 'h')
        console.log("🚀 ~ POST ~ newtoday:", newtoday)
        let isSame = startTime.isSame(newtoday);
        if (isSame) {
          startHalfDay = true
        }
      }
      while (currentDate.isSameOrBefore(endTime2)) {
        if (startHalfDay) {
          console.log('duration', d, currentDate.format("YYYY-MM-DD"))
          let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")) } })
          if (attend) {

            await db.attends.update({ where: { id: attend.id }, data: { status: "Half_Day", leaveId: leave.id } })
          } else {

            await db.attends.create({
              data: {
                userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")), status: "Half_Day", leaveId: leave.id
              }
            });
          }
          startHalfDay = false
          d -= 0.5;
          currentDate = currentDate.add(1, 'day');
        }
        if (d == 0.5) {
          let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")) } })
          if (attend) {
            await db.attends.update({ where: { id: attend.id }, data: { status: "Half_Day", leaveId: leave.id } })
          } else {
            await db.attends.create({
              data: {
                userId: leave.userId, dates: currentDate.toDate(), status: "Half_Day", leaveId: leave.id
              }
            });
          }
        } else {
          console.log(`🚀 ~ ApproveLeaveV2 ~ new Date(currentDate.format("YYYY-MM-DD"):`, new Date(currentDate.format("YYYY-MM-DD")))
          let attend = await db.attends.findFirst({
            where: {
              userId: leave.userId,
              dates: new Date(currentDate.format("YYYY-MM-DD"))
            }

          });
          console.log("🚀 ~ ApproveLeaveV2 ~ attend:", attend)
          if (attend) {
            await db.attends.update({ where: { id: attend.id }, data: { status: "Leave", leaveId: leave.id } })
          } else {
            await db.attends.create({
              data: {
                userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")), status: "Leave", leaveId: leave.id
              }
            });
          }
        }
        d -= 1;
        // Move to next day
        currentDate = currentDate.add(1, 'day');
      }
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave approved" };
    }

    if (leave.duration == 0.5) {
      let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")) } })
      if (attend) {
        let status;
        let fine2;
        if (attend.fine) {
          status = AttendStatus.Half_Day_Late
        } else if (attend.clockIn == null || attend.clockOut == null) {
          let fine200 = branchAssistant.find((e) => e === shift?.branch)
          if (fine200) {
            fine2 = 200;
          } else {
            fine2 = await getNoClockOut(
              attend.userId,
              new Date().getMonth() + 1,
              new Date().getFullYear()
            );
          }
          status = AttendStatus.Half_Day_NoClockIn_Out
        } else {
          status = AttendStatus.Half_Day
        }
        await db.attends.update({ where: { id: attend.id }, data: { status, fine2, leaveId: leave.id } })
        await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
        return { success: "Leave has been approve" }
      }
      await db.attends.create({
        data: {
          userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")), status: "Half_Day", leaveId: leave.id
        }
      });
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave has been approve" }
    }
    if (leave.duration == 1) {
      let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")) } })
      if (attend) {
        await db.attends.update({ where: { id: attend.id }, data: { status: "Leave", leaveId: leave.id } })
        await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
        return { success: "Leave has been approve" }
      }
      await db.attends.create({
        data: {
          userId: leave.userId, dates: new Date(startTime.format("YYYY-MM-DD")), status: "Leave", leaveId: leave.id
        }
      });
      await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
      return { success: "Leave has been approve" }
    }
    const startTime2 = dayjs(startTime, 'YYYY-MM-DD');
    const endTime2 = dayjs(endTime, 'YYYY-MM-DD');
    new Date()
    // Loop through dates
    let currentDate = startTime2;
    let d = leave.duration!;
    let startHalfDay;
    if (d % 1 === 0.5) {
      let [hourOut, minuteOut] = shift.clockOut!.split(':').map(Number)
      let [hourIn, minuteIn] = shift.clockIn!.split(':').map(Number);
      let result = (hourOut - hourIn) / 2
      let result2 = Math.abs(result)
      let newtoday = startTime.set('hours', hourIn).set("minutes", minuteIn).add(result2, 'h')
      console.log("🚀 ~ POST ~ newtoday:", newtoday)
      let isSame = startTime.isSame(newtoday);
      if (isSame) {
        startHalfDay = true
      }
    }
    while (currentDate.isSameOrBefore(endTime2)) {
      // Do something with the current date
      if (startHalfDay) {
        console.log('duration', d, currentDate.format("YYYY-MM-DD"))
        let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")) } })
        if (attend) {
          console.log('have', d, currentDate.format("YYYY-MM-DD"))
          await db.attends.update({ where: { id: attend.id }, data: { status: "Half_Day", leaveId: leave.id } })
        } else {
          console.log('not', d, currentDate.format("YYYY-MM-DD"))
          await db.attends.create({
            data: {
              userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")), status: "Half_Day", leaveId: leave.id
            }
          });
        }
        startHalfDay = false
        d -= 0.5;
        currentDate = currentDate.add(1, 'day');
      }
      if (d == 0.5) {
        let attend = await db.attends.findFirst({ where: { userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")) } })
        if (attend) {
          await db.attends.update({ where: { id: attend.id }, data: { status: "Half_Day", leaveId: leave.id } })
        } else {
          await db.attends.create({
            data: {
              userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")), status: "Half_Day", leaveId: leave.id
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
          await db.attends.update({ where: { id: attend.id }, data: { status: "Leave", leaveId: leave.id } })
        } else {
          await db.attends.create({
            data: {
              userId: leave.userId, dates: new Date(currentDate.format("YYYY-MM-DD")), status: "Leave", leaveId: leave.id
            }
          });
        }
      }
      d -= 1;
      // Move to next day
      currentDate = currentDate.add(1, 'day');
    }
    await db.leave.update({ where: { id: leave.id }, data: { status: "Approve" } })
    return { success: "Leave approved" };

  } catch (error) {
    console.log("🚀 ~ ApproveLeaveV2 ~ error:", error)
    await Logging(session?.user.id, "Error user leave", `Error user leave ${userId}`)
    return { error: "error " };
  }
};
function calculateShiftLeaveDuration2(
  leaveStart: Dayjs,
  leaveEnd: Dayjs,
  shiftTimeIn: string,
  shiftTimeOut: string
): number {
  const [shiftStartH, shiftStartM] = shiftTimeIn.split(':').map(Number);
  const [shiftEndH, shiftEndM] = shiftTimeOut.split(':').map(Number);

  let shiftDuration = (shiftEndH - shiftStartH) + (shiftEndM - shiftStartM) / 60;
  if (shiftDuration <= 0) shiftDuration += 24;
  const halfShift = shiftDuration / 2;

  let totalDays = 0;
  let currentDay = leaveStart.startOf('day');

  while (currentDay.isBefore(leaveEnd) || currentDay.isSame(leaveEnd, 'day')) {
    const dayStart = currentDay.set('hour', shiftStartH).set('minute', shiftStartM);
    let dayEnd = currentDay.set('hour', shiftEndH).set('minute', shiftEndM);
    if (shiftEndH < shiftStartH) dayEnd = dayEnd.add(1, 'day');

    // Manually determine actualStart (max of leaveStart and dayStart)
    const actualStart = leaveStart.isAfter(dayStart) ? leaveStart : dayStart;
    // Manually determine actualEnd (min of leaveEnd and dayEnd)
    const actualEnd = leaveEnd.isBefore(dayEnd) ? leaveEnd : dayEnd;

    const hoursCovered = actualEnd.diff(actualStart, 'hour', true);

    if (hoursCovered >= shiftDuration * 0.9) {
      totalDays += 1;
    } else if (hoursCovered >= halfShift) {
      totalDays += 0.5;
    }

    currentDay = currentDay.add(1, 'day');
  }

  return totalDays;
}

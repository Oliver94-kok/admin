import {
  calculateOvertimeHours,
  calculateWorkingHours,
  calOverTime,
  calOverTime2,
  checkClockIn,
  lateClockIn,
} from "@/data/attend";
import {
  CheckSalarys,
  createSalary,
  getAttendLate,
  getNoClockIn,
} from "@/data/salary";
import { db } from "@/lib/db";
import {
  checkShift,
  checkWorkingHour,
  getDateFromISOString,
  getYesterday,
  postImage,
  SentNoti,
} from "@/lib/function";
import { AttendsInterface } from "@/types/attendents";
import { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { checkUsername, getUserById } from "@/data/user";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import { notificationClock } from "@/data/notification";
import { TimeUtils } from "@/lib/timeUtility";

export const GET = async (req: Request) => {
  // let result = await db.attends.findMany({ where: { dates: t } });
  let user = await db.attends.findMany();
  return Response.json({ user }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn, imgClockIn, clockOut, late, location, notify } =
    await req.json();
  let check = await checkClockIn(userId);
  console.log("🚀 ~ POST ~ check:", check);
  const user = await getUserById(userId);
  const today = dayjs();
  if (check)
    return Response.json({ error: "User aldready clock in" }, { status: 400 });

  if (clockIn) {
    try {
      let shift = await db.attendBranch.findFirst({ where: { userId } });
      if (!shift?.clockIn) {
        throw new Error(`No shift found for user ${userId}`);
      }
      const shiftIn = TimeUtils.createDateFromTimeString(
        today.toDate(),
        shift.clockIn,
        "in",
      );
      let ss = dayjs(shiftIn).add(659, "second");
      let late = today.isAfter(ss);
      if (late) {
        var userlate = await getAttendLate(
          userId,
          new Date().getMonth() + 1,
          new Date().getFullYear(),
        );
      }
      let result = await postImage(imgClockIn, user?.username!, "clock");
      if (result?.error)
        return Response.json({ error: "Error upload image" }, { status: 400 });
      let attendImg = result?.success;
      const isBeforeEightAM = today.isBefore(
        dayjs().tz().hour(8).minute(0).second(0).millisecond(0),
      );

      let data = {
        userId,
        dates: isBeforeEightAM ? today.add(1, "day").toDate() : today.toDate(),
        clockIn: today.toISOString(),
        img: attendImg,
        fine: userlate!,
        locationIn: location,
      };
      let t = await db.attends.create({ data });
      await notificationClock(userId, notify);
      await SentNoti("Clock", "You have clock in", "", user?.username);
      return Response.json({ id: t.id, timeIn: t.clockIn }, { status: 201 });
    } catch (error) {
      console.log("🚀 ~ POST ~ error:", error);
      return Response.json({ error }, { status: 400 });
    }
  }
  try {
    let fine2 = await getNoClockIn(
      userId,
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    );
    let shift = await db.attendBranch.findFirst({ where: { userId } });
    if (!shift?.clockOut) {
      return Response.json(
        { error: `No shift found for user ${userId}` },
        { status: 400 },
      );
    }
    const shiftOut = TimeUtils.createDateFromTimeString(
      today.toDate(),
      shift.clockOut,
      "out",
    );
    let overtime = await calculateOvertimeHours(shiftOut, today);
    let checkDate = TimeUtils.checkMorning(today.toISOString());

    let data = {
      userId,
      dates: checkDate ? today.subtract(1, "day").toDate() : today.toDate(),
      clockOut: today.toISOString(),
      fine: fine2!,
      locationOut: location,
      overtime: Number(overtime!),
      status: AttendStatus.No_ClockIn_ClockOut,
    };
    console.log("🚀 ~ POST ~ data:", data);
    let t = await db.attends.create({ data });
    await CheckSalarys({
      userId,
      fineLate: null,
      fineNoClockIn: fine2,
      fineNoClockOut: null,
      overtime: Number(overtime!),
      workingHour: null,
    });
    await notificationClock(userId, notify);
    await SentNoti("Clock", "You have clock out", "", user?.username);
    return Response.json({ id: t.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error }, { status: 400 });
  }
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id, location, notify } = await req.json();
  console.log("🚀 ~ PATCH ~ clockOut:", clockOut);
  let attend = await checkClockIn(userId);
  console.log("🚀 ~ PATCH ~ attend:", attend);
  if (attend?.status == "Full_Attend")
    return Response.json({ error: "you have clock out" }, { status: 400 });
  if (!attend) return Response.json({ error: "No data" }, { status: 400 });
  try {
    const today = dayjs();
    let shift = await db.attendBranch.findFirst({ where: { userId } });
    if (!shift?.clockOut) {
      return Response.json(
        { error: `No shift found for user ${userId}` },
        { status: 400 },
      );
    }
    const shiftOut = TimeUtils.createDateFromTimeString(
      today.toDate(),
      shift.clockOut,
      "out",
    );
    let overtime = await calculateOvertimeHours(shiftOut, today);
    let workingHour = await calculateWorkingHours(attend.clockIn, today);
    // let workingHour = await checkWorkingHour(attend?.clockIn as Date, clockOut);
    let data = {
      clockOut: today.toISOString(),
      workingHour: workingHour,
      overtime: Number(overtime!),
      locationOut: location,
      status: attend.fine ? AttendStatus.Late : AttendStatus.Full_Attend,
    };
    let update = await db.attends.update({
      data,
      where: { id: attend.id },
    });
    await CheckSalarys({
      userId,
      fineLate: attend.status == "Late" ? attend.fine : null,
      fineNoClockIn: null,
      fineNoClockOut: null,
      overtime: Number(overtime!),
      workingHour: workingHour,
    });

    let user = await db.user.findFirst({
      where: { id: userId },
      select: { username: true },
    });
    await notificationClock(userId, notify);
    await SentNoti("Clock", "You have clock out", "", user?.username);
    return Response.json({ timeOut: update.clockOut }, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 400 });
  }
};

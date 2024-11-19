import {
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
  // let image;
  // let result = await postImage("image", "user04", "user");
  // let result = await checkShift({ userId: "cm36sgm990004nyn1sq6335vk" });
  // let result = await db.attends.findMany({
  //   where: { userId: "cm3fea988001m5v90n595y418" },
  // });
  let result = await db.attends.findMany();
  return Response.json({ result }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn, imgClockIn, clockOut, late, location, notify } =
    await req.json();
  console.log("🚀 ~ POST ~ notify:", notify);
  let check = await checkClockIn(userId);
  if (check)
    return Response.json({ error: "User aldready clock in" }, { status: 400 });
  const user = await getUserById(userId);

  if (clockIn) {
    if (late == 1) {
      var userlate = await getAttendLate(
        userId,
        new Date().getMonth() + 1,
        new Date().getFullYear(),
      );
    }
    // let result = await postImage(imgClockIn, user?.username!, "clock");
    // if (result?.error)
    // return Response.json({ error: "Error upload image" }, { status: 400 });
    // let attendImg = result?.success;
    // let attendImg = await saveImage(imgClockIn, user?.username!);
    const today = dayjs.utc(clockIn);
    let data = {
      userId,
      dates: today.toDate(),
      clockIn,
      // img: attendImg,
      fine: userlate!,
      locationIn: location,
    };
    console.log("🚀 ~ POST ~ data:", data);
    let t = await db.attends.create({ data });
    await notificationClock(userId, notify);
    await SentNoti("Clock", "You have clock in", "", user?.username);
    return Response.json({ id: t.id }, { status: 201 });
  }
  let fine2 = await getNoClockIn(
    userId,
    new Date().getMonth() + 1,
    new Date().getFullYear(),
  );
  let overtime = await calOverTime2(userId, clockOut);
  const formattedTimestamp = clockOut.replace(" ", "T");
  var start = DateTime.fromISO(formattedTimestamp);
  console.log("🚀 ~ POST ~ start:", start);
  let checkDate = TimeUtils.checkMorning(clockOut);
  const today = dayjs.utc(clockOut);

  let data = {
    userId,
    dates: checkDate ? today.subtract(1, "day").toDate() : today.toDate(),
    clockOut: start.toISO(),
    fine: fine2!,
    locationOut: location,
    overtime: Number(overtime!),
    status: AttendStatus.No_ClockIn,
  };
  console.log("🚀 ~ POST ~ data:", data);
  let t = await db.attends.create({ data });
  // await checkSalary(t.userId, t.fine!, t.fine2!, day, Number(overtime));
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
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id, location, notify } = await req.json();
  console.log("🚀 ~ PATCH ~ clockOut:", clockOut);
  let attend = await checkClockIn(userId);
  if (!attend)
    return Response.json({ error: "you have clock out" }, { status: 400 });
  console.log("🚀 ~ PATCH ~ attend:", attend);
  let overtime = await calOverTime2(userId, clockOut);
  let workingHour = await checkWorkingHour(attend?.clockIn as Date, clockOut);
  let data = {
    clockOut,
    workingHour: workingHour,
    overtime: Number(overtime!),
    locationOut: location,
    status: attend.fine ? AttendStatus.Late : AttendStatus.Full_Attend,
  };
  let update = await db.attends.update({
    data,
    where: { id: id },
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
  return Response.json({ data }, { status: 200 });
};

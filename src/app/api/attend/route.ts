import {
  calOverTime,
  calOverTime2,
  checkClockIn,
  createNotClockIn,
  lateClockIn,
} from "@/data/attend";
import {
  checkSalary,
  createSalary,
  getSalaryLate,
  getSalaryLate2,
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

export const GET = async (req: Request) => {
  // let image;
  // let result = await postImage("image", "user04", "user");
  // let result = await checkShift({ userId: "cm36sgm990004nyn1sq6335vk" });
  let result  = await db.attends.findMany()
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
      var userlate = await getSalaryLate(userId);
    }
    // let result = await postImage(imgClockIn, user?.username!, "clock");
    // if (result?.error)
    //   return Response.json({ error: "Error upload image" }, { status: 400 });
    // let attendImg = result?.success;
    // let attendImg = await saveImage(imgClockIn, user?.username!);
    let data = {
      userId,
      clockIn,
      img: null,
      fine: userlate!,
      locationIn: location,
    };
    console.log("🚀 ~ POST ~ data:", data);
    let t = await db.attends.create({ data });
    await notificationClock(userId,notify)
    await SentNoti("Clock", "You have clock in", "", user?.username);
    return Response.json({ id: t.id }, { status: 201 });
  }
  let date = DateTime.now().toFormat("dd");
  let result = await getYesterday(clockIn);
  let fine2 = await getSalaryLate2(userId);
  let overtime = await calOverTime2(userId, clockOut);
  let day = {
    id: parseInt(result.id),
    date: result.yesterday,
    clockIn: null,
    clockOut,
    late: 0,
    noClockin: 1,
    fine: fine2,
    absent: null,
    leave: null,
  };

  var start = DateTime.fromISO(clockOut);
  let data = {
    userId,
    clockOut: start.toISO(),
    fine2: fine2!,
    locationOut: location,
    overtime: Number(overtime!),
    status: AttendStatus.NotActive,
  };
  let t = await db.attends.create({ data });
  await checkSalary(t.userId, t.fine!, t.fine2!, day, Number(overtime));
  await notificationClock(userId,notify);
  await SentNoti("Clock", "You have clock out", "", user?.username);
  return Response.json({ id: t.id }, { status: 201 });
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id, location, notify } = await req.json();
  console.log("🚀 ~ PATCH ~ clockOut:", clockOut);
  let attend = await checkClockIn(userId);
  if(!attend) return Response.json({error:"you have clock out"},{status:400})
  console.log("🚀 ~ PATCH ~ attend:", attend);
  let overtime = await calOverTime2(userId, clockOut);
  let workingHour = await checkWorkingHour(attend?.clockIn as Date, clockOut);
  let data = {
    clockOut,
    workingHour: workingHour,
    overtime: Number(overtime!),
    locationOut: location,
    status: AttendStatus.NotActive,
  };
  let update = await db.attends.update({
    data,
    where: { id: id },
  });
  let idDate = DateTime.now().toFormat("dd");
  let fullDate = DateTime.now().toFormat("dd-MM-yyyy");
  let day = {
    id: parseInt(idDate),
    date: fullDate,
    clockIn: attend?.clockIn,
    clockOut,
    late: attend?.fine ? 1 : 0,
    noClockin: 0,
    fine: attend?.fine,
    absent: null,
    leave: null,
  };
  await checkSalary(
    update.userId,
    update.fine!,
    update.fine2!,
    day,
    Number(overtime),
    workingHour,
  );
  
  let user = await db.user.findFirst({
    where: { id: userId },
    select: { username: true },
  });
  await notificationClock(userId,notify)
  await SentNoti("Clock", "You have clock out", "", user?.username);
  return Response.json({ data }, { status: 200 });
};

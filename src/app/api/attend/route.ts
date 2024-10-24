import {
  calOverTime,
  checkClockIn,
  createNotClockIn,
  lateClockIn,
  testCalOverTime,
} from "@/data/attend";
import {
  checkSalary,
  createSalary,
  getSalaryLate,
  getSalaryLate2,
} from "@/data/salary";
import { db } from "@/lib/db";
import {
  checkWorkingHour,
  getDateFromISOString,
  saveImage,
  SentNoti,
} from "@/lib/function";
import { AttendsInterface } from "@/types/attendents";
import { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { checkUsername, getUserById } from "@/data/user";

export const GET = async (req: Request) => {
  let checkuser = await checkUsername();
  let username = "";
  if (checkuser) {
    // let lastest = parseInt(checkuser?.username.substring(4));
    let lastest = parseInt("user10".substring(4));
    console.log("🚀 ~ GET ~ lastest:", lastest);
    if (lastest < 9) {
      username = `user0${lastest + 1}`;
    } else {
      username = `user${lastest + 1}`;
    }
  }
  // let d = await db.attends.findMany();
  return Response.json({ username }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn, imgClockIn, clockOut, late, location, notify } =
    await req.json();
  console.log("🚀 ~ POST ~ notify:", notify);
  // let check = await checkClockIn(userId);
  // // console.log("🚀 ~ POST ~ check:", check);
  // if (check)
  //   return Response.json({ error: "User aldready clock in" }, { status: 400 });
  const user = await getUserById(userId);

  if (clockIn) {
    if (late == 1) {
      var userlate = await getSalaryLate(userId);
    }
    let attendImg = await saveImage(imgClockIn, user?.username!);
    let data = {
      userId,
      clockIn,
      img: attendImg,
      fine: userlate!,
      locationIn: location,
    };
    let t = await db.attends.create({ data });
    let noti = await db.notificationUser.findFirst({ where: { userId } });
    const currentArray = Array.isArray(noti?.clock) ? noti?.clock : [];
    const updatedArray = [...currentArray, notify];
    await db.notificationUser.update({
      where: { id: noti?.id },
      data: { clock: updatedArray },
    });
    await SentNoti("Clock", "You have clock in", "", user?.username);
    return Response.json({ id: t.id }, { status: 201 });
  }
  let date = await getDateFromISOString(clockOut);
  let day = {
    id: date.substring(8),
    date,
    clockIn: null,
    clockOut,
    late: 0,
    noClockin: 1,
  };
  let fine2 = await getSalaryLate2(userId);
  let overtime = await calOverTime(userId, clockOut);
  let data = {
    userId,
    clockOut,
    fine2: fine2!,
    locationOut: location,
    overtime: Number(overtime!),
  };
  let t = await db.attends.create({ data });
  await checkSalary(t.userId, t.fine!, t.fine2!, day, Number(overtime));
  let noti = await db.notificationUser.findFirst({ where: { userId } });
  const currentArray = Array.isArray(noti?.clock) ? noti?.clock : [];
  const updatedArray = [...currentArray, notify];
  await db.notificationUser.update({
    where: { id: noti?.id },
    data: { clock: updatedArray },
  });
  await SentNoti("Clock", "You have clock out", "", user?.username);
  return Response.json({ id: t.id }, { status: 201 });
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id, location, notify } = await req.json();
  let attend = await checkClockIn(userId);
  let overtime = await calOverTime(userId, clockOut);
  let workingHour = await checkWorkingHour(attend.clockIn as Date, clockOut);
  let data = {
    clockOut,
    workingHour: workingHour,
    overtime: Number(overtime!),
    locationOut: location,
  };
  let update = await db.attends.update({
    data,
    where: { id: id },
  });
  let date = await getDateFromISOString(clockOut);
  let day = {
    id: date.substring(8),
    date,
    clockIn: attend.clockIn,
    clockOut,
    late: attend.fine ? 1 : 0,
    noClockin: 0,
  };
  await checkSalary(
    update.userId,
    update.fine!,
    update.fine2!,
    day,
    Number(overtime),
    workingHour,
  );
  let noti = await db.notificationUser.findFirst({ where: { userId } });
  const currentArray = Array.isArray(noti?.clock) ? noti?.clock : [];
  const updatedArray = [...currentArray, notify];
  await db.notificationUser.update({
    where: { id: noti?.id },
    data: { clock: updatedArray },
  });
  let user = await db.user.findFirst({
    where: { id: userId },
    select: { username: true },
  });
  await SentNoti("Clock", "You have clock out", "", user?.username);
  return Response.json({ data }, { status: 200 });
};

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
} from "@/lib/function";
import { AttendsInterface } from "@/types/attendents";
import { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { getUserById } from "@/data/user";

export const GET = async (req: Request) => {
  // let d = await testCalOverTime(
  //   "cm28ouovu0001odoju89wj8bs",
  //   "2024-10-17T09:11:00.000Z",
  // );
  // console.log(d);
  let date = await getDateFromISOString("2024-01-14T01:11:00.000Z");
  let id = date.substring(8);
  // let d = await db.attends.findMany();
  return Response.json({ date, id }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn, imgClockIn, clockOut, late, location } =
    await req.json();
  // let check = await checkClockIn(userId);
  // console.log("🚀 ~ POST ~ check:", check);
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
  return Response.json({ id: t.id }, { status: 201 });
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id } = await req.json();
  let attend = await checkClockIn(userId);
  let overtime = await calOverTime(userId, clockOut);
  let workingHour = await checkWorkingHour(attend.clockIn as Date, clockOut);
  let data = {
    clockOut,
    workingHour: workingHour,
    overtime: Number(overtime!),
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
  return Response.json({ data }, { status: 200 });
};

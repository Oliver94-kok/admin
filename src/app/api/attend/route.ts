import {
  calOverTime,
  checkClockIn,
  createNotClockIn,
  lateClockIn,
} from "@/data/attend";
import { checkSalary, createSalary, getSalaryLate } from "@/data/salary";
import { db } from "@/lib/db";
import { checkWorkingHour, saveImage } from "@/lib/function";
import { AttendsInterface } from "@/types/attendents";
import { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { getUserById } from "@/data/user";

export const GET = async (req: Request) => {
  // let d: AttendsInterface[] =
  //   await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour
  // FROM attends AS a
  // JOIN user AS u ON a.userId = u.id
  // WHERE date(a.clockIn) = CURDATE() OR date(a.clockOut) = CURDATE()`;
  // // const formatter = new Intl.DateTimeFormat("en-MY", {
  // //   timeZone: "Asia/Kuala_Lumpur",
  // //   year: "numeric",
  // //   month: "numeric",
  // //   day: "numeric",
  // //   hour: "numeric",
  // //   minute: "numeric",
  // //   second: "numeric",
  // // });
  // // d.forEach((dd) => {
  // //   let da = formatter.format(dd.clockIn);
  // //   console.log("🚀 ~ d.forEach ~ da:", da);
  // //   let y = new Date(da);
  // //   console.log("🚀 ~ d.forEach ~ y:", y.getTime());
  // //   dd.clockIn = new Date(da);
  // // });
  // let d = new Date();
  let d = await db.attends.findMany();
  return Response.json({ d }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn, imgClockIn } = await req.json();
  let check = await checkClockIn(userId);
  if (check)
    return Response.json({ error: "User aldready clock in" }, { status: 400 });
  const user = await getUserById(userId);
  let attendImg = await saveImage(imgClockIn, user?.username!);
  let late = await lateClockIn(userId, clockIn);
  let userlate = await getSalaryLate(userId);
  let fine = 0;
  if (userlate && late == 1) fine = 100;
  if (late == 1) fine = 50;
  let data = {
    userId,
    clockIn,
    img: attendImg,
    fine: fine,
  };
  let t = await db.attends.create({ data });
  return Response.json({ id: t.id }, { status: 201 });
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id } = await req.json();
  // let d = req.arrayBuffer();
  let attend = await checkClockIn(userId);
  let newClockout = new Date(clockOut);

  let overtime = await calOverTime(userId, clockOut);
  console.log("🚀 ~ PATCH ~ overtime:", overtime);

  // return Response.json({ overtime }, { status: 200 });
  if (!attend) {
    let result = await createNotClockIn(userId, clockOut, Number(overtime!));
    console.log("🚀 ~ PATCH ~ result:", result);
    if (result?.success)
      return Response.json({ succes: "success" }, { status: 201 });
    return Response.json({ error: "error" }, { status: 400 });
  }
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
  await checkSalary(update.userId, update.fine, Number(overtime));
  return Response.json({ update }, { status: 200 });
};

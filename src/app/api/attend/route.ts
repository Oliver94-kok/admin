import { calOverTime, checkClockIn, createNotClockIn } from "@/data/attend";
import { AddSalary, checkSalary } from "@/data/salary";
import { db } from "@/lib/db";
import { checkWorkingHour, saveImage } from "@/lib/function";
import { AttendsInterface } from "@/types/attendents";
import { NextRequest } from "next/server";
import { DateTime } from "luxon";

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
  let d = new Date();

  return Response.json({ d }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn, imgClockIn } = await req.json();
  let attendImg = await saveImage(imgClockIn);
  let data = {
    userId,
    clockIn,
    img: attendImg,
    fine: 0,
  };
  let t = await db.attends.create({ data });
  return Response.json({ t }, { status: 201 });
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id } = await req.json();
  // let d = req.arrayBuffer();
  let attend = await checkClockIn(userId);
  let newClockout = new Date(clockOut);
  
  console.log("🚀 ~ PATCH ~ newClockout:", newClockout.getTime())

  let overtime =await calOverTime(userId,newClockout);
  return Response.json({overtime},{status:200})
  // if (!attend) {
  //   let result = await createNotClockIn(userId,clockOut);
  //   if(result?.success) return Response.json({succes:"success"},{status:201});
  //   return Response.json({error:"error"},{status:400})
  // }
  // let workingHour = await checkWorkingHour(attend.clockIn as Date, clockOut);
  // console.log("🚀 ~ PATCH ~ workingHour:", workingHour);
  // let data = {
  //   clockOut,
  //   workingHour: workingHour,
  // };
  // let update = await db.attends.update({
  //   data,
  //   where: { id: id },
  // });
  // await checkSalary(update.userId,update.fine,update.workingHour!);
  // return Response.json({ update }, { status: 200 });
};

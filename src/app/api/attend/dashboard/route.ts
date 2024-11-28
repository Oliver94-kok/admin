import { db } from "@/lib/db";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import dayjs from "dayjs";
import { roleAdmin } from "@/lib/function";
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
export const GET = async (request: NextRequest) => {
  // let data =
  //   await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour, ab.team
  //   FROM Attends AS a
  //   JOIN User AS u ON a.userId = u.id
  //   JOIN AttendBranch as ab on u.id = ab.userId
  //   WHERE (date(a.clockIn) = CURDATE() OR date(a.clockOut) = CURDATE())`;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const role = searchParams.get("role");
  let team = await roleAdmin(role!);
  // let day = tarikh.split("/");
  // let year = new Date().getFullYear();
  // let d = `${year}-${day[1]}-${day[0]}`;
  // let data =
  //   await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour, ab.team,a.locationIn,a.locationOut
  //   FROM Attends AS a
  //   JOIN User AS u ON a.userId = u.id
  //   JOIN AttendBranch as ab on u.id = ab.userId
  // WHERE (date(a.clockIn) = date(${date}) OR date(a.clockOut) = date(${date}))`;
  const targetDate = dayjs(date).tz("Asia/Kuala_Lumpur");
  const startOfDay = targetDate.startOf("day").toISOString();
  const endOfDay = targetDate.endOf("day").toISOString();
  let data = await db.attends.findMany({
    where: {
      dates: {
        gte: startOfDay, // Greater than or equal to start of day
        lte: endOfDay, // Less than or equal to end of day
      },
      users: {
        AttendBranch: {
          team: team,
        },
      },
    },
    select: {
      id: true,
      dates: true,
      clockIn: true,
      clockOut: true,
      img: true,
      locationIn: true,
      locationOut: true,
      userId: true,
      users: {
        select: {
          username: true,
          name: true,
          userImg: true,
          AttendBranch: { select: { team: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return Response.json({ date, data }, { status: 200 });
};

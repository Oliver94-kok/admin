import { db } from "@/lib/db";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import dayjs from "dayjs";
export const GET = async (request: NextRequest) => {
  // let data =
  //   await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour, ab.team
  //   FROM Attends AS a
  //   JOIN User AS u ON a.userId = u.id
  //   JOIN AttendBranch as ab on u.id = ab.userId
  //   WHERE (date(a.clockIn) = CURDATE() OR date(a.clockOut) = CURDATE())`;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  // let day = tarikh.split("/");
  // let year = new Date().getFullYear();
  // let d = `${year}-${day[1]}-${day[0]}`;
  // let data =
  //   await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour, ab.team,a.locationIn,a.locationOut
  //   FROM Attends AS a
  //   JOIN User AS u ON a.userId = u.id
  //   JOIN AttendBranch as ab on u.id = ab.userId
  // WHERE (date(a.clockIn) = date(${date}) OR date(a.clockOut) = date(${date}))`;
  const startOfDay = dayjs(date).startOf("day").toDate();
  console.log("🚀 ~ GET ~ startOfDay:", startOfDay);
  const endOfDay = dayjs(date).endOf("day").toDate();
  console.log("🚀 ~ GET ~ endOfDay:", endOfDay);
  let data = await db.attends.findMany({
    where: {
      OR: [
        {
          clockIn: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        {
          clockOut: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      ],
    },
    select: {
      id: true,
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

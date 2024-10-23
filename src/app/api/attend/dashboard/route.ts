import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const GET = async (req: Request) => {
  let data =
    await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour, ab.team
    FROM Attends AS a
    JOIN User AS u ON a.userId = u.id
    JOIN AttendBranch as ab on u.id = ab.userId
    WHERE (date(a.clockIn) = CURDATE() OR date(a.clockOut) = CURDATE())`;
  return Response.json({ data }, { status: 200 });
};

import { db } from "@/lib/db";

export const GET = async (req: Request) => {
  let data =
    await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour
    FROM Attends AS a
    JOIN User AS u ON a.userId = u.id
    WHERE date(a.clockIn) = CURDATE() OR date(a.clockOut) = CURDATE()`;
  return Response.json({ data }, { status: 200 });
};

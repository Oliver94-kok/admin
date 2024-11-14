import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendsInterface } from "@/types/attendents";
import dayjs from "dayjs";
export const POST = async (req: Request) => {
  const { userId } = await req.json();
  // let user: AttendsInterface[] =
  //   await db.$queryRaw`SELECT * FROM Attends WHERE userId=${userId} AND (date(clockIn) = CURDATE() OR date(clockOut) = CURDATE() )`;
  // let nuser = user[0];
  // if (nuser)
  //   return Response.json(
  //     {
  //       id: nuser.id,
  //       clockin: nuser.clockIn,
  //       clockout: nuser.clockOut,
  //       locationIn: nuser.locationIn,
  //       locationOut: nuser.locationOut,
  //     },
  //     { status: 201 },
  //   );
  // let user = await db.attends.findFirst({where:{userId,status:"Active"}});
  let user = await db.attends.findFirst({
    where: {
      userId,

      OR: [
        { status: "Active" },
        {
          clockIn: {
            gte: dayjs().subtract(1, "day").startOf("day").toDate(),
            lte: dayjs().endOf("day").toDate(),
          },
        },
        {
          clockOut: {
            gte: dayjs().subtract(1, "day").startOf("day").toDate(),
            lte: dayjs().endOf("day").toDate(),
          },
        },
      ],
    },
  });
  if (user)
    return Response.json(
      {
        id: user.id,
        clockIn: user.clockIn,
        clockOut: user.clockOut,
        locationIn: user.locationIn,
        locationOut: user.locationOut,
        status: user.status,
      },
      { status: 201 },
    );
  const now = new Date();
  let shift = await db.attendBranch.findFirst({ where: { userId } });
  let shiftIn = TimeUtils.createDateFromTimeString(now, shift?.clockIn!);
  let shiftOut = TimeUtils.createDateFromTimeString(now, shift?.clockOut!);
  // let checkOutShift = TimeUtils.isNextDay(now,shift?.clockOut!)

  return Response.json({ shiftIn, shiftOut }, { status: 400 });
};

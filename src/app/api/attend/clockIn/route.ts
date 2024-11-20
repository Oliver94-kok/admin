import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendsInterface } from "@/types/attendents";
import dayjs from "dayjs";
export const POST = async (req: Request) => {
  const { userId } = await req.json();
  const today = dayjs().format("YYYY-MM-DD");
  const t = new Date(today);
  console.log("sdas", today);
  console.log("sdas 2", t);
  let user = await db.attends.findFirst({
    where: {
      userId,

      OR: [
        { status: "Active" },
        {
          dates: t,
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
  let shift = await db.attendBranch.findFirst({ where: { userId } });
  let yesterday = dayjs(t).subtract(1, "day");
  let yesterdayUser = await db.attends.findFirst({
    where: { userId, dates: yesterday.toDate() },
  });
  if (yesterdayUser == null) {
    let shiftIn = TimeUtils.createDateFromTimeString(
      yesterday.toDate(),
      shift?.clockIn!,
      "in",
    );
    let shiftOut = TimeUtils.createDateFromTimeString(
      yesterday.toDate(),
      shift?.clockOut!,
      "out",
    );
    const now = dayjs().utc();

    // Convert shift times to dayjs objects
    const shiftInTime = dayjs(shiftIn);
    const shiftOutTime = dayjs(shiftOut);
    const isWithinShift =
      now.isAfter(shiftInTime) && now.isBefore(shiftOutTime);
    if (isWithinShift) {
      return Response.json({ shiftIn, shiftOut }, { status: 401 });
    } else {
      const now = new Date();
      let shiftIn = TimeUtils.createDateFromTimeString(
        now,
        shift?.clockIn!,
        "in",
      );
      let shiftOut = TimeUtils.createDateFromTimeString(
        now,
        shift?.clockOut!,
        "out",
      );
      // let checkOutShift = TimeUtils.isNextDay(now,shift?.clockOut!)

      return Response.json({ shiftIn, shiftOut }, { status: 400 });
    }
  }
  const now = new Date();

  let shiftIn = TimeUtils.createDateFromTimeString(now, shift?.clockIn!, "in");
  let shiftOut = TimeUtils.createDateFromTimeString(
    now,
    shift?.clockOut!,
    "out",
  );
  // let checkOutShift = TimeUtils.isNextDay(now,shift?.clockOut!)

  return Response.json(
    { shiftIn, shiftOut, yesterday: yesterdayUser },
    { status: 400 },
  );
};

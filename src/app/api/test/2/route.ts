import { calculateOvertimeHours } from "@/data/attend";
import { getAttendLate } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";

export const GET = async (request: Request) => {
  const userId = "cm499nn7b000trjhznxcqy75f";
  const today = dayjs();
  let shift = await db.attendBranch.findFirst({ where: { userId } });
  if (!shift?.clockIn) {
    throw new Error(`No shift found for user ${userId}`);
  }
  const shiftIn = TimeUtils.createDateFromTimeString(
    today.toDate(),
    shift.clockIn,
    "in",
  );
  let ss = dayjs(shiftIn).add(10, "minute");
  let late = today.isAfter(ss);
  if (late) {
    var userlate = await getAttendLate(
      userId,
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    );
  }
  const isBeforeEightAM = today.isBefore(
    dayjs().tz().hour(8).minute(0).second(0).millisecond(0),
  );
  let data = {
    userId,
    dates: isBeforeEightAM ? today.add(1, "day").toDate() : today.toDate(),
    clockIn: today.toISOString(),
    // img: attendImg,
    fine: userlate!,
    // locationIn: location,
  };
  console.log("🚀 ~ POST ~ data:", data);
  // let t = await db.attends.create({ data });
  // await notificationClock(userId, notify);
  // await SentNoti("Clock", "You have clock in", "", user?.username);
  return Response.json({ data, shiftIn, today }, { status: 201 });
};
export const POST = async (req: Request) => {
  const userId = "cm499nn7b000trjhznxcqy75f";
  const today = dayjs();
  let shift = await db.attendBranch.findFirst({ where: { userId } });
  if (!shift?.clockOut) {
    throw new Error(`No shift found for user ${userId}`);
  }
  const shiftOut = TimeUtils.createDateFromTimeString(
    today.toDate(),
    shift.clockOut,
    "out",
  );
  let overtime = await calculateOvertimeHours(shiftOut, today);
  let checkDate = TimeUtils.checkMorning(today.toISOString());
  let data = {
    userId,
    dates: checkDate ? today.subtract(1, "day").toDate() : today.toDate(),
    clockOut: today.toDate(),
    // fine: fine2!,
    // locationOut: location,
    overtime: Number(overtime!),
    // status: AttendStatus.No_ClockIn_ClockOut,
  };
  return Response.json(
    { overtime, shiftOut, today, checkDate, data },
    { status: 200 },
  );
};

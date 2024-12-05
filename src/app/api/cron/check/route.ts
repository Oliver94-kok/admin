import { calculateOvertimeHours, calculateWorkingHours } from "@/data/attend";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";
export const dynamic = "force-dynamic";
export const GET = async () => {
  let users = await db.user.findMany({ where: { role: "USER" } });
  let today = dayjs().startOf("month");
  console.log("🚀 ~ GET ~ today:", today);
  let yesterday = dayjs().subtract(1, "day");
  console.log("🚀 ~ GET ~ yesterday:", yesterday);
  if (users) {
    const processResults = await Promise.allSettled(
      users.map(async (user) => {
        let salary = await db.salary.findFirst({
          where: { userId: user.id, month: 12, year: 2024 },
        });
        let attends = await db.attends.findMany({
          where: {
            userId: user.id,
            dates: {
              gte: new Date(today.format("YYYY-MM-DD")),
              lte: new Date(yesterday.format("YYYY-MM-DD")),
            },
          },
        });
        let totaldays = attends.length;
        let totalFine = 0;
        let totalFine2 = 0;
        let totalOvertime = 0;
        let totalWorkinghour = 0;
        attends.map((a) => {
          totalOvertime = totalOvertime + a.overtime!;
          totalWorkinghour = totalWorkinghour + a.workingHour!;

          if (a.status == "No_ClockIn_ClockOut") {
            totalFine2 = totalFine2 + a.fine!;
          } else if (a.status == "Late") {
            totalFine = totalFine + a.fine!;
          }
        });
        await db.salary.update({
          where: { id: salary?.id },
          data: {
            workingDay: totaldays,
            fineLate: totalFine,
            fineNoClockIn: totalFine2,
            workingHoour: totalWorkinghour,
            overTimeHour: totalOvertime,
          },
        });
      }),
    );
  }

  return Response.json({ users }, { status: 200 });
};
export const POST = async (req: Request) => {
  let users = await db.attends.findMany();
  if (users) {
    const processResults = await Promise.allSettled(
      users.map(async (user) => {
        try {
          let shift = await db.attendBranch.findFirst({
            where: { userId: user.userId },
          });
          if (!shift?.clockIn || !shift?.clockOut) {
            throw new Error(`No shift found for user ${user.userId}`);
          }
          let inTime = dayjs(user.clockIn);
          let outTime = dayjs(user.clockOut);
          const shiftOut = TimeUtils.createDateFromTimeString(
            outTime.toDate(),
            shift.clockOut,
            "out",
          );
          let overtime = 0;
          let workingHour = 0;
          if (user.clockIn && user.clockOut) {
            workingHour = await calculateWorkingHours(
              user.clockIn,
              user.clockOut,
            );
            console.log("🚀 ~ users.map ~ workingHour:", workingHour);
          }
          if (user.clockOut) {
            overtime = await calculateOvertimeHours(shiftOut, outTime);
            console.log("🚀 ~ users.map ~ overtime:", overtime);
          }
          await db.attends.update({
            where: { id: user.id },
            data: { overtime, workingHour },
          });
        } catch (error) {}
      }),
    );
    return Response.json({ users }, { status: 200 });
  }
};

import { isOffDay } from "@/data/attend";
import { getNoClockIn } from "@/data/salary";
import { AttendanceService } from "@/lib/attendService";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendsInterface } from "@/types/attendents";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";

export const POST = async (req: Request) => {
  const { userId } = await req.json();
  const today = dayjs();
  const t = new Date(today.format("YYYY-MM-DD"));
  console.log("sdas", today);
  console.log("sdas 2", t);
  const attendanceService = new AttendanceService({
    gracePeriodMinutes: 15,
    maxOvertimeHours: 4,
    timezone: "UTC",
  });
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
  let shift = await db.attendBranch.findFirst({ where: { userId } });
  if (!shift?.clockIn || !shift?.clockOut) {
    throw new Error(`No shift found for user ${user!.id}`);
  }
  let yesterday = dayjs(t).subtract(1, "day");

  if (user) {
    console.log("value from db ", user.dates);
    let sameDay = dayjs(user.dates).isSame(t);
    console.log("🚀 ~ POST ~ dayjs(user.dates):", dayjs(user.dates));
    console.log("🚀 ~ POST ~ sameDay:", sameDay);

    if (sameDay) {
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
    } else {
      // const now = new Date(yesterday);
      const shiftIn = TimeUtils.createDateFromTimeString(
        yesterday.toDate(),
        shift.clockIn,
        "in",
      );
      const shiftOut = TimeUtils.createDateFromTimeString(
        yesterday.toDate(),
        shift.clockOut,
        "out",
      );

      if (shift.offDay) {
        let day = shift.offDay.split(",");
        let resultOffDay = await isOffDay(day, "YESTERDAY");
        if (resultOffDay) {
          let resultOffday = await db.attends.findFirst({
            where: { userId, dates: yesterday.toDate() },
          });
          if (resultOffday) return Response.json({}, { status: 400 });
          let data = {
            userId: userId,
            dates: yesterday.toDate(),
            status: AttendStatus.OffDay,
          };
          await db.attends.create({ data });
          return Response.json({}, { status: 400 });
        }
      }
      let shifts = await attendanceService.cronAttendCheckShift(
        shiftIn,
        shiftOut,
      );
      if (shifts.result == "absent") {
        let fine2 = await getNoClockIn(
          userId,
          new Date().getMonth() + 1,
          new Date().getFullYear(),
        );
        await db.attends.update({
          where: { id: user.id },
          data: { status: AttendStatus.No_ClockIn_ClockOut, fine: fine2 },
        });
        let salary = await db.salary.findFirst({
          where: {
            userId,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        });
        let totalFine = salary?.fineNoClockIn! + fine2!;
        await db.salary.update({
          where: { id: salary!.id },
          data: { fineNoClockIn: totalFine },
        });
        let shiftIn = TimeUtils.createDateFromTimeString(
          t,
          shift?.clockIn!,
          "in",
        );
        let shiftOut = TimeUtils.createDateFromTimeString(
          t,
          shift?.clockOut!,
          "out",
        );
        // let checkOutShift = TimeUtils.isNextDay(now,shift?.clockOut!)

        return Response.json({ shiftIn, shiftOut }, { status: 400 });
      } else if ((shifts.result = "can_clock_out")) {
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
      }
    }
  } else {
    if (shift.offDay) {
      let day = shift.offDay.split(",");
      let resultOffDay = await isOffDay(day, "TODAY");
      if (resultOffDay) {
        let resultOffdays = await db.attends.findFirst({
          where: { userId, dates: today.toDate() },
        });
        if (resultOffdays)
          return Response.json(
            {
              id: resultOffdays.id,
              clockIn: resultOffdays.clockIn,
              clockOut: resultOffdays.clockOut,
              locationIn: resultOffdays.locationIn,
              locationOut: resultOffdays.locationOut,
              status: resultOffdays.status,
            },
            { status: 400 },
          );
        let data = {
          userId: userId,
          dates: t,
          status: AttendStatus.OffDay,
        };
        let r = await db.attends.create({ data });
        return Response.json(
          {
            id: r.id,
            clockIn: r.clockIn,
            clockOut: r.clockOut,
            locationIn: r.locationIn,
            locationOut: r.locationOut,
            status: r.status,
          },
          { status: 400 },
        );
      }
    }
    let yesterdayUser = await db.attends.findFirst({
      where: { userId, dates: yesterday.toDate() },
    });
    if (yesterdayUser == null) {
      let shiftIn = TimeUtils.createDateFromTimeString(
        yesterday.toDate(),
        shift?.clockIn!,
        "in",
      );
      console.log("🚀 ~ POST ~ shiftIn:", shiftIn);
      let shiftOut = TimeUtils.createDateFromTimeString(
        yesterday.toDate(),
        shift?.clockOut!,
        "out",
      );
      console.log("🚀 ~ POST ~ shiftOut:", shiftOut);
      const now = dayjs().utc();

      // Convert shift times to dayjs objects
      const shiftInTime = dayjs(shiftIn);
      const shiftOutTime = dayjs(shiftOut).add(4, "hour");
      console.log("🚀 ~ POST ~ shiftOutTime:", shiftOutTime);
      const isWithinShift =
        now.isAfter(shiftInTime) && now.isBefore(shiftOutTime);
      console.log("🚀 ~ POST ~ isWithinShift:", isWithinShift);
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
        let data = {
          userId,
          dates: yesterday.toDate(),
          status: AttendStatus.Absent,
        };
        await db.attends.create({ data });

        return Response.json({ shiftIn, shiftOut }, { status: 400 });
      }
    }
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

    return Response.json(
      { shiftIn, shiftOut, yesterday: yesterdayUser },
      { status: 400 },
    );
  }
};

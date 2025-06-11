import { isOffDay } from "@/data/attend";
import { Logging } from "@/data/log";
import { getNoClockIn } from "@/data/salary";
import { AttendanceService } from "@/lib/attendService";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendsInterface } from "@/types/attendents";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

function getToday() {
  const now = dayjs();
  const hour = now.hour();

  // If time is between 12am and 5:59am (0-5 hours)
  if (hour >= 0 && hour < 6) {
    return dayjs().utc();
  } else {
    // 6am onwards
    return dayjs();
  }
}

export const POST = async (req: Request) => {
  let userid;
  try {
    const { userId } = await req.json();
    userid = userId;
    const today = getToday();
    console.log("🚀 ~ POST ~ today:", today);
    const t = new Date(today.format("YYYY-MM-DD"));

    const attendanceService = new AttendanceService({
      gracePeriodMinutes: 15,
      maxOvertimeHours: 4,
      timezone: "UTC",
    });

    // Find attendance record for the user where the date matches today
    let attend = await db.attends.findFirst({
      where: {
        userId,
        dates: t, // Ensure the date matches today
      },
    });
    console.log("🚀 ~ POST ~ attend:", attend)



    if (attend) {
      // If an active attendance record is found for today

      return Response.json(
        {
          id: attend.id,
          status: attend.status,
          shiftIn: (attend.status === "Active" && attend.clockIn == null) ? null : attend.clockIn,
          shiftOut: attend.clockOut,
          locationIn: attend.locationIn,
          locationOut: attend.locationOut,
        },
        { status: 200 }
      );
    }

    // If no  attendance record is found for today, check for other statuses
    attend = await db.attends.findFirst({
      where: {
        userId,
        status: "Active", // Ensure the status active
      },
    });

    if (attend) {
      // If an attendance record is found for active
      return Response.json(
        {
          id: attend.id,
          date: attend.dates,
          status: attend.status,
          shiftIn: (attend.status === "Active" && attend.clockIn == null) ? null : attend.clockIn,
          shiftOut: attend.clockOut,
          locationIn: attend.locationIn,
          locationOut: attend.locationOut,
        },
        { status: 200 }
      );
    }

    // If no attendance record is found for today, check for shift and off days
    let shift = await db.attendBranch.findFirst({ where: { userId } });
    if (!shift) throw new Error("No shift time");

    if (shift.offDay) {
      let offdays = shift.offDay.split(",");
      let resultOffDay = await isOffDay(offdays, "TODAY");
      if (resultOffDay) {
        await db.attends.create({ data: { userId, status: "OffDay", dates: t } });
        return Response.json({ status: "OffDay" }, { status: 200 });
      }
    }

    // If no attendance record is found and it's not an off day
    return Response.json({ status: "Not_Start_shift" }, { status: 200 });
  } catch (error) {
    let err = error instanceof Error ? error.message : "An unknown error occurred"
    await Logging(userid, "Clock in 2", err)
    return Response.json(error, { status: 400 });
  }
};
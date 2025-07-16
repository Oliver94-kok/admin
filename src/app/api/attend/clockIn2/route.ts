import { isOffDay } from "@/data/attend";
import { getNoClockOut } from "@/data/salary";
import { db } from "@/lib/db";
import { branchAssistant } from "@/types/branchs";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";

const CLOCK_OUT_GRACE_PERIOD_HOURS = 4;
const createAttendanceResponse = (attendant: any) => {
  return {
    id: attendant.id,
    status: attendant.status,
    shiftIn: attendant.clockIn,
    shiftOut: attendant.clockOut,
    locationIn: attendant.locationIn,
    locationOut: attendant.locationOut,
  };
};

export const POST = async (req: Request) => {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }
    const todayDayjs = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, 'day');
    const today = new Date(todayDayjs);
    const [activeAttendant, todayAttendant, yesterdayAttend, usershift] = await Promise.all([
      db.attends.findFirst({ where: { status: "Active", userId } }),
      db.attends.findFirst({ where: { userId, dates: today } }),
      db.attends.findFirst({ where: { userId, dates: new Date(yesterday.format("YYYY-MM-DD")) } }),
      db.attendBranch.findFirst({ where: { userId } })
    ])

    if (!usershift?.clockOut || !usershift.clockIn) {
      return Response.json({ Error: "No shift time found" }, { status: 400 })
    }
    if (activeAttendant) {
      console.log("masuk activeAttendant");
      const attendanceDate = dayjs(activeAttendant.dates);
      const [outHour, outMinute] = usershift.clockOut.split(":").map(Number);
      let shiftOutTime;
      if (outHour >= 0 && outHour <= 9) {
        // Overnight shift - add 1 day
        shiftOutTime = attendanceDate.hour(outHour).minute(outMinute).add(1, 'day');
        console.log("🚀 ~ Overnight shift end time:", shiftOutTime.format());
      } else {
        // Same day shift
        shiftOutTime = attendanceDate.hour(outHour).minute(outMinute);
        console.log("🚀 ~ Same day shift end time:", shiftOutTime.format());
      }

      const overtimeEndTime = shiftOutTime.add(4, "hour"); // 4-hour overtime buffer
      const now = dayjs();
      if (now.isAfter(overtimeEndTime)) {
        console.log(("masuk lepas overtime"))
        const fine = await getFineForNoClockOut(
          activeAttendant.userId,
          usershift.branch,
          attendanceDate.toDate()
        );

        await db.attends.update({
          where: { id: activeAttendant.id },
          data: {
            status: AttendStatus.No_ClockIn_ClockOut,
            fine2: fine
          },
        });
        return Response.json({ status: "Not_Start_shift" }, { status: 200 });
      }
      else {
        console.log(("masuk lepas xlepas"))
        return Response.json({
          id: activeAttendant.id,
          status: activeAttendant.status,
          shiftIn: activeAttendant.clockIn,
          shiftOut: activeAttendant.clockOut,
          locationIn: activeAttendant.locationIn,
          locationOut: activeAttendant.locationOut,
        }, { status: 200 });
      }
    }
    if (todayAttendant) {
      return Response.json({
        id: todayAttendant.id,
        status: todayAttendant.status,
        shiftIn: todayAttendant.clockIn,
        shiftOut: todayAttendant.clockOut,
        locationIn: todayAttendant.locationIn,
        locationOut: todayAttendant.locationOut,
      }, { status: 200 });
    }


    if (usershift.offDay) {
      let offdays = usershift.offDay.split(",");
      let resultOffDay = await isOffDay(offdays, "TODAY");
      if (resultOffDay) {
        await db.attends.create({ data: { userId, status: "OffDay", dates: today } });
        return Response.json({ status: "OffDay" }, { status: 200 });
      }
    }

    // If no attendance record is found and it's not an off day
    return Response.json({ status: "Not_Start_shift" }, { status: 200 });


  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}
async function getFineForNoClockOut(
  userId: string,
  branch: string | null | undefined,
  date: Date
): Promise<number> {
  try {
    const isAssistantBranch = branchAssistant.find((b) => b === branch);
    if (isAssistantBranch) {
      return 200;
    }

    const fine = await getNoClockOut(userId, date.getMonth() + 1, date.getFullYear());
    // Handle null case - return default fine if getNoClockOut returns null
    return fine ?? 200;
  } catch (error) {
    console.error(`Error calculating fine for user ${userId}:`, error);
    // Return default fine in case of error
    return 200;
  }
}
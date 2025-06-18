import { isOffDay } from "@/data/attend";
import { db } from "@/lib/db";
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

      let dateActive = dayjs(activeAttendant.dates);
      if (dateActive.isSame(yesterday, 'day')) {
        let shiftOut = usershift.clockOut.split(":").map(Number);
        console.log("🚀 ~ POST ~ shiftOut:", shiftOut)
        let shiftIn = usershift.clockIn.split(":").map(Number);
        console.log("🚀 ~ POST ~ shiftIn:", shiftIn)
        let isOvernightShift = shiftOut[0] < shiftIn[0];
        console.log("🚀 ~ POST ~ isOvernightShift:", isOvernightShift)
        let out;
        if (isOvernightShift) {
          // For overnight shifts, clock out is on the next day
          out = dateActive
            .add(1, 'day')  // Move to next day for clock out
            .hour(shiftOut[0])  // Use actual clock out hour (e.g., 7 AM)
            .minute(shiftOut[1])
            .second(0);

          // Convert to UTC (Kuala Lumpur is UTC+8, so subtract 8 hours)
          // out = out.subtract(8, 'hours');
        } else {
          // For regular day shifts, same day clock out
          out = dateActive
            .hour(shiftOut[0])
            .minute(shiftOut[1])
            .second(0);

          // Convert to UTC
          // out = out.subtract(8, 'hours');
        }
        console.log("🚀 ~ POST ~ dateActive: ", out.toISOString());
        out = out.add(CLOCK_OUT_GRACE_PERIOD_HOURS, 'hours');

        console.log("🚀 ~ POST ~ dateActive:4 ", out.toISOString());
        console.log("🚀 ~ POST ~ isOvernightShift:", isOvernightShift);

        let cannotClockout = dayjs().isAfter(out);
        if (!cannotClockout) {
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
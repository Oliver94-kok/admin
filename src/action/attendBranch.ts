"use server";
import dayjs from "dayjs";
import { db } from "@/lib/db";
import { slideDate } from "@/lib/function";
import { DateTime } from "luxon";
import { AttendStatus } from "@prisma/client";
import { Logging } from "@/data/log";
import { auth } from "../../auth";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
export const UpdateUserBranch = async (
  id: string,
  branch?: string | null,
  teams?: string | null,
  timeIn?: string,
  timeOut?: string,
  offDay?: string,
  startOn?: string,
) => {
  const session = await auth()
  try {
    // const startOn = "11/5/2025"; // DD/MM/YYYY
    let shift = await db.attendBranch.findFirst({ where: { id } });
    if (!shift) {
      return { error: "Shift not found" };
    }
    const today = dayjs();
    const start = dayjs(startOn, 'D/M/YYYY'); // Parse with correct format

    console.log("🚀 ~ Parsed Date:", start.format('YYYY-MM-DD'));
    console.log("🚀 ~ Today:", today.format('YYYY-MM-DD'));

    if (today.isSame(start, 'day')) { // Compare only dates (ignores time)
      let data = {
        clockIn: timeIn,
        clockOut: timeOut,
        team: teams!,
        branch: branch!,

        offDay: offDay!,
      };
      console.log("🚀 ~ data:", data);
      let attend = await db.attends.findFirst({ where: { userId: shift.userId, dates: new Date(start.format('YYYY-MM-DD')) } })
      if (attend) {
        if (attend.clockIn == null && attend.clockOut == null && attend.status == "Active") {
          let resultdelete = await db.attends.delete({ where: { id: attend.id } })
          console.log("🚀 ~ resultdelete:", resultdelete)
        }
      }
      console.log("🚀 ~ attend:", attend)
      await db.attendBranch.update({ data, where: { id } });
    } else {
      let data = {
        clockInNew: timeIn,
        clockOutNew: timeOut,
        branchNew: branch!,
        startOn: start.format('YYYY-MM-DD'),
      }
      await db.attendBranch.update({ data, where: { id } });
    }

    await Logging(session?.user.id, "success update user branch", `success user  ${id}`)
    return { success: "data update" };
  } catch (error) {
    await Logging(session?.user.id, "Error update user branch", `Error user  ${id}`)
    return { error: "error" };
  }
};

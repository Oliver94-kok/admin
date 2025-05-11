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
    const today = dayjs();
    const start = dayjs(startOn, 'D/M/YYYY'); // Parse with correct format

    console.log("🚀 ~ Parsed Date:", start.format('YYYY-MM-DD'));
    console.log("🚀 ~ Today:", today.format('YYYY-MM-DD'));

    if (today.isSame(start, 'day')) { // Compare only dates (ignores time)
      console.log("✅ Same day!");
    } else {
      console.log("❌ Different day!");
    }
    let data = {
      clockIn: timeIn,
      clockOut: timeOut,
      team: teams!,
      branch: branch!,
      startOn: startOn!,
      offDay: offDay!,
    };
    console.log("🚀 ~ data:", data);
    await db.attendBranch.update({ data, where: { id } });
    await Logging(session?.user.id, "success update user branch", `success user  ${id}`)
    return { success: "data update" };
  } catch (error) {
    await Logging(session?.user.id, "Error update user branch", `Error user  ${id}`)
    return { error: "error" };
  }
};

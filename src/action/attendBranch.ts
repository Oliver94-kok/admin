"use server";
import dayjs from "dayjs";
import { db } from "@/lib/db";
import { slideDate } from "@/lib/function";
import { DateTime } from "luxon";
import { AttendStatus } from "@prisma/client";
export const UpdateUserBranch = async (
  id: string,
  teams?: string | null,
  timeIn?: string,
  timeOut?: string,
  offDay?: string,
  startOn?: string,
) => {
  let data = {
    clockIn: timeIn,
    clockOut: timeOut,
    team: teams!,
    startOn: startOn!,
    offDay: offDay!,
  };
  console.log("🚀 ~ data:", data);
  try {
    await db.attendBranch.update({ data, where: { id } });
    if (offDay) {
      const today = dayjs(offDay).format("YYYY-MM-DD");

      let attendData = {
        userId: id,
        dates: new Date(today),
        status: AttendStatus.Leave,
      };
      await db.attends.create({ data: attendData });
    }
    return { success: "data update" };
  } catch (error) {
    return { error: "error" };
  }
};

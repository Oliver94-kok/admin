"use server";
import dayjs from "dayjs";
import { db } from "@/lib/db";
import { slideDate } from "@/lib/function";
import { DateTime } from "luxon";
import { AttendStatus } from "@prisma/client";
import { Logging } from "@/data/log";
import { auth } from "../../auth";
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
  let data = {
    clockIn: timeIn,
    clockOut: timeOut,
    team: teams!,
    branch: branch!,
    startOn: startOn!,
    offDay: offDay!,
  };
  console.log("🚀 ~ data:", data);
  try {
    await db.attendBranch.update({ data, where: { id } });
    await Logging(session?.user.id, "success update user branch", `success user  ${id}`)
    return { success: "data update" };
  } catch (error) {
    await Logging(session?.user.id, "Error update user branch", `Error user  ${id}`)
    return { error: "error" };
  }
};

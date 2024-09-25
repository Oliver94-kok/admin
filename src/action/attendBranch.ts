"use server";

import { db } from "@/lib/db";
import { slideDate } from "@/lib/function";
import { DateTime } from "luxon";
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
    return { success: "data update" };
  } catch (error) {
    return { error: "error" };
  }
};

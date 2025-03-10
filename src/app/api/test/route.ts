import { calOverTime2, leaveForgetClockAttend } from "@/data/attend";
import { addLeaveAttend, forEachDate } from "@/data/leave";
import {
  CheckSalarys,
  getAttendLate,
  getNoClockIn,
  getNoClockOut,
} from "@/data/salary";
import { db } from "@/lib/db";
import { checkWorkingHour, extractDateAndDay } from "@/lib/function";

import { TimeUtils } from "@/lib/timeUtility";
import { leaveType } from "@/types/leave";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import { DateTime } from "luxon";

export const GET = async (request: Request) => {
  try {
    let today = dayjs()
    let t = new Date("2025-03-08");
    const users = await db.attends.findMany({ where: { dates: t, status: "Active" } })
    const results = await Promise.allSettled(
      users.map(async (u) => {
        try {
          let shift = await db.attendBranch.findFirst({
            where: { userId: u.userId, clockIn: "19:00" },
            select: { clockOut: true, userId: true },
          });
          if (!shift?.clockOut) {
            throw new Error(`No shift fousnd for user ${shift?.userId}`);
          }
          const shiftOut = TimeUtils.createDateFromTimeString(
            t,
            shift.clockOut,
            "out",
          );
          await db.attends.update({ where: { id: u.id }, data: { clockOut: shiftOut, status: "Full_Attend" } })
          return {
            userId: u.userId,
            type: "success",
            created: true,
            shiftOut,
            count: shift,
          };
        } catch (error) {
          return {
            userId: u.userId,
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            created: false,
          };
        }
      }),
    );
    const processedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          userId: "unknown",
          type: "error",
          error: result.reason,
          created: false,
        };
      }
    });

    const summary = {
      total: users.length,
      successful: processedResults.filter((r) => r.type === "success").length,
      have: processedResults.filter((r) => r.type === "have").length,
      failed: processedResults.filter((r) => r.type === "error").length,
      details: processedResults.filter((r) => r.type === "error"),
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ GET ~ error:", error);
    return Response.json(error);
  }
};

export const POST = async (req: Request) => {
  try {

    let today = dayjs()
    let t = new Date("2025-03-08");

    // Get all attendance records for the date
    const attends = await db.attends.findMany({
      where: { dates: t }
    });

    // Create a set of user IDs who have attended
    const attendedUserIds = new Set(attends.map(attend => attend.userId));

    // Get all users with role "USER" who have not attended
    const usersNotAttended = await db.user.findMany({
      where: {
        role: "USER",
        id: { notIn: Array.from(attendedUserIds) }
      }
    });

    return Response.json({ length: usersNotAttended.length, usersNotAttended }, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
};

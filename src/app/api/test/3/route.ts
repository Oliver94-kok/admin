import { calculateOvertimeHours, calculateWorkingHours, getDataByDate } from "@/data/attend";
import { CheckSalarys } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import { date } from "zod";

export const GET = async (request: Request) => {
  try {
    let today = new Date("2025-01-01");
    const users = await db.attends.findMany({
      where: { dates: today, users: { AttendBranch: { team: "D" } } },
      select: { userId: true },
    });
    const selectUser = await db.user.findMany({
      where: { AttendBranch: { team: "D" } },
      select: { id: true },
    });
    const attendingUserIds = new Set(users.map((user) => user.userId));

    // Filter selectUser array to find IDs that don't exist in users array
    const missingUsers = selectUser.filter(
      (user) => !attendingUserIds.has(user.id),
    );
    const results = await Promise.allSettled(
      missingUsers.map(async (u) => {
        try {
          let shift = await db.attendBranch.findFirst({
            where: { userId: u.id },
          });
          if (!shift?.clockIn || !shift?.clockOut) {
            throw new Error(`No shift found for user ${u.id}`);
          }

          const now = new Date();
          const shiftIn = TimeUtils.createDateFromTimeString(
            today,
            shift.clockIn,
            "in",
          );
          const shiftOut = TimeUtils.createDateFromTimeString(
            today,
            shift.clockOut,
            "out",
          );

          let data = {
            userId: u.id,
            clockIn: shiftIn,
            clockOut: shiftOut,
            dates: today,
            status: AttendStatus.Full_Attend,
          };
          let create = await db.attends.create({ data });
          return {
            userId: u.id,
            type: "create",
            create,
          };
        } catch (error) {
          return {
            userId: u.id,
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
      total: missingUsers.length,
      create: {
        total: processedResults.filter((r) => r.type === "create").length,
        detail: processedResults.filter((r) => r.type === "create"),
      },
      failed: {
        total: processedResults.filter((r) => r.type === "error").length,
        detail: processedResults.filter((r) => r.type === "error"),
      },
    };
    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(error, { status: 400 });
  }
};

export const POST = async (req: Request) => {
  try {
    let today = dayjs()

    let t = new Date("2025-03-09");

    // const users = await db.attends.findMany({
    //   where: { dates: t, status: "Active" },
    // });
    const users = await db.user.findMany({ where: { role: "USER", AttendBranch: { clockIn: "08:00" } } })
    const results = await Promise.allSettled(
      users.map(async (u) => {
        try {
          let shift = await db.attendBranch.findFirst({
            where: { userId: u.id },
            select: { clockIn: true },
          });
          if (!shift?.clockIn) {
            throw new Error(`No shift found for user ${u.id}`);
          }
          let attend = await db.attends.findFirst({ where: { userId: u.id, dates: t } })
          if (attend) {
            throw new Error(`user has clock in ${u.id}`);
          }
          const shiftOut = TimeUtils.createDateFromTimeString(
            t,
            shift.clockIn,
            "in",
          );
          let data = {
            userId: u.id,
            dates: t,
            clockIn: shiftOut,
            status: AttendStatus.Active
          }
          await db.attends.create({ data })
          // let workingHour = await calculateWorkingHours(u.clockIn, shiftOut);
          // let overtime = await calculateOvertimeHours(shiftOut, shiftOut);
          // const created = await db.attends.update({
          //   where: { id: u.id },
          //   data: {
          //     clockOut: shiftOut,
          //     status: "Full_Attend",
          //     workingHour,
          //     locationOut: u.locationIn,
          //   },
          // });
          // await CheckSalarys({
          //   userId: u.userId,
          //   fineLate: u.status == "Late" ? u.fine : null,
          //   fineNoClockIn: null,
          //   fineNoClockOut: null,
          //   overtime: Number(overtime!),
          //   workingHour: workingHour,
          // });

          return {
            userId: u.id,
            type: "success",
            created: true,
            shiftOut,
            count: data,
          };
        } catch (error) {
          return {
            userId: u.id,
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
      details: processedResults,
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.error("Main operation failed:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "failed",
      },
      { status: 500 },
    );
  }
};

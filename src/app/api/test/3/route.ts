import { calculateOvertimeHours, calculateWorkingHours, getDataByDate } from "@/data/attend";
import { CheckSalarys, getAttendLate } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import { date } from "zod";

export const GET = async (request: Request) => {
  try {
    const today = new Date("2025-03-17");


    return Response.json({ "status": "OKay" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(error, { status: 400 });
  }
};

export const POST = async (req: Request) => {
  try {
    let today = dayjs()

    let t = new Date("2025-03-17");

    // const users = await db.attends.findMany({
    //   where: { dates: t, status: "Active" },
    // });
    const users = await db.attends.findMany({ where: { dates: t, status: { notIn: ['Absent', 'Active', 'OffDay'], }, } })
    const BATCH_SIZE = 3;
    const results = [];

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        userBatch.map(async (user) => {
          try {
            let shift = await db.attendBranch.findFirst({ where: { userId: user.userId } })
            if (!shift) throw new Error("User not have shift")
            if (!shift.clockIn || !shift.clockOut) throw new Error("No clock in or out")
            const shiftIn = TimeUtils.createDateFromTimeString(
              t,
              shift.clockIn,
              "in",
            );
            const shiftOut = TimeUtils.createDateFromTimeString(
              t,
              shift.clockOut!,
              "out",
            );
            let ss = dayjs(shiftIn).add(659, "second");
            let inss = dayjs(user.clockIn)
            let late = inss.isAfter(ss);
            var userlate;
            if (late) {
              userlate = await getAttendLate(
                user.userId,
                new Date().getMonth() + 1,
                new Date().getFullYear(),
              );
            }
            let workingHour = await calculateWorkingHours(
              user.clockIn,
              user.clockOut,
            );
            let overtime = await calculateOvertimeHours(shiftOut, user.clockOut);
            await db.attends.update({
              where: { id: user.id }, data: {
                workingHour,
                overtime,
                fine: late ? userlate : null,
                status: late ? "Late" : "Full_Attend"
              }
            })
            // await CheckSalarys({
            //   userId: user.userId,
            //   fineLate: null,
            //   fineNoClockIn: null,
            //   fineNoClockOut: null,
            //   overtime: Number(overtime!),
            //   workingHour: workingHour,
            // });
            return {
              userId: user.id,
              type: "success",
              created: true,
              // shiftOut,
              count: user
            };
          } catch (error) {
            return {
              userId: user.id,
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
              created: false,
            };
          }
        }))
      results.push(...batchResults);

      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }


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

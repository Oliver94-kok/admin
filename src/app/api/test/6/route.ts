import { addLeaveAttend, forEachDate } from "@/data/leave"
import { db } from "@/lib/db"
import { extractDateAndDay } from "@/lib/function"
import { leaveType } from "@/types/leave"
import { AttendStatus } from "@prisma/client"
import dayjs from "dayjs"

export const GET = async () => {
  try {
    const attends = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date("2025-05-01"),
          lte: new Date("2025-05-30"),
        },
        status: "No_clockIn_ClockOut_Late",
        clockIn: null,
        clockOut: null
      }
    })
    const BATCH_SIZE = 5;
    const results = [];
    for (let i = 0; i < attends.length; i += BATCH_SIZE) {
      const userBatch = attends.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        userBatch.map(async (a) => {
          try {
            await db.attends.update({
              where: { id: a.id }, data: {
                status: "Absent",
                fine: null,
                fine2: null,
              }
            })
            return {
              userId: a.userId,
              success: true,
            };
          } catch (err) {
            const error = err as Error;
            console.error(`Error processing user ${a.userId}:`, error);
            return {
              userId: a.userId,
              error: error.message || "Unknown error occurred",
              success: false,
            };
          }

        })
      )

      results.push(...batchResults);

      if (i + BATCH_SIZE < attends.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    const summary = {
      totalProcessed: results.length,
      successful: results.filter(
        (r) => r.status === "fulfilled" && r.value.success,
      ).length,
      failed: results.filter((r) => r.status === "rejected" || !r.value.success)
        .length,
      details: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason },
      ),
    };

    return Response.json(summary, { status: 200 })
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}



export const POST = async (req: Request) => {
  try {
    const { userId, start, end, type } = await req.json()

    await db.leave.create({ data: { userId, reason: "", type, startDate: start, endDate: end, status: "Approve" } })
    const startLeave = await extractDateAndDay(start);
    console.log("🚀 ~ ApproveLeave ~ startLeave:", startLeave);
    const endLeave = await extractDateAndDay(end);
    console.log("🚀 ~ ApproveLeave ~ endLeave:", endLeave);
    let checkLeaveType = leaveType.filter((e) => e == type);

    if (startLeave == endLeave) {

      await addLeaveAttend(
        userId,
        `${startLeave.year}-${startLeave.month}-${startLeave.day}`,
      );
      if (checkLeaveType) {
        let salary = await db.salary.findFirst({
          where: {
            userId: userId,
            year: startLeave.year,
            month: startLeave.month,
          },
        });
        if (!salary)
          throw new Error(
            `User salary for month ${startLeave.month} and year ${startLeave.year} not found`,
          );
        await db.salary.update({
          where: { id: salary.id },
          data: { absent: salary.absent! + 1 },
        });
      }
    } else {
      let totalDays = 0;
      forEachDate(startLeave.date, endLeave.date, async (date) => {
        console.log("🚀 ~ forEachDate ~ date:", date);
        console.log("Date:", dayjs(date).format("YYYY-MM-DD")); // Will show 2024-11-04 and 2024-11-05
        let ndate = dayjs(date).format("YYYY-MM-DD");
        await addLeaveAttend(userId, ndate);
        totalDays += 1;
      });
      if (checkLeaveType) {
        let salary = await db.salary.findFirst({
          where: {
            userId: userId,
            year: startLeave.year,
            month: startLeave.month,
          },
        });
        if (!salary)
          throw new Error(
            `User salary for month ${startLeave.month} and year ${startLeave.year} not found`,
          );
        await db.salary.update({
          where: { id: salary.id },
          data: { absent: salary.absent! + totalDays },
        });
      }
    }
    return Response.json({ "status": "okay" }, { status: 200 })
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error)
    return Response.json(error, { status: 400 })
  }
}
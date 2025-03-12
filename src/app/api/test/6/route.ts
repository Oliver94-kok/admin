import { db } from "@/lib/db"
import { TimeUtils } from "@/lib/timeUtility"
import { AttendStatus } from "@prisma/client"
import dayjs from "dayjs"


export const POST = async (req: Request) => {
  try {
    const users = await db.user.findMany({ where: { role: "USER", AttendBranch: { clockIn: "08:00" } } })
    const attends = await db.attends.findMany({ where: { dates: new Date("2025-03-11") } });
    const attendedUserIds = new Set(
      attends.map((attend: { userId: any }) => attend?.userId),
    );
    const absentUsers = users.filter((user) => !attendedUserIds.has(user.id));
    const BATCH_SIZE = 5;
    const results = [];
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        userBatch.map(async (user) => {
          try {
            const shiftInTime = TimeUtils.createDateFromTimeString(
              new Date("2025-03-11"),
              "08:00",
              "in"
            );
            let data = {
              userId: user.id,
              dates: new Date("2025-03-11"),
              clockIn: shiftInTime,
              status: AttendStatus.Active
            }
            await db.attends.create({ data })
            return {
              userId: user.id,
              success: true,
            };

          } catch (err) {
            const error = err as Error;
            console.error(`Error processing user ${user.id}:`, error);
            return {
              userId: user.id,
              error: error.message || "Unknown error occurred",
              success: false,
            };
          }
        }))

      results.push(...batchResults);

      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    const summary = {
      totalProcessed: results.length,
      successful: results.filter(
        (r) => r.status === "fulfilled" && r.value?.success,
      ).length,
      failed: results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value?.success))
        .length,
      details: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason },
      ),
    };

    return Response.json(summary, { status: 200 });
    return Response.json({ total: absentUsers.length, absentUsers }, { status: 200 })
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}

const generateDateRange = async (data: any, userId: string) => {
  // Missing variables that need to be defined
  const startDate = "2025-03-01";
  const daysCount = 8; // March has 31 days

  const dateRange = [];
  const existingDates = data.map((item: { date: any }) => item.date);

  for (let i = 0; i < daysCount; i++) {
    const currentDate = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD');

    if (existingDates.includes(currentDate)) {
      // This date already exists in your data
      const existingItem = data.find((item: { date: string }) => item.date === currentDate);
      dateRange.push(existingItem);
    } else {
      // Create a new entry for this date
      const newAttend = await db.attends.create({
        data: {
          userId: userId,
          dates: new Date(currentDate),
          status: AttendStatus.Absent
        }
      });
      dateRange.push(newAttend);
    }
  }

  return dateRange;
}

export const GET = async () => {
  try {
    const users = await db.user.findMany({
      where: {
        role: "USER",
        AttendBranch: {
          team: "D"
        }
      }
    });

    const BATCH_SIZE = 3;
    const results = [];

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        userBatch.map(async (user) => {
          try {
            const attends = await db.attends.findMany({
              where: {
                userId: user.id,
                dates: {
                  gte: new Date("2025-03-01"),
                  lte: new Date("2025-03-31")
                }
              }
            });

            let attendsWithDates = attends;
            if (attends.length < 8) { // Changed from 7 to 31 for all days in March
              attendsWithDates = await generateDateRange(attends, user.id);
            }

            return {
              userId: user.id,
              length: attendsWithDates.length,
              success: true,
            };

          } catch (err) {
            const error = err as Error;
            console.error(`Error processing user ${user.id}:`, error);
            return {
              userId: user.id,
              error: error.message || "Unknown error occurred",
              success: false,
            };
          }
        }),
      );

      results.push(...batchResults);

      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const summary = {
      totalProcessed: results.length,
      successful: results.filter(
        (r) => r.status === "fulfilled" && r.value?.success,
      ).length,
      failed: results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value?.success))
        .length,
      details: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason },
      ),
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
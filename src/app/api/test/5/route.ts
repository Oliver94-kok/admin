import { db } from "@/lib/db";
import { leaveType } from "@/types/leave";
import { NextRequest } from "next/server";

const updateAttendsInDb = async (attendArray: any[]) => {
  return await db.$transaction(
    attendArray.map((attend, index) => {
      return db.attends.update({
        where: { id: attend.id },
        data: {
          fine: index === 0 ? 50 : 100,
        },
      });
    }),
  );
};
const countMatchingLeaves = async (
  userId: string,
  startDate: string,
  endDate: string,
) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let leaves = await db.leave.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "Approve",
        type: {
          in: leaveType, // Assuming leaveType is an array
        },
      },
    });

    return leaves.length;
  } catch (error) {
    console.log("🚀 ~ countMatchingLeaves ~ error:", error);
    return null;
  }
};

export const POST = async (req: Request) => {
  try {
    const { team, startDate, endDate, month } = await req.json();
    const users = await db.user.findMany({
      where: { role: "USER", AttendBranch: { team } },
      select: { id: true },
    });

    const BATCH_SIZE = 3;
    const results = [];

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        userBatch.map(async (user) => {
          try {
            return await db.$transaction(async (tx) => {
              const [noClockInAttends, lateAttends, attends, absent] =
                await Promise.all([
                  tx.attends.findMany({
                    where: {
                      dates: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                      },
                      userId: user.id,
                      status: "No_ClockIn_ClockOut",
                    },
                  }),
                  tx.attends.findMany({
                    where: {
                      dates: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                      },
                      userId: user.id,
                      status: "Late",
                    },
                  }),
                  tx.attends.findMany({
                    where: {
                      dates: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                      },
                      userId: user.id,
                      NOT: {
                        OR: [{ status: "Absent" }, { status: "Leave" }, { status: "Active" }],
                      },
                    },
                  }),
                  tx.attends.findMany({
                    where: {
                      dates: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                      },
                      userId: user.id,

                      status: "Absent",
                    },
                  }),
                ]);

              const [updatedNoClockIn, updatedLate] = await Promise.all([
                updateAttendsInDb(noClockInAttends),
                updateAttendsInDb(lateAttends),
              ]);

              const totalNoClockInFine = updatedNoClockIn.reduce(
                (sum, _, index) => sum + (index === 0 ? 50 : 100),
                0,
              );
              const totalLateFine = updatedLate.reduce(
                (sum, _, index) => sum + (index === 0 ? 50 : 100),
                0,
              );
              let leave = await countMatchingLeaves(
                user.id,
                startDate,
                endDate,
              );
              let totalDay = attends.length + leave!;
              const salary = await tx.salary.findFirst({
                where: { userId: user.id, month, year: 2025 },
              });

              if (!salary) {
                throw new Error(`No salary record found for user ${user.id}`);
              }
              let total = totalDay * salary.perDay! - totalLateFine - totalNoClockInFine - (absent.length * 2 * salary.perDay!)
              const updatedSalary = await tx.salary.update({
                where: { id: salary.id },
                data: {
                  total,
                  fineNoClockIn: totalNoClockInFine,
                  fineLate: totalLateFine,
                  workingDay: totalDay,
                  absent: absent.length,
                },
              });

              return {
                userId: user.id,
                noClockInRecords: noClockInAttends.length,
                lateRecords: lateAttends.length,
                totalNoClockInFine,
                totalLateFine,
                absent: absent.length,
                success: true,
              };
            });
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
        (r) => r.status === "fulfilled" && r.value.success,
      ).length,
      failed: results.filter((r) => r.status === "rejected" || !r.value.success)
        .length,
      details: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason },
      ),
    };

    return Response.json(summary, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error("Main process error:", error);
    return Response.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    if (!userId || !startDate || !endDate) throw new Error("No user id");

    let noclockin = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        userId: userId,
        status: "No_ClockIn_ClockOut",
      },
    });
    let latedata = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        userId: userId,
        status: "Late",
      },
    });
    let attends = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        userId: userId,
        NOT: {
          OR: [{ status: "Absent" }, { status: "Leave" }],
        },
      },
    });
    let absents = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        userId: userId,
        status: "Absent",
      },
    });
    const [updatedNoClockIn, updatedLate] = await Promise.all([
      updateAttendsInDb(noclockin),
      updateAttendsInDb(latedata),
    ]);

    const totalNoClockInFine = updatedNoClockIn.reduce(
      (sum, _, index) => sum + (index === 0 ? 50 : 100),
      0,
    );
    const totalLateFine = updatedLate.reduce(
      (sum, _, index) => sum + (index === 0 ? 50 : 100),
      0,
    );

    let leave = await countMatchingLeaves(userId, startDate, endDate);
    let totalDay = attends.length + leave!;
    const salary = await db.salary.findFirst({
      where: { userId: "cm5fndaox006vpnr1lcg8p5tv", month: 1, year: 2025 },
    });

    if (!salary) {
      throw new Error(`No salary record found for user ${"user.id"}`);
    }

    const updatedSalary = await db.salary.update({
      where: { id: salary.id },
      data: {
        fineNoClockIn: totalNoClockInFine,
        fineLate: totalLateFine,
        workingDay: totalDay,
        absent: absents.length,
      },
    });
    return Response.json({ updatedSalary }, { status: 200 });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return Response.json({ error: "An error occurred" }, { status: 400 });
  }
};

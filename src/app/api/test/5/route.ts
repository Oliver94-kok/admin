import { db } from "@/lib/db";

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
const updateAttendsInDb2 = async (attendArray: any[]) => {
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

export const POST = async (req: Request) => {
  try {
    const users = await db.user.findMany({
      where: { role: "USER", AttendBranch: { team: "D" } },
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
              const [noClockInAttends, lateAttends, attends] =
                await Promise.all([
                  tx.attends.findMany({
                    where: {
                      dates: {
                        gte: new Date("2025-01-01"),
                        lte: new Date("2025-01-31"),
                      },
                      userId: user.id,
                      status: "No_ClockIn_ClockOut",
                    },
                  }),
                  tx.attends.findMany({
                    where: {
                      dates: {
                        gte: new Date("2025-01-01"),
                        lte: new Date("2025-01-31"),
                      },
                      userId: user.id,
                      status: "Late",
                    },
                  }),
                  tx.attends.findMany({
                    where: {
                      dates: {
                        gte: new Date("2025-01-01"),
                        lte: new Date("2025-01-31"),
                      },
                      userId: user.id,
                      NOT: {
                        status: "Absent",
                      },
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

              const salary = await tx.salary.findFirst({
                where: { userId: user.id, month: 1, year: 2025 },
              });

              if (!salary) {
                throw new Error(`No salary record found for user ${user.id}`);
              }

              const updatedSalary = await tx.salary.update({
                where: { id: salary.id },
                data: {
                  fineNoClockIn: totalNoClockInFine,
                  fineLate: totalLateFine,
                  workingDay: attends.length,
                },
              });

              return {
                userId: user.id,
                noClockInRecords: updatedNoClockIn.length,
                lateRecords: updatedLate.length,
                totalNoClockInFine,
                totalLateFine,
                workingDay: attends.length,
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

export const GET = async (req: Request) => {
  try {
    let noclockin = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date("2025-01-01"),
          lte: new Date("2025-01-31"),
        },
        userId: "cm5fndaox006vpnr1lcg8p5tv",
        status: "No_ClockIn_ClockOut",
      },
    });
    let latedata = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date("2025-01-01"),
          lte: new Date("2025-01-31"),
        },
        userId: "cm5fndaox006vpnr1lcg8p5tv",
        status: "Late",
      },
    });
    let attends = await db.attends.findMany({
      where: {
        dates: {
          gte: new Date("2025-01-01"),
          lte: new Date("2025-01-31"),
        },
        userId: "cm5fndaox006vpnr1lcg8p5tv",
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
        workingDay: attends.length,
      },
    });
    return Response.json({ updatedSalary }, { status: 200 });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return Response.json({ error: "An error occurred" }, { status: 400 });
  }
};

import { getDataUser } from "@/action/getUserData";
import { calculateOvertimeHours } from "@/data/attend";
import { getAttendLate } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";

export const GET = async (request: Request) => {
  try {
    const users = await db.user.findMany({
      where: { AttendBranch: { team: "D" } },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      users.map(async (u) => {
        try {
          let salary = await db.salary.findMany({ where: { userId: u.id } });
          if(salary.length >13){
            return {
              userId: u.id,
              type: "lebih",
              created: true,
              length: salary.length,
            };
          }
          return {
            userId: u.id,
            type: "success",
            created: true,
            length: salary.length,
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

    // Map the settled promises to your desired format
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
      have: processedResults.filter((r) => r.type === "lebih").length,
      failed: processedResults.filter((r) => r.type === "error").length,
      details: processedResults.filter((r) => r.type === "lebih"),
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
};
export const POST = async (req: Request) => {
  try {
    const users = await db.user.findMany({
      where: { AttendBranch: { team: "c" } },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      users.map(async (u) => {
        try {
          let salary = await db.salary.findFirst({
            where: { userId: u.id, year: 2025, month: 1 },
          });

          const created = await db.salary.updateMany({
            where: { userId: salary?.userId },
            data: { perDay: salary?.perDay },
          });
          return {
            userId: u.id,
            type: "success",
            created: true,
            count: created.count,
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

    // Map the settled promises to your desired format
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

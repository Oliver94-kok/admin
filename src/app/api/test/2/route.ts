import { getDataUser } from "@/action/getUserData";
import { calculateOvertimeHours } from "@/data/attend";
import { getAttendLate } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";

export const GET = async (request: Request) => {
  try {
    const users = await getDataUser(2024, 12, "A");
    return Response.json(users, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
};
export const POST = async (req: Request) => {
  try {
    const users = await db.user.findMany({
      where: { AttendBranch: { team: "D" } },
      select: { id: true },
    });
    const results = await Promise.allSettled(
      users.map(async (u) => {
        try {
          const data = Array.from({ length: 12 }, (_, i) => ({
            userId: u.id,
            month: i + 1,
            year: 2025,
          }));

          const created = await db.salary.createMany({ data });
          return {
            userId: u.id,
            status: "fulfilled",
            created: true,
            count: created.count,
          };
        } catch (error) {
          return {
            userId: u.id,
            status: "rejected",
            error: error instanceof Error ? error.message : "Unknown error",
            created: false,
          };
        }
      }),
    );

    const summary = {
      total: users.length,
      successful: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
      details: results,
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

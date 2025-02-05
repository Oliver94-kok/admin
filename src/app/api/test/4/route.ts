import { calculateOvertimeHours, calculateWorkingHours } from "@/data/attend";
import { calculateSalary, CheckSalarys, excelData } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
interface AttendanceResult {
  userId: string;
  type: "success" | "error" | "have";
  created: boolean;
  shiftIn?: Date;
  count?: any;
  error?: string;
}

interface AttendanceSummary {
  total: number;
  successful: number;
  have: number;
  failed: number;
  details: AttendanceResult[];
}

export const GET = async (req: Request) => {
  try {
    // Rate limiting
    // const rateLimitResult = await rateLimit(req);
    // if (!rateLimitResult.success) {
    //   return Response.json(
    //     { error: 'Too many requests. Please try again later.' },
    //     { status: 429 }
    //   );
    // }

    const today = dayjs();
    const todays = new Date(today.format("YYYY-MM-DD"));

    // Get unattended users in a single query with proper error handling
    const notAttended = await db.$transaction(async (tx) => {
      try {
        return await tx.attendBranch.findMany({
          where: {
            NOT: {
              userId: {
                in: (
                  await tx.attends.findMany({
                    where: { dates: todays },
                    select: { userId: true },
                  })
                ).map((a) => a.userId),
              },
            },
          },
          select: { userId: true, clockIn: true },
        });
      } catch (error) {
        console.error("Database query error:", error);
        throw new Error("Failed to fetch attendance data");
      }
    });

    // Filter users who should clock in before 8:30 AM
    const THRESHOLD_TIME = "08:30";
    const below8AM = notAttended
      .filter((record) => {
        try {
          const currentTime = dayjs(record.clockIn, "HH:mm");
          const threshold = dayjs(THRESHOLD_TIME, "HH:mm");
          return currentTime.isBefore(threshold);
        } catch (error) {
          console.error(
            `Error processing time for user ${record.userId}:`,
            error,
          );
          return false;
        }
      })
      .map((record) => record.userId);

    // Process attendance records with proper error handling
    const results = await Promise.allSettled(
      below8AM.map(async (userId): Promise<AttendanceResult> => {
        try {
          // Use transaction for data consistency
          return await db.$transaction(async (tx) => {
            // Check if attendance already exists
            const existingAttendance = await tx.attends.findFirst({
              where: {
                userId,
                dates: todays,
              },
            });

            if (existingAttendance) {
              return {
                userId,
                type: "have",
                created: false,
                error: "Attendance already exists",
              };
            }

            const shift = await tx.attendBranch.findFirst({
              where: { userId },
              select: { clockIn: true },
            });

            if (!shift?.clockIn) {
              throw new Error(`No shift found for user ${userId}`);
            }

            const shiftIn = TimeUtils.createDateFromTimeString(
              todays,
              shift.clockIn,
              "in",
            );

            const created = await tx.attends.create({
              data: {
                userId,
                clockIn: shiftIn,
                dates: todays,
              },
            });

            return {
              userId,
              type: "success",
              created: true,
              shiftIn,
              count: created,
            };
          });
        } catch (error) {
          // Handle specific database errors
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return {
              userId,
              type: "error",
              created: false,
              error: `Database error: ${error.code}`,
            };
          }
          return {
            userId,
            type: "error",
            created: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    // Process results with proper typing
    const processedResults = results.map((result): AttendanceResult => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return {
        userId: "unknown",
        type: "error",
        created: false,
        error: result.reason?.toString() || "Unknown error",
      };
    });

    // Create summary with proper error counting
    const summary: AttendanceSummary = {
      total: below8AM.length,
      successful: processedResults.filter((r) => r.type === "success").length,
      have: processedResults.filter((r) => r.type === "have").length,
      failed: processedResults.filter((r) => r.type === "error").length,
      details: processedResults,
    };

    return Response.json(summary, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API error:", error);

    // Handle different types of errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return Response.json(
        { error: "Database operation failed", code: error.code },
        { status: 500 },
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return Response.json({ error: "Invalid data provided" }, { status: 400 });
    }

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    let today = dayjs().subtract(1, "days");
    let yesterday = new Date(today.format("YYYY-MM-DD"));
    console.log("🚀 ~ POST ~ today:", today);
    let data = await db.attends.findMany({
      where: { dates: yesterday, status: "Active" },
    });
    const results = await Promise.allSettled(
      data.map(async (attend) => {
        try {
          let shift = await db.attendBranch.findFirst({
            where: { userId: attend.userId },
            select: { clockOut: true },
          });
          if (!shift?.clockOut) {
            throw new Error(`No shift found for user ${attend.id}`);
          }
          const shiftOut = TimeUtils.createDateFromTimeString(
            yesterday,
            shift.clockOut,
            "out",
          );
          let workingHour = await calculateWorkingHours(
            attend.clockIn,
            shiftOut,
          );
          let overtime = await calculateOvertimeHours(shiftOut, shiftOut);
          const created = await db.attends.update({
            where: { id: attend.id },
            data: {
              clockOut: shiftOut,
              status: "Full_Attend",
              workingHour,
              locationOut: attend.locationIn,
            },
          });
          await CheckSalarys({
            userId: attend.userId,
            fineLate: attend.status == "Late" ? attend.fine : null,
            fineNoClockIn: null,
            fineNoClockOut: null,
            overtime: Number(overtime!),
            workingHour: workingHour,
          });

          return {
            userId: attend.id,
            type: "success",
            created: true,
            shiftOut,
            count: created,
          };
        } catch (error) {
          return {
            userId: attend.id,
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
      total: data.length,
      successful: processedResults.filter((r) => r.type === "success").length,
      have: processedResults.filter((r) => r.type === "have").length,
      failed: processedResults.filter((r) => r.type === "error").length,
      details: processedResults,
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 400 });
  }
};

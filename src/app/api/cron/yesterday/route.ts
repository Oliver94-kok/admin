import { cronAttend, isOffDay } from "@/data/attend";
import { getNoClockOut } from "@/data/salary";
import { getAllUser } from "@/data/user";
import {
  AttendanceService,
  ProcessingResult,
} from "@/lib/attendService";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { branchAssistant } from "@/types/branchs";
import { AttendStatus, Attends } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Note: The GET handler uses a hardcoded date and appears to be for testing purposes.
export const GET = async () => {
  try {
    const attendYesterday = await cronAttend("2025-03-22");
    const attendedUserIds = new Set(
      attendYesterday.map((attend) => attend.userId)
    );

    const users = await getAllUser();
    const absentUsers = users.filter((user) => !attendedUserIds.has(user.id));
    return Response.json({ length: absentUsers.length }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ error: errorMessage }, { status: 400 });
  }
};

export const POST = async (req: Request) => {
  try {
    // Step 1: Clean up users who are stuck in an "Active" state from previous days.
    await handleStaleActiveAttendances();

    // Step 2: Process yesterday's attendance for users who did not clock in.
    const yesterday = dayjs().subtract(1, "day");
    const yesterdayFormatted = yesterday.format("YYYY-MM-DD");
    const yesterdayDate = yesterday.toDate();

    const attendYesterday = await cronAttend(yesterdayFormatted);
    const attendedUserIds = new Set(
      attendYesterday.map((attend) => attend.userId)
    );

    const users = await getAllUser();
    const absentUsers = users.filter((user) => !attendedUserIds.has(user.id));

    const attendanceService = new AttendanceService({
      gracePeriodMinutes: 15, // Suggestion: Make these configurable
      maxOvertimeHours: 4,
      timezone: "UTC",
    });

    const processResults = await Promise.allSettled(
      absentUsers.map((user) =>
        processAbsentUser(user, yesterdayFormatted, yesterdayDate, attendanceService)
      )
    );

    const results = {
      successful: processResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<ProcessingResult>).value),
      failed: processResults
        .filter((result) => result.status === "rejected")
        .map((result) => ({
          userId: (result as PromiseRejectedResult).reason?.userId || "unknown",
          error: (result as PromiseRejectedResult).reason?.message || "Unknown error",
        })),
      timestamp: new Date(),
      totalProcessed: processResults.length,
    };

    return Response.json(results, { status: 200 });
  } catch (error) {
    console.error("Attendance processing error:", error);
    return Response.json(
      {
        error: "Failed to process attendance",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};

/**
 * Finds and updates users who have a stale "Active" attendance status
 * (i.e., they clocked in but never clocked out from a previous day).
 */
async function handleStaleActiveAttendances() {
  try {
    const activeAttendances = await db.attends.findMany({
      where: { status: AttendStatus.Active },
      include: {
        users: {
          select: {
            AttendBranch: {
              select: { clockOut: true, branch: true },
            },
          },
        },
      },
    });

    for (const attendance of activeAttendances) {
      const shift = attendance.users?.AttendBranch;
      if (!shift || !shift.clockOut) {
        console.warn(`Cannot process stale attendance ${attendance.id} for user ${attendance.userId}: No shift info.`);
        continue;
      }

      const attendanceDate = dayjs(attendance.dates);
      const [outHour, outMinute] = shift.clockOut.split(":").map(Number);
      let shiftOutTime;
      if (outHour >= 0 && outHour <= 9) {
        shiftOutTime = attendanceDate.hour(outHour).minute(outMinute).add(1, 'day');
        console.log("🚀 ~ GET ~ shiftOutTime if:", shiftOutTime)
      } else {
        shiftOutTime = attendanceDate.hour(outHour).minute(outMinute);
        console.log("🚀 ~ GET ~ shiftOutTime else:", shiftOutTime)
      }
      // const shiftOutTime = attendanceDate.hour(outHour).minute(outMinute);
      const overtimeEndTime = shiftOutTime.add(4, "hour"); // 4-hour overtime buffer

      if (dayjs().isAfter(overtimeEndTime)) {
        const fine = await getFineForNoClockOut(
          attendance.userId,
          shift.branch,
          attendanceDate.toDate()
        );
        await db.attends.update({
          where: { id: attendance.id },
          data: { status: AttendStatus.No_ClockIn_ClockOut, fine2: fine },
        });
      }
    }
  } catch (error) {
    console.error("Error handling stale active attendances:", error);
    // This error is logged but not re-thrown to allow the main process to continue.
  }
}

/**
 * Calculates the appropriate fine for a user who failed to clock out.
 * @suggestion This logic could be made data-driven by storing fine rules in the DB.
 */
async function getFineForNoClockOut(
  userId: string,
  branch: string | null | undefined,
  date: Date
) {
  const isAssistantBranch = branchAssistant.find((b) => b === branch);
  if (isAssistantBranch) {
    return 200;
  }
  return getNoClockOut(userId, date.getMonth() + 1, date.getFullYear());
}

/**
 * Process an absent user to determine their attendance status for a given date.
 */
async function processAbsentUser(
  user: { id: string },
  dateFormatted: string,
  dateObject: Date,
  attendanceService: AttendanceService
): Promise<ProcessingResult> {
  try {
    const existingAttendance = await db.attends.findFirst({
      where: { userId: user.id, dates: dateObject },
    });

    if (existingAttendance) {
      return {
        userId: user.id,
        status: "within_shift_hours",
        timestamp: new Date(),
        message: `User already has an attendance record with status: ${existingAttendance.status}`,
      };
    }

    const shift = await db.attendBranch.findFirst({
      where: { userId: user.id },
      select: { clockIn: true, clockOut: true, offDay: true, branch: true },
    });

    if (!shift?.clockIn || !shift?.clockOut) {
      return {
        userId: user.id,
        status: "marked_offday",
        timestamp: new Date(),
        message: "User has no shift assigned. Cannot determine attendance status.",
      };
    }

    if (shift.offDay) {
      const offDays = shift.offDay.split(",");
      if (await isOffDay(offDays, "YESTERDAY")) {
        await db.attends.create({
          data: { userId: user.id, dates: dateObject, status: AttendStatus.OffDay },
        });
        return {
          userId: user.id,
          status: "marked_offday",
          timestamp: new Date(),
          message: "User is on a scheduled off day.",
        };
      }
    }

    // This logic handles overnight shifts. If a shift starts between midnight and 6 AM,
    // it's considered part of the previous calendar day's work cycle.
    const shiftStartHour = parseInt(shift.clockIn.split(":")[0], 10);
    const isOvernightShift = shiftStartHour >= 0 && shiftStartHour <= 6;
    const shiftDate = isOvernightShift
      ? dayjs(dateFormatted).add(1, "day").toDate()
      : new Date(dateFormatted);

    const shiftIn = TimeUtils.createDateFromTimeString(shiftDate, shift.clockIn, "in");
    const shiftOut = TimeUtils.createDateFromTimeString(shiftDate, shift.clockOut, "out");

    const shiftResult = await attendanceService.cronAttendCheckShift(shiftIn, shiftOut);

    if (shiftResult.result === "absent" || shiftResult.result === "shift_ended") {
      await db.attends.create({
        data: { userId: user.id, dates: dateObject, status: AttendStatus.Absent },
      });
      return {
        userId: user.id,
        status: "marked_absent",
        timestamp: new Date(),
        message: shiftResult.message,
      };
    }

    if (shiftResult.result === "can_clock_out") {
      // This means the shift has started. If it's >1hr past start time, penalize.
      if (dayjs().isAfter(dayjs(shiftIn).add(1, "hour"))) {
        const fine = await getFineForNoClockOut(user.id, shift.branch, dateObject);
        // await db.attends.create({
        //   data: {
        //     userId: user.id,
        //     dates: dateObject,
        //     status: AttendStatus.No_ClockIn_ClockOut,
        //     fine2: fine,
        //   },
        // });
        return {
          userId: user.id,
          status: "marked_active_with_fine",
          timestamp: new Date(),
          message: "User is >1hr past shift start and did not clock in.",
        };
      } else {
        // User is within 1 hour of shift start, still time to clock in.
        return {
          userId: user.id,
          status: "within_shift_hours",
          timestamp: new Date(),
          message: "Shift has started, but user is still within the grace period to clock in.",
        };
      }
    }

    // Default case: shift has not started yet.
    return {
      userId: user.id,
      status: "within_shift_hours",
      timestamp: new Date(),
      message: shiftResult.message,
    };
  } catch (error) {
    console.error(`Error processing user ${user.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Create a custom error to preserve the userId for the final report
    const processingError = new Error(`Failed to process user ${user.id}: ${errorMessage}`);
    (processingError as any).userId = user.id;
    throw processingError;
  }
}

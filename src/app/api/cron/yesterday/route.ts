import { cronAttend, cronAttendCheckShift, isOffDay } from "@/data/attend";
import { getNoClockIn, getNoClockOut } from "@/data/salary";
import { getAllUser } from "@/data/user";
import {
  AttendanceSchema,
  AttendanceService,
  ProcessingResult,
} from "@/lib/attendService";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { branchAssistant } from "@/types/branchs";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const GET = async () => {
  try {
    const attendYesterday = await cronAttend("2025-03-22");
    const attendedUserIds = new Set(
      attendYesterday.map((attend) => attend.userId)
    );

    // Get all users
    const users = await getAllUser();
    const absentUsers = users.filter((user) => !attendedUserIds.has(user.id));
    return Response.json({ length: absentUsers.length }, { status: 200 })
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}


export const POST = async (req: Request) => {
  try {
    // Calculate yesterday's date
    const yesterday = dayjs().subtract(1, "day");
    const yesterdayFormatted = yesterday.format("YYYY-MM-DD");
    console.log("🚀 ~ POST ~ yesterdayFormatted:", yesterdayFormatted)
    const yesterdayDate = yesterday.toDate();
    console.log("🚀 ~ POST ~ yesterdayDate:", yesterdayDate)

    // Get all attendance records for yesterday
    const attendYesterday = await cronAttend(yesterdayFormatted);
    const attendedUserIds = new Set(
      attendYesterday.map((attend) => attend.userId)
    );

    // Get all users
    const users = await getAllUser();
    const absentUsers = users.filter((user) => !attendedUserIds.has(user.id));

    // Initialize attendance service
    const attendanceService = new AttendanceService({
      gracePeriodMinutes: 15,
      maxOvertimeHours: 4,
      timezone: "UTC",
    });

    // Process each absent user
    const processResults = await Promise.allSettled(
      absentUsers.map(async (user) => {
        return processAbsentUser(user, yesterdayFormatted, yesterdayDate, attendanceService);
      })
    );

    // Prepare response data
    const results = {
      successful: processResults.filter(
        (result) => result.status === "fulfilled"
      ).map(result => (result as PromiseFulfilledResult<ProcessingResult>).value),
      failed: processResults.filter((result) => result.status === "rejected")
        .map(result => ({
          userId: (result as PromiseRejectedResult).reason?.userId || 'unknown',
          error: (result as PromiseRejectedResult).reason?.message || 'Unknown error'
        })),
      timestamp: new Date(),
      totalProcessed: processResults.length,
    };

    return Response.json(results, { status: 200 });
  } catch (error) {
    console.error("Attendance processing error:", error);
    return Response.json(
      { error: "Failed to process attendance", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
};

/**
 * Process an absent user to determine their attendance status
 */
async function processAbsentUser(
  user: { id: string },
  dateFormatted: string,
  dateObject: Date,
  attendanceService: AttendanceService
): Promise<ProcessingResult> {
  try {
    // Check if user already has an attendance record for this date
    const existingAttendance = await db.attends.findFirst({
      where: { userId: user.id, dates: new Date(dateFormatted) }
    });

    if (existingAttendance) {
      return {
        userId: user.id,
        status: "within_shift_hours",
        timestamp: new Date(),
        message: `User already has an attendance record with status: ${existingAttendance.status}`,
      };
    }

    // Get user's shift information
    const shift = await db.attendBranch.findFirst({
      where: { userId: user.id },
      select: {
        clockIn: true,
        clockOut: true,
        offDay: true,
        branch: true
      },
    });

    // Handle case where user has no shift assigned
    if (!shift?.clockIn || !shift?.clockOut) {
      return {
        userId: user.id,
        status: "within_shift_hours",
        timestamp: new Date(),
        message: `No shift found for user`,
      };
    }

    // Check if today is user's off day
    if (shift.offDay) {
      const offDays = shift.offDay.split(",");
      const isUserOffDay = await isOffDay(offDays, "YESTERDAY");

      if (isUserOffDay) {
        await db.attends.create({
          data: {
            userId: user.id,
            dates: dateObject,
            status: AttendStatus.OffDay,
          }
        });

        return {
          userId: user.id,
          status: "marked_offday",
          timestamp: new Date(),
          message: "User is on scheduled off day",
        };
      }
    }
    let shifttimein = shift.clockIn!.split(":").map(Number)
    let result12 = isBetweenZeroAndSix(shifttimein[0])
    let today2 = dayjs(dateFormatted)
    const now = result12 ? new Date(today2.add(1, 'day').format("YYYY-MM-DD")) : new Date(dateFormatted);
    // Calculate shift times for this date
    // const dateForShift = new Date(dateFormatted);
    const shiftIn = TimeUtils.createDateFromTimeString(now, shift.clockIn, "in");
    const shiftOut = TimeUtils.createDateFromTimeString(now, shift.clockOut, "out");

    // Check against shift times
    const shiftResult = await attendanceService.cronAttendCheckShift(shiftIn, shiftOut);

    // Handle different shift results
    if (shiftResult.result === "absent" || shiftResult.result === "shift_ended") {
      await db.attends.create({
        data: {
          userId: user.id,
          dates: dateObject,
          status: AttendStatus.Absent,
        }
      });

      return {
        userId: user.id,
        status: "marked_absent",
        timestamp: new Date(),
        message: shiftResult.message,
      };
    }

    if (shiftResult.result === "can_clock_out") {
      const shiftInTime = dayjs(shiftIn);
      const currentTime = dayjs();
      if (currentTime.isAfter(shiftInTime.add(1, 'hour'))) {

        let fine200 = branchAssistant.find((e) => e === shift?.branch)
        let fine2;
        if (fine200) {
          fine2 = 200;
        } else {
          fine2 = await getNoClockOut(
            user.id,
            dateObject.getMonth() + 1,
            dateObject.getFullYear()
          );
        }
        // const fine = await getNoClockIn(
        //   user.id,
        //   dateObject.getMonth() + 1,
        //   dateObject.getFullYear()
        // );

        await db.attends.create({
          data: {
            userId: user.id,
            dates: new Date(dateFormatted),
            status: AttendStatus.No_ClockIn_ClockOut,
            fine2: fine2
          }
        });
        return {
          userId: user.id,
          status: "marked_active_with_fine",
          timestamp: new Date(),
          message: "User marked as active with fine for no clock-in (1+ hour after shift start)",
        };
      } else {
        return {
          userId: user.id,
          status: "within_shift_hours",
          timestamp: new Date(),
          message: "User marked as active with no clock-in",
        };
      }


    }

    // Default case: within shift hours
    return {
      userId: user.id,
      status: "within_shift_hours",
      timestamp: new Date(),
      shiftResult: shiftResult.result,
      message: shiftResult.message,
    };
  } catch (error) {
    console.error(`Error processing user ${user.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process user ${user.id}: ${errorMessage}`);
  }
}
const validNumbers = [0, 1, 2, 3, 4, 5, 6];
function isBetweenZeroAndSix(num: number): boolean {
  return validNumbers.includes(num);
}

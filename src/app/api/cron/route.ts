import { cronAttend, cronAttendCheckShift, isOffDay } from "@/data/attend";
import { getAllUser } from "@/data/user";
import {
  AttendanceSchema,
  AttendanceService,
  ProcessingResult,
} from "@/lib/attendService";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const POST = async (req: Request) => {
  try {
    const today = dayjs.utc().startOf("day");
    let attendTody = await cronAttend(today.toString());
    const attendedUserIds = new Set(
      attendTody.map((attend: { userId: any }) => attend?.userId),
    );
    let user = await getAllUser();
    const absentUsers = user.filter((users) => !attendedUserIds.has(users.id));

    // const today = dayjs.utc().startOf("day");
    console.log("🚀 ~ POST ~ today:", today);
    const attendanceService = new AttendanceService({
      gracePeriodMinutes: 15,
      maxOvertimeHours: 4,
      timezone: "UTC",
    });

    const processResults = await Promise.allSettled(
      absentUsers.map(async (absentUser) => {
        try {
          const shift = await db.attendBranch.findFirst({
            where: { userId: absentUser.id },
            select: {
              clockIn: true,
              clockOut: true,
              offDay: true,
            },
          });

          if (!shift?.clockIn || !shift?.clockOut) {
            throw new Error(`No shift found for user ${absentUser.id}`);
          }
          if (shift.offDay) {
            let day = shift.offDay.split(",");
            let resultOffDay = await isOffDay(day, "today");
            if (resultOffDay) {
              let data = {
                userId: absentUser.id,
                dates: today.toDate(),
                status: AttendStatus.OffDay,
              };
              await db.attends.create({ data });
              return {
                userId: absentUser.id,
                status: "marked_offday",
                timestamp: new Date(),
                message: "off day",
              } as ProcessingResult;
            }
          }
          const now = new Date();
          const shiftIn = TimeUtils.createDateFromTimeString(
            now,
            shift.clockIn,
            "in",
          );
          const shiftOut = TimeUtils.createDateFromTimeString(
            now,
            shift.clockOut,
            "out",
          );

          const shiftResult = await attendanceService.cronAttendCheckShift(
            shiftIn,
            shiftOut,
          );

          // Only create absence record if outside shift hours
          if (
            shiftResult.result === "absent" ||
            shiftResult.result === "shift_ended"
          ) {
            const attendanceData = {
              userId: absentUser.id,
              dates: today.toDate(),
              status: AttendStatus.Absent,
            };

            await db.attends.create({
              data: attendanceData,
            });

            return {
              userId: absentUser.id,
              status: "marked_absent",
              timestamp: new Date(),
              message: shiftResult.message,
            } as ProcessingResult;
          }

          return {
            userId: absentUser.id,
            status: "within_shift_hours",
            timestamp: new Date(),
            shiftResult: shiftResult.result,
            message: shiftResult.message,
          } as ProcessingResult;
        } catch (error) {
          console.error(`Error processing user ${absentUser.id}:`, error);
          throw error;
        }
      }),
    );

    // Prepare response data
    const results = {
      successful: processResults.filter(
        (result) => result.status === "fulfilled",
      ),
      failed: processResults.filter((result) => result.status === "rejected"),
      timestamp: new Date(),
      totalProcessed: processResults.length,
    };

    return Response.json(results, { status: 200 });
  } catch (error) {
    console.error("Attendance processing error:", error);
    return Response.json(
      { error: "Failed to process attendance" },
      { status: 500 },
    );
  }
};

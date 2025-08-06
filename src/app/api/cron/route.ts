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

export const POST = async (req: Request) => {
  try {
    const today = dayjs.utc().startOf("day");
    let attendTody = await cronAttend(today.toString());
    const attendedUserIds = new Set(
      attendTody.map((attend: { userId: any }) => attend?.userId),
    );
    let user = await getAllUser();
    const absentUsers = user.filter((users) => !attendedUserIds.has(users.id));;
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
              branch: true
            },
          });

          if (!shift?.clockIn || !shift?.clockOut) {
            throw new Error(`No shift found for user ${absentUser.id}`);
          }
          if (shift.offDay) {
            let day = shift.offDay.split(",");
            let resultOffDay = await isOffDay(day, "TODAY");
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
          let shifttimein = shift.clockIn!.split(":").map(Number)
          let result12 = isBetweenZeroAndSix(shifttimein[0])
          const now = result12 ? new Date(today.add(1, 'day').format("YYYY-MM-DD")) : new Date();
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
            let attend = await db.attends.findFirst({ where: { userId: absentUser.id, dates: today.toDate() } })
            if (attend) throw new Error("existing data")
            let fine200 = branchAssistant.find((e) => e === shift?.branch)
            let fine2;
            if (fine200) {
              fine2 = 200;
            } else {
              fine2 = await getNoClockOut(
                absentUser.id,
                new Date().getMonth() + 1,
                new Date().getFullYear()
              );
            }
            const attendanceData = {
              userId: absentUser.id,
              dates: today.toDate(),
              status: AttendStatus.No_ClockIn_ClockOut,
              fine2
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
          if (shiftResult.result === "can_clock_out") {
            let attend = await db.attends.findFirst({ where: { userId: absentUser.id, dates: today.toDate() } })
            if (attend) {
              return {
                userId: absentUser.id,
                status: "within_shift_hours",
                timestamp: new Date(),
                shiftResult: shiftResult.result,
                message: shiftResult.message,
              } as ProcessingResult;
            }
            let fine200 = branchAssistant.find((e) => e === shift?.branch)
            let fine2;
            if (fine200) {
              fine2 = 200;
            } else {
              fine2 = await getNoClockOut(
                absentUser.id,
                new Date().getMonth() + 1,
                new Date().getFullYear()
              );
            }
            let data = {
              userId: absentUser.id,
              dates: today.toDate(),
              status: AttendStatus.Active,
              fine2: fine2
            }
            await db.attends.create({ data })
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

const validNumbers = [0, 1, 2, 3, 4, 5, 6];
function isBetweenZeroAndSix(num: number): boolean {
  return validNumbers.includes(num);
}

"use server";
import dayjs from "dayjs";
import { db } from "@/lib/db"; // Adjust import as needed
import { TimeUtils } from "@/lib/timeUtility";
import { calculateOvertimeHours } from "./attend";

interface ProcessResult {
  userId: string;
  status: "created" | "skipped" | "error";
  data?: any;
  error?: string;
}
export async function processUserAttendance(
  userId: string,
): Promise<ProcessResult> {
  console.log(`🔍 Processing User: ${userId}`);

  try {
    const shift = await db.attendBranch.findFirst({
      where: { userId },
      select: { clockIn: true, clockOut: true },
    });

    if (!shift?.clockIn || !shift?.clockOut) {
      console.log(`⚠️ No shift found for user ${userId}`);
      return {
        userId,
        status: "skipped",
        error: `No shift found for user ${userId}`,
      };
    }

    const yesterday = dayjs().subtract(1, "day");
    const firstDay = dayjs().startOf("month");

    console.log(`📅 Processing Dates for User ${userId}: 
        First Day: ${firstDay.format("YYYY-MM-DD")}
        Last Day: ${yesterday.format("YYYY-MM-DD")}`);

    await processAttendanceDates(
      userId,
      shift.clockIn,
      shift.clockOut,
      firstDay,
      yesterday,
    );

    console.log(`✅ Successfully processed attendance for user ${userId}`);

    return {
      userId,
      status: "created",
      data: { processedUntil: yesterday.format("YYYY-MM-DD") },
    };
  } catch (error) {
    console.error(`❌ Error processing user ${userId}:`, error);
    return {
      userId,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function processAttendanceDates(
  userId: string,
  clockIn: string,
  clockOut: string,
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs,
) {
  let currentDate = startDate;
  let processedDays = 0;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
    const attendanceRecord = await db.attends.findFirst({
      where: {
        userId,
        dates: currentDate.toDate(),
      },
    });

    if (attendanceRecord?.clockIn) {
      const shiftInTime = TimeUtils.createDateFromTimeString(
        currentDate.toDate(),
        clockIn,
        "in",
      );

      const actualClockIn = dayjs(attendanceRecord.clockIn);
      const shiftTime = dayjs(shiftInTime).add(10, "minute");

      const isLate = actualClockIn.isAfter(shiftTime);

      console.log(
        `🕒 User ${userId} Attendance on ${currentDate.format("YYYY-MM-DD")}:`,
        {
          isLate,
          shiftTime: shiftTime.format(),
          actualClockIn: actualClockIn.format(),
        },
      );

      processedDays++;
    }

    currentDate = currentDate.add(1, "day");
  }

  console.log(`📊 Processed ${processedDays} days for user ${userId}`);
}

export async function categorizeProcessResults(
  processResults: PromiseSettledResult<ProcessResult>[],
): Promise<{
  successful: ProcessResult[];
  skipped: ProcessResult[];
  failed: ProcessResult[];
  totalProcessed: number;
  timestamp: Date;
}> {
  // Async processing if needed (e.g., additional database checks or async transformations)
  const successful = processResults
    .filter(
      (result) =>
        result.status === "fulfilled" && result.value.status === "created",
    )
    .map((result) => (result as PromiseFulfilledResult<ProcessResult>).value);

  const skipped = processResults
    .filter(
      (result) =>
        result.status === "fulfilled" && result.value.status === "skipped",
    )
    .map((result) => (result as PromiseFulfilledResult<ProcessResult>).value);

  const failed = await Promise.all(
    processResults
      .filter(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && result.value.status === "error"),
      )
      .map(async (result) => {
        // Example of potential async processing
        if (result.status === "rejected") {
          return {
            status: "error",
            error: String(result.reason),
            userId: "unknown", // You might want to add more context
          } as ProcessResult;
        }

        // If you need to do any async checks or transformations on failed results
        const failedResult = result as PromiseFulfilledResult<ProcessResult>;
        return failedResult.value;
      }),
  );

  return {
    successful,
    skipped,
    failed,
    totalProcessed: processResults.length,
    timestamp: new Date(),
  };
}

import dayjs from "dayjs";
import { db } from "./db";

type AttendanceResult = {
  dataAbsent: AttendRecord[];
  notClockIn: AttendRecord[];
  notClockOut: AttendRecord[];
  dataLate: AttendRecord[];
  totalFine: number;
  totalDays: number;
  attendanceRate: number;
};

// Define type for the attendance record
type AttendRecord = {
  status: string;
  dates: Date;
  fine: number | null;
};

// Define attendance status enum for type safety
enum AttendanceStatus {
  LATE = "Late",
  NO_CLOCK_IN = "No_ClockIn",
  NO_CLOCK_OUT = "No_ClockOut",
  ABSENT = "Absent",
}

export const getAllresultAttend = async (
  userId: string,
  month: number,
  year: number,
): Promise<AttendanceResult> => {
  // Input validation
  if (!userId) throw new Error("User ID is required");
  if (month < 1 || month > 12) throw new Error("Invalid month");
  if (year < 1900 || year > 2100) throw new Error("Invalid year");

  // Create date range using a single dayjs instance
  const date = dayjs()
    .year(year)
    .month(month - 1);
  const dateRange = {
    gte: date.startOf("month").toDate(),
    lte: date.endOf("month").toDate(),
  };

  try {
    // Fetch attendance records
    const result = await db.attends.findMany({
      where: {
        userId,
        dates: dateRange,
      },
      select: {
        status: true,
        dates: true,
        fine: true,
      },
    });

    // Group records by status using reduce
    const groupedResults = result.reduce(
      (acc, record) => {
        switch (record.status) {
          case AttendanceStatus.LATE:
            acc.dataLate.push(record);
            break;
          case AttendanceStatus.NO_CLOCK_IN:
            acc.notClockIn.push(record);
            break;
          case AttendanceStatus.NO_CLOCK_OUT:
            acc.notClockOut.push(record);
            break;
          case AttendanceStatus.ABSENT:
            acc.dataAbsent.push(record);
            break;
        }
        return acc;
      },
      {
        dataLate: [] as AttendRecord[],
        notClockIn: [] as AttendRecord[],
        notClockOut: [] as AttendRecord[],
        dataAbsent: [] as AttendRecord[],
      },
    );

    // Calculate additional statistics
    const totalDays = date.daysInMonth();
    const totalAttendanceDays = result.length;
    const totalFine = result.reduce(
      (sum, record) => sum + (record.fine || 0),
      0,
    );
    const attendanceRate = (totalAttendanceDays / totalDays) * 100;

    return {
      ...groupedResults,
      totalFine,
      totalDays,
      attendanceRate: Number(attendanceRate.toFixed(2)),
    };
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw new Error("Failed to fetch attendance records");
  }
};

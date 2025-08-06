import dayjs from "dayjs";
import { db } from "./db";
import { fullLeaveTypes, leaveTypeToShortCode } from "@/types/leave";

type AttendanceResult = {
  dataAbsent: AttendRecord[];
  No_ClockIn_ClockOut: AttendRecord[];
  notClockOut: AttendRecord[];
  dataLate: AttendRecord[];
  dataLeave: AttendRecord[]
  totalFine: number;
  totalDays: number;
  attendanceRate: number;
};

// Define type for the attendance record
type AttendRecord = {
  status: string;
  dates: Date;
  fine: number | null;
  fine2: number | null;
  leaves: {
    type: string;
  } | null;
};

// Define attendance status enum for type safety
enum AttendanceStatus {
  LATE = "Late",
  No_ClockIn_ClockOut = "No_ClockIn_ClockOut",
  ABSENT = "Absent",
  No_clockIn_ClockOut_Late = "No_clockIn_ClockOut_Late",
  Half_Day = "Half_Day",
  Leave = 'Leave'
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
        fine2: true,
        leaves: {
          select: {
            type: true
          }
        }
      },
    });

    // Group records by status using reduce
    const groupedResults = result.reduce(
      (acc, record) => {
        switch (record.status) {
          case AttendanceStatus.LATE:
            acc.dataLate.push(record);
            break;
          case AttendanceStatus.No_ClockIn_ClockOut:
            acc.No_ClockIn_ClockOut.push(record);
            break;
          case AttendanceStatus.No_clockIn_ClockOut_Late:
            acc.No_ClockIn_ClockOut.push(record);
            acc.dataLate.push(record);

            break;
          case AttendanceStatus.Half_Day:
            if (record.fine) {
              acc.dataLate.push(record)
            } else if (record.fine2) {
              acc.No_ClockIn_ClockOut.push(record)
            }
            break
          case AttendanceStatus.ABSENT:
            acc.dataAbsent.push(record);
            break;
          case AttendanceStatus.Leave:
            const r = getListLeave(record)
            acc.dataLeave.push(r);
            break;
        }
        return acc;
      },
      {
        dataLate: [] as AttendRecord[],
        No_ClockIn_ClockOut: [] as AttendRecord[],
        notClockOut: [] as AttendRecord[],
        dataAbsent: [] as AttendRecord[],
        dataLeave: [] as AttendRecord[]
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
const getListLeave = (record: AttendRecord) => {
  if (record.leaves?.type) {
    const name = shortName(record.leaves.type);
    record.leaves.type = name ?? record.leaves.type; // fallback to original if shortName returns undefined
  }
  return record;
};



// Your shortName function
const shortName = (name: string): string | undefined => {
  return leaveTypeToShortCode[name];
};
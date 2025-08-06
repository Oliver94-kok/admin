import { AttendStatus } from "@prisma/client";

// Define the AttendBranch interface
interface AttendBranch {
  team: string;
  branch: string | null;
  clockIn: string | null;
  clockOut: string | null;
}

// Define interfaces for the nested result data
export interface AttendRecord {
  status: string;
  dates: Date; // ISO date string
  fine: number | null;
  fine2: number | null;
  leaves: {
    type: string;
  } | null;
}

export interface AttendanceResult {
  dataLate: AttendRecord[];
  No_ClockIn_ClockOut: AttendRecord[];
  dataAbsent: AttendRecord[];
  dataLeave: AttendRecord[]
  totalFine: number;
  totalDays: number;
  attendanceRate: number;
}

// Update User interface with correct structure
interface User {
  name: string;
  AttendBranch: AttendBranch | null;
}

// Define the salary interface
export interface Salary {
  id: string;
  month: number;
  year: number;
  workingDay: number | null;
  workingHoour: number | null;
  fineLate: number | null;
  fineNoClockIn: number | null;
  fineNoClockOut: number | null;
  late: number | null;
  notClockIn: number | null;
  overTimeHour: number | null;
  overTime: number | null;
  total: number | null;
  perDay: number | null;
  bonus: number | null;
  allowance: number | null;
  cover: number | null;
  userId: string;
  users: User | null;
  advances: number | null;
  transport: number | null;
  short: number | null;
  m: number | null;
  absent: number | null;
}

// Define the main interface that combines both
export interface SalaryRecord {
  salary: Salary;
  result: AttendanceResult;
}

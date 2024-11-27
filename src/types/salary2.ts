import { AttendStatus } from "@prisma/client";

// Define the AttendBranch interface
interface AttendBranch {
  team: string;
}

// Define interfaces for the nested result data
interface AttendRecord {
  status: string;
  dates: Date; // ISO date string
  fine: number | null;
}

export interface AttendanceResult {
  dataLate: AttendRecord[];
  No_ClockIn_ClockOut: AttendRecord[];
  dataAbsent: AttendRecord[];
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
interface Salary {
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
}

// Define the main interface that combines both
export interface SalaryRecord {
  salary: Salary;
  result: AttendanceResult;
}

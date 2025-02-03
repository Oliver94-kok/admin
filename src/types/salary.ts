export interface SalaryUser {
  id: string;
  month: number;
  year: number;
  workingDay: number | null;
  fineLate: number | null;
  fineNoClockIn: number | null;
  fineNoClockOut: number | null;
  late: number | null;
  overTimeHour: number | null;
  overTime: number | null;
  bonus: number | null;
  allowance: number | null;
  advance: number | null;
  short: number | null;
  transport: number | null;
  m: number | null;
  total: number | null;
  perDay: number | null;
  users: { name: string; username: string; userImg: string | null,AttendBranch: {
    team: string;
} | null; } | null;
}

export interface userInvoice {
  id: string;
  month: number;
  year: number;
  workingDay: number | null;
  fine: number | null;
  late: number | null;
  overTimeHour: number | null;
  overTime: number | null;
  bonus: number | null;
  allowance: number | null;
  advance: number | null;
  short: number | null;
  transport: number | null;
  m: number | null;
  total: number | null;
  perDay: number | null;
  userId: string;
  users: { name: string; username: string } | null;
}

export interface SalaryDay {
  id: number;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  late: number | null;
  noClockin: number | null;
  fine: number | null;
  absent: number | null;
  leave: number | null;
}

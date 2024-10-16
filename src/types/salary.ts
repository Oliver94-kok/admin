export interface SalaryUser {
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
  cover: number | null;
  total: number | null;
  perDay: number | null;
  users: { name: string; username: string; userImg: string | null } | null;
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
  cover: number | null;
  total: number | null;
  perDay: number | null;
  userId: string;
  users: { name: string; username: string } | null;
}

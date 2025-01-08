import { db } from "@/lib/db";
import {
  calculateOvertimeHours,
  calculateWorkingHours,
  checkClockLate,
} from "./attend";
import { AttendStatus, Prisma } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { TimeUtils } from "@/lib/timeUtility";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
export const getSalaryByUserId = async (userId: string) => {
  try {
    let salary = await db.salary.findFirst({
      where: {
        userId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    });
    return salary;
  } catch (error) {
    return null;
  }
};
export const getSalaryById = async (id: string) => {
  try {
    let salary = await db.salary.findFirst({ where: { id } });
    return salary;
  } catch (error) {
    return null;
  }
};
export const createSalary = async (
  userId: string,
  late: number,
  overtime?: number,
  fine?: number,
) => {
  let data = {
    userId,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    workingDay: 1,
    late,
    overTimeHour: overtime!,
    fine,
  };
  try {
    await db.salary.create({ data });
    return { success: "successs" };
  } catch (error) {
    return null;
  }
};
const updateSalary = async (
  id: string,
  fine: number,
  overTimeHour: number,
  day: number,
) => {
  try {
    await db.salary.update({
      where: { id },
      data: { workingDay: day, overTimeHour, late: fine },
    });
    return { success: "success update" };
  } catch (error) {
    return { error: "error" };
  }
};
interface CheckSalaryProp {
  userId: string;
  fineLate: number | null;
  fineNoClockIn: number | null;
  fineNoClockOut: number | null;
  overtime: number | null;
  workingHour: number | null;
}
export const CheckSalarys = async ({
  userId,
  fineLate,
  fineNoClockIn,
  fineNoClockOut,
  overtime,
  workingHour,
}: CheckSalaryProp) => {
  let salary = await getSalaryByUserId(userId);
  if (salary) {
    let newWorkingDay = salary.workingDay! + 1;
    console.log("🚀 ~ newWorkingDay:", newWorkingDay);
    let newOverTime = salary.overTimeHour! + overtime!;
    var data;
    if (fineLate) {
      var newFineLAte = salary.fineLate! + fineLate;
      data = {
        fineLate: newFineLAte,
        workingDay: newWorkingDay,
        overTimeHour: newOverTime,
      };
      await db.salary.update({ where: { id: salary.id }, data });
      return;
    }
    if (fineNoClockIn) {
      var newfineNoClockIn = salary.fineNoClockIn! + fineNoClockIn;
      data = {
        fineNoClockIn: newfineNoClockIn,
        workingDay: newWorkingDay,
        overTimeHour: newOverTime,
      };
      await db.salary.update({ where: { id: salary.id }, data });
      return;
    }
    if (fineNoClockOut) {
      var newfineNoClockOut = salary.fineNoClockOut! + fineNoClockOut;
      data = {
        fineNoClockOut: newfineNoClockOut,
        workingDay: newWorkingDay,
        overTimeHour: newOverTime,
      };
      await db.salary.update({ where: { id: salary.id }, data });
      return;
    }
    data = {
      workingDay: newWorkingDay,
      overTimeHour: newOverTime,
    };
    await db.salary.update({ where: { id: salary.id }, data });
    return;
  }
};

export const getAttendLate = async (
  userId: string,
  month: number,
  year: number,
) => {
  try {
    const startDate = dayjs()
      .year(year)
      .month(month - 1)
      .startOf("month");

    const endDate = dayjs()
      .year(year)
      .month(month - 1)
      .endOf("month");

    let salary = await db.attends.findMany({
      where: {
        userId,
        dates: {
          gte: new Date(startDate.format("YYYY-MM-DD")),
          lte: new Date(endDate.format("YYYY-MM-DD")),
        },
      },
    });
    let noClockIn = salary.filter((item) => item.status == "Late").length;
    console.log("🚀 ~ noClockIn:", noClockIn);
    if (noClockIn < 1) {
      return 50;
    } else {
      return 100;
    }
  } catch (error) {
    return null;
  }
};

export const getNoClockIn = async (
  userId: string,
  month: number,
  year: number,
) => {
  try {
    const startDate = dayjs()
      .year(year)
      .month(month - 1)
      .startOf("month");

    const endDate = dayjs()
      .year(year)
      .month(month - 1)
      .endOf("month");

    let salary = await db.attends.findMany({
      where: {
        userId,
        dates: {
          gte: new Date(startDate.format("YYYY-MM-DD")),
          lte: new Date(endDate.format("YYYY-MM-DD")),
        },
      },
    });
    let noClockIn = salary.filter(
      (item) => item.status == "No_ClockIn_ClockOut",
    ).length;
    console.log("🚀 ~ noClockIn:", noClockIn);
    if (noClockIn < 1) {
      return 50;
    } else {
      return 100;
    }
  } catch (error) {
    return null;
  }
};
export const getNoClockOut = async (
  userId: string,
  month: number,
  year: number,
) => {
  try {
    const startDate = dayjs()
      .year(year)
      .month(month - 1)
      .startOf("month")
      .toDate();
    const endDate = dayjs()
      .year(year)
      .month(month - 1)
      .endOf("month")
      .toDate();
    let salary = await db.attends.findMany({
      where: {
        userId,
        OR: [
          {
            clockIn: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            clockOut: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
    });
    let noClockIn = salary.filter(
      (item) => item.status == "No_ClockIn_ClockOut",
    ).length;
    console.log("🚀 ~ noClockIn:", noClockIn);
    if (noClockIn < 1) {
      return 50;
    } else {
      return 100;
    }
  } catch (error) {
    return null;
  }
};
export const getAllresultAttend = async (
  userId: string,
  month: number,
  year: number,
) => {
  const firstDay = dayjs()
    .year(year)
    .month(month - 1)
    .startOf("month");
  const lastDay = dayjs()
    .year(year)
    .month(month - 1)
    .endOf("month");
  let result = await db.attends.findMany({
    where: { userId, dates: { gte: firstDay.toDate(), lte: lastDay.toDate() } },
    select: { status: true, dates: true, fine: true },
  });
  let dataLate = result.filter((e) => e.status == "Late");
  let notClockIn = result.filter((e) => e.status == "No_ClockIn_ClockOut");
  let notClockOut = result.filter((e) => e.status == "No_ClockIn_ClockOut");
  let dataAbsent = result.filter((e) => e.status == "Absent");
  return { dataAbsent, notClockIn, notClockOut, dataLate };
};
const checkLate = async () => {};
export const calculateSalary = async (team: "A" | "B" | "C" | "D") => {
  try {
    const users = await db.user.findMany({ where: { AttendBranch: { team } } });
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          let attends = await db.attends.findMany({
            where: {
              userId: user.id,
              dates: {
                gte: new Date("2025-01-01"),
                lte: new Date("2025-01-31"),
              },
            },
          });
          let shift = await db.attendBranch.findFirst({
            where: { userId: user.id },
          });
          if (!shift?.clockIn || !shift?.clockOut) {
            throw new Error(`No shift found for user ${user.id}`);
          }

          let totalDAy = dayjs().subtract(1, "days").format("D");
          let x = 1;
          let total_fine = 0;
          attends.map(async (attend) => {
            const shiftIn = TimeUtils.createDateFromTimeString(
              attend.dates,
              shift.clockIn!,
              "in",
            );
            const shiftOut = TimeUtils.createDateFromTimeString(
              attend.dates,
              shift.clockOut!,
              "out",
            );
            let inattend = dayjs(attend.clockIn);
            let outattend = dayjs(attend.clockOut);
            let dates = dayjs(attend.dates);
            let same = dates.isSame("2025-01-01");
            let lateClockIN;
            if (attend.clockIn) {
              let ss = dayjs(shiftIn).add(10, "minute");
              lateClockIN = inattend.isAfter(ss);
            }
            let fine = 0;
            if (same) {
              if (lateClockIN) {
                fine = 50;
                total_fine = fine + total_fine;
              }
              if (attend.clockOut) {
                let overtime = await calculateOvertimeHours(
                  shiftOut,
                  attend.clockOut,
                );
                let workingHour = await calculateWorkingHours(
                  attend.clockIn,
                  attend.clockOut,
                );
                await db.attends.update({
                  where: { id: attend.id },
                  data: {
                    fine,
                    overtime,
                    workingHour,
                    status: lateClockIN
                      ? AttendStatus.Late
                      : AttendStatus.Full_Attend,
                  },
                });
              }
            } else {
              if (lateClockIN) {
                let check = total_fine == 50 ? 50 : 100;
                total_fine = check + total_fine;
                fine = check;
              }
              if (attend.clockOut) {
                let overtime = await calculateOvertimeHours(
                  shiftOut,
                  attend.clockOut,
                );
                let workingHour = await calculateWorkingHours(
                  attend.clockIn,
                  attend.clockOut,
                );
                await db.attends.update({
                  where: { id: attend.id },
                  data: {
                    fine,
                    overtime,
                    workingHour,
                    status: lateClockIN
                      ? AttendStatus.Late
                      : AttendStatus.Full_Attend,
                  },
                });
              } else {
              }
            }
          });
          let salary = await db.salary.findFirst({
            where: { userId: user.id, month: 1, year: 2025 },
          });
          await db.salary.update({
            where: { id: salary?.id },
            data: { workingDay: attends.length },
          });
          return {
            userId: user.id,
            type: "Done",
            totalDAy,
            daywork: attends.length,
            f: new Date("2025-01-01"),
            l: new Date("2025-01-31"),
          };
        } catch (error) {
          return {
            userId: user.id,
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            created: false,
          };
        }
      }),
    );
    const processedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          userId: "unknown",
          type: "error",
          error: result.reason,
          created: false,
        };
      }
    });
    const summary = {
      total: results.length,
      moreFour: {
        total: processedResults.filter((r) => r.type === "Not same").length,
        detail: processedResults.filter((r) => r.type === "Not same"),
      },
      lessfour: {
        total: processedResults.filter((r) => r.type === "Done").length,
        detail: processedResults.filter((r) => r.type === "Done"),
      },
    };
    return summary;
  } catch (error) {
    return error;
  }
};

import { db } from "@/lib/db";
import { checkClockLate } from "./attend";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

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

// export const checkSalary = async (
//   userId: string,
//   fine: number,
//   fine2: number,
//   days: any,
//   overTimeHour: number,
//   workingHour?: number,
// ) => {
//   let salary = await getSalaryByUserId(userId);
//   if (salary) {
//     let late = 0;
//     let dbfine = 0;
//     if (fine) {
//       late = salary.late! + 1;
//       dbfine = salary.fine! + fine;
//     }
//     let dbfine2 = 0;
//     let notClockIn = 0;
//     if (fine2) {
//       dbfine2 = salary.fine2! + fine2;
//       notClockIn = salary.notClockIn! + 1;
//     }
//     const currentArray = Array.isArray(salary?.day) ? salary?.day : [];
//     const updatedArray = [...currentArray, days];
//     let sortArray = updatedArray.sort((a, b) => a.id - b.id);
//     let day = salary.workingDay! + 1;
//     let ot = salary.overTimeHour! + overTimeHour;
//     let workingHoour = salary.workingHoour! + workingHour!;
//     let data = {
//       fine: dbfine,
//       fine2: dbfine2,
//       workingDay: day,
//       overTimeHour: ot,
//       workingHoour,
//       notClockIn,
//       late,
//       day: sortArray,
//     };

//     await db.salary.update({
//       where: {
//         id: salary.id,
//       },
//       data,
//     });
//   }

//   // let result = await createSalary(userId, 1, overTimeHour, fine);
//   // return result;
// };

export const getAttendLate = async (
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
    let noClockIn = salary.filter((item) => item.status == "Late").length;
    console.log("🚀 ~ noClockIn:", noClockIn)
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
    let noClockIn = salary.filter((item) => item.status == "No_ClockIn").length;
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
      (item) => item.status == "No_ClockOut",
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
  let notClockIn = result.filter((e) => e.status == "No_ClockIn");
  let notClockOut = result.filter((e) => e.status == "No_ClockOut");
  let dataAbsent = result.filter((e) => e.status == "Absent");
  return { dataAbsent, notClockIn, notClockOut, dataLate };
};

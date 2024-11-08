import { db } from "@/lib/db";
import { checkClockLate } from "./attend";
import { Prisma } from "@prisma/client";

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

export const checkSalary = async (
  userId: string,
  fine: number,
  fine2: number,
  days: any,
  overTimeHour: number,
  workingHour?: number,
) => {
  let salary = await getSalaryByUserId(userId);
  if (salary) {
    let late = 0;
    let dbfine = 0;
    if (fine) {
      late = salary.late! + 1;
      dbfine = salary.fine! + fine;
    }
    let dbfine2 = 0;
    let notClockIn = 0;
    if (fine2) {
      dbfine2 = salary.fine2! + fine2;
      notClockIn = salary.notClockIn! + 1;
    }
    const currentArray = Array.isArray(salary?.day) ? salary?.day : [];
    const updatedArray = [...currentArray, days];
    let sortArray = updatedArray.sort((a, b) => a.id - b.id);
    let day = salary.workingDay! + 1;
    let ot = salary.overTimeHour! + overTimeHour;
    let workingHoour = salary.workingHoour! + workingHour!;
    let data = {
      fine: dbfine,
      fine2: dbfine2,
      workingDay: day,
      overTimeHour: ot,
      workingHoour,
      notClockIn,
      late,
      day: sortArray,
    };

    await db.salary.update({
      where: {
        id: salary.id,
      },
      data,
    });
  }

  // let result = await createSalary(userId, 1, overTimeHour, fine);
  // return result;
};

export const getSalaryLate = async (userId: string) => {
  try {
    let salary = await db.salary.findFirst({
      where: {
        userId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    });

    if (salary?.late! > 1) {
      return 100;
    } else {
      return 50;
    }
  } catch (error) {
    return null;
  }
};
export const getSalaryLate2 = async (userId: string) => {
  try {
    let salary = await db.salary.findFirst({
      where: {
        userId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    });

    if (salary) {
      if (salary?.notClockIn! > 1) {
        return 100;
      } else {
        return 50;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

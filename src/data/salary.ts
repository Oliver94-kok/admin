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
  overTimeHour: number,
) => {
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();
  let salary = await getSalaryByUserId(userId);

  if (salary) {
    let late = 0;
    if (fine) {
      late = salary.late! + fine;
    }
    let day = salary.workingDay + 1;
    let ot = salary.overTimeHour! + overTimeHour;
    let salaryUpdate = await updateSalary(salary.id, late, ot, day);
    return salaryUpdate;
  }
  let result = await createSalary(userId, 1, overTimeHour, fine);
  return result;
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
    return salary?.late;
  } catch (error) {
    return null;
  }
};

"use server";
import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";
import { DateTime } from "luxon";
import { createSalary, getSalaryByUserId } from "./salary";
interface dataAttend {
  create?: AttendsInterface;
  userId?: string;
}

export const checkClockIn = async (userId: string) => {
  let a: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM Attends WHERE userId=${userId} AND date(clockIn) = CURDATE()`;
  if (Array.isArray(a)) {
    const firstRow = a[0];
    const jsonResult = firstRow;
    return jsonResult;
  } else {
    const jsonResult = a;
    return jsonResult;
  }
};

export const checkClockLate = async (userid: string) => {
  let a: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM Attends WHERE userId=${userid} AND date(clockIn) = CURDATE()`;
  let checkLate = a[0];
  let hours = checkLate.clockIn.getHours();
  let minutes = checkLate.clockIn.getMinutes();
  let late;
  if (hours == 9) {
    if (minutes > 10) {
      late = 1;
    }
  } else if (hours > 9) {
    late = 1;
  } else {
    late = 0;
  }
  let year = checkLate.clockIn.getFullYear();
  let month = checkLate.clockIn.getMonth() + 1;
  let day = checkLate.clockIn.getDate();
  return { late, year, month, day };
};

export const getDataByDate = async (tarikh: string) => {
  let day = tarikh.split("/");
  let year = new Date().getFullYear();
  let d = `${year}-${day[1]}-${day[0]}`;

  let data: AttendsInterface[] =
    await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour
    FROM Attends AS a
    JOIN User AS u ON a.userId = u.id
    WHERE date(a.clockIn) = date(${d}) OR date(a.clockOut) = date(${d})`;
  console.log(d);
  console.log(data);
  return data;
};
export const createNotClockIn = async (
  userId: string,
  clockOut: Date,
  overtime: number,
) => {
  try {
    let fine = 0;
    let salary = await getSalaryByUserId(userId);
    if (salary) {
      if (salary?.late! >= 1) {
        fine = 100;
      } else {
        fine = 50;
      }
      var ot = salary?.overTimeHour! + overtime;
      var wd = salary?.workingDay! + 1;
      var late = salary?.late! + 1;
      await db.salary.update({
        where: { id: salary?.id },
        data: { overTimeHour: ot, workingDay: wd, late },
      });
    }

    await createSalary(userId, 1, overtime);
    let dataAttend = {
      userId,
      fine,
      clockOut,
      overtime,
    };
    console.log("🚀 ~ dataAttend:", dataAttend);
    await db.attends.create({
      data: { userId, fine, clockOut, overtime },
    });

    return { success: "success" };
  } catch (error) {
    console.log("🚀 ~ error:", error);
    return null;
  }
};

export const calOverTime = async (userId: string, clockOut: string) => {
  let user = await db.attendBranch.findFirst({ where: { userId } });
  if (user) {
    // let c = clockOut.toISOString();
    var start = DateTime.fromISO(clockOut);
    console.log("🚀 ~ calOverTime ~ start:", start);

    var end = DateTime.fromISO(user.clockOut!);
    console.log("🚀 ~ calOverTime ~ end:", end);
    var hour = start.diff(end, ["hours", "minutes", "seconds"]);
    var min = hour.minutes;
    return hour.as("minute").toFixed();
  }
};

export const lateClockIn = async (userId: string, clockIn: string) => {
  let user = await db.attendBranch.findFirst({ where: { userId } });
  if (user) {
    var start = DateTime.fromISO(clockIn);
    var time = DateTime.fromISO(user.clockIn!);
    var result = start.diff(time, ["hours", "minutes", "seconds"]);
    let min = result.as("minutes");
    let minute = result.toObject().minutes;

    if (min <= 0) return 0;
    if (minute! <= 10) return 0;

    return 1;
  }
  return null;
};

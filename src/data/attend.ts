"use server";
import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";
import { DateTime } from "luxon";
import { createSalary, getSalaryByUserId } from "./salary";
import { AttendStatus } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Enable required dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

export const checkClockIn = async (userId: string) => {
  console.log("🚀 ~ checkClockIn ~ userId:", userId);

  let user = await db.attends.findFirst({
    where: { userId, status: "Active" },
  });
  return user;
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
    WHERE (date(a.clockIn) = date(${d}) OR date(a.clockOut) = date(${d}))`;
  console.log(d);
  console.log(data);
  return data;
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
    console.log(hour);
    var min = hour.minutes;
    return hour.as("minute").toFixed();
  }
};
export const calOverTime2 = async (userId: string, clockOut: string) => {
  console.log("🚀 ~ calOverTime2 ~ clockOut:", clockOut);
  const formattedTimestamp = clockOut.replace(" ", "T");
  let user = await db.attendBranch.findFirst({ where: { userId } });
  if (user) {
    var start = DateTime.fromISO(formattedTimestamp);
    console.log("🚀 ~ calOverTime ~ start:", start);

    var end = DateTime.fromISO(user.clockOut!).set({
      year: start.year,
      month: start.month,
      day: start.day,
    });

    console.log("🚀 ~ calOverTime ~ end:", end);

    var hour = start.diff(end, ["hours", "minutes", "seconds"]);
    console.log("hour sd ", hour);
    var min = hour.minutes;
    var checkNegative = hour.as("minute").toFixed();
    if (Number(checkNegative) < 0) {
      return 0;
    }
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

export const leaveForgetClockAttend = async (dates: string, userId: string) => {
  console.log("🚀 ~ leaveForgetClockAttend ~ userId:", userId);
  const date = new Date(
    Date.parse(dates.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")),
  );
  console.log("🚀 ~ leaveForgetClockAttend ~ date:", date);
  const formattedDate = date.toISOString().split("T")[0];
  let user = await db.attends.findFirst({
    where: { userId, dates: { equals: date } },
  });
  console.log("🚀 ~ leaveForgetClockAttend ~ user:", user);
  if (user) {
    let data = {
      clockIn: null,
      clockOut: null,
      workingHour: null,
      locationIn: null,
      locationOut: "Address not available",
      overtime: null,
      fine: null,
      status: AttendStatus.Leave,
    };
    await db.attends.update({ where: { id: user.id }, data });
    return user;
  }
  let data = {
    dates: date,
    status: AttendStatus.Leave,
  };
  let attend = await db.attends.create({ data });
  return attend;
};

export const deliveryClockAttend = async (dates: string, userId: string) => {
  const date = new Date(
    Date.parse(dates.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")),
  );
  let user = await db.attends.findFirst({
    where: { userId, dates: { equals: date } },
  });
  if (!user) {
    let data = {
      userId,
      dates: date,
      status: AttendStatus.Active,
    };
    let result = await db.attends.create({ data });
    return result;
  }
  let data = {
    status: AttendStatus.Active,
    fine: null,
  };
  let result = await db.attends.update({ where: { id: user.id }, data });
  return result;
};

export const cronAttend = async (date: string) => {
  let dates = new Date(date);
  let resutl = await db.attends.findMany({
    where: { dates: { equals: dates } },
  });
  return resutl;
};
export const cronAttendCheckShift = async (shiftIn: Date, shiftOut: Date) => {
  const baseMoment = dayjs();
  const inShift = dayjs(shiftIn);
  const outShift = dayjs(shiftOut).add(4, "hour");
  if (baseMoment.isBefore(inShift)) {
    return { result: "can clock in" };
  }
  if (baseMoment.isBefore(outShift)) {
    return { result: "can clock out" };
  }
  return { result: "absent" };
};

export async function getLastThreeMonthsData(userId: string) {
  const currentDate = dayjs();
  const startDate = currentDate.subtract(2, "month").startOf("month").toDate();
  const endDate = currentDate.endOf("month").toDate();

  const monthsData = await Promise.all(
    [0, 1, 2].map(async (monthsAgo) => {
      const date = currentDate.subtract(monthsAgo, "month");
      const startOfMonth = date.startOf("month").toDate();
      const endOfMonth = date.endOf("month").toDate();

      const [attendanceData, counts] = await Promise.all([
        db.attends.findMany({
          where: {
            userId,
            dates: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            id: true,
            clockIn: true,
            clockOut: true,
            status: true,
            dates: true,
          },
          orderBy: {
            dates: "desc",
          },
        }),
        db.attends.groupBy({
          by: ["status"],
          where: {
            userId,
            dates: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            status: {
              in: ["Full_Attend", "Absent", "Leave"],
            },
          },
          _count: true,
        }),
      ]);

      return {
        month: date.format("MM"),
        data: attendanceData,
        stats: {
          fullAttend:
            counts.find((c) => c.status === "Full_Attend")?._count ?? 0,
          absent: counts.find((c) => c.status === "Absent")?._count ?? 0,
          leave: counts.find((c) => c.status === "Leave")?._count ?? 0,
        },
      };
    }),
  );

  return monthsData;
}

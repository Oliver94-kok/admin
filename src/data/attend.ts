"use server";
import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";

interface dataAttend {
  create?: AttendsInterface;
  userId?: string;
}

export const createAttend = async ({ create }: dataAttend) => {
  let data = {
    userId: create?.userId,
    clockIn: null,
    clockOut: create?.clockOut,
  };

  let d = await db.attends.create({ data });
  return d;
};

export const checkClockIn = async (userId: string) => {
  let a: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM attends WHERE userId=${userId} AND date(clockIn) = CURDATE()`;
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
    await db.$queryRaw`SELECT * FROM attends WHERE userId=${userid} AND date(clockIn) = CURDATE()`;
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
    FROM attends AS a
    JOIN user AS u ON a.userId = u.id
    WHERE date(a.clockIn) = date(${d}) OR date(a.clockOut) = date(${d})`;
  console.log(d);
  console.log(data);
  return data;
};

import { db } from "@/lib/db";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DateTime } from "luxon";

// Enable the plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = "Asia/Kuala_Lumpur";
export async function forEachDate(
  startDate: string,
  endDate: string,
  callback: (date: Date) => void,
  format: string = "DD-MM-YYYY",
) {
  let currentDate = dayjs(startDate, format).tz(TIMEZONE).startOf("day");
  const lastDate = dayjs(endDate, format).tz(TIMEZONE).startOf("day");

  while (currentDate.isSameOrBefore(lastDate)) {
    callback(currentDate.toDate());
    currentDate = currentDate.add(1, "day");
  }
}

export const addLeaveAttend = async (userId: string, date: string) => {
  const time2 = new Date(date);
  let checkAttend = await db.attends.findFirst({
    where: { userId, dates: { equals: time2 } },
  });
  if (checkAttend) {
    await db.attends.update({
      where: { id: checkAttend.id },
      data: { status: AttendStatus.Leave, fine: 0 },
    });
    return;
  }
  let data = {
    status: AttendStatus.Leave,
    userId,
    dates: time2,
  };
  await db.attends.create({ data });
  return;
};

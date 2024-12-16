"use server";

import { db } from "@/lib/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDataUser = async (
  year: number,
  month: number,
  team: string,
) => {
  try {
    const firstDay = dayjs(`${year}-${month}-01`);
    const lastDay = firstDay.endOf("month");
    let users = await db.attendBranch.findMany({
      where: { team },
      select: { userId: true },
    });

    let result = await Promise.all(
      users.map(async (u) => {
        const userDetail = await db.user.findFirst({
          where: { id: u.userId },
          include: { AttendBranch: { select: { branch: true } } },
        });
        const attends = await db.attends.findMany({
          where: {
            userId: u.userId,
            dates: { gte: firstDay.toDate(), lte: lastDay.toDate() },
          },
          select: {
            clockIn: true,
            clockOut: true,
            dates: true,
          },
        });
        const localizedAttends = attends.map((attend) => ({
          ...attend,
          // Assuming you want to convert to the system's local timezone
          clockIn: attend.clockIn
            ? dayjs.utc(attend.clockIn).local().format("h:mm A")
            : null,
          clockOut: attend.clockOut
            ? dayjs.utc(attend.clockOut).local().format("h:mm A")
            : null,
          dates: dayjs(attend.dates).format("YYYY-MM-DD"),
          // If you want to specify a specific timezone (e.g., 'Asia/Jakarta')
          // clockIn: attend.clockIn ? dayjs.utc(attend.clockIn).tz('Asia/Jakarta').toDate() : null
        }));

        return {
          name: userDetail?.name,
          branch: userDetail?.AttendBranch?.branch,
          attend: localizedAttends,
        };
      }),
    );
    return result;
  } catch (error) {
    return null;
  }
};

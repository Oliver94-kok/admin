import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getLastThreeMonthsData } from "@/data/attend";

// Enable dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  const month = searchParams.get("month");
  const currentDate = dayjs();

  if (userId) {
    if (Number(month) == 3) {
      var result = await getLastThreeMonthsData(userId);

      return Response.json({ result }, { status: 200 });
    }
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();
    var user = await db.attends.findMany({
      where: { userId: userId!, dates: { gte: startOfMonth, lte: endOfMonth } },
      select: {
        id: true,
        clockIn: true,
        clockOut: true,
        status: true,
        dates: true,
      },
    });
    console.log(user);
    return NextResponse.json(user);
  }

  return NextResponse.json(userId);
};

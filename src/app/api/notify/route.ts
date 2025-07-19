import { db } from "@/lib/db";
import { $Enums } from "@prisma/client";
import dayjs from "dayjs";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const type = searchParams.get("type");
    if (!userId || !type) {
      return Response.json({ error: "Missing userId or type" }, { status: 400 });
    }
    if (type == "leave") {
      const leaves = await db.leave.findMany({
        where: {
          userId
        }
      })
      const leave = leaves.map((l) => {
        return {
          id: l.id,
          startDate: l.startDate,
          endDate: l.endDate,
          type: l.type,
          status: l.status,
          smallDate: dayjs(l.createdAt).format("DD/MM HH:mm"),
          create: dayjs(l.createdAt).format("YYYY-MM-DD HH:mm:ss")
        }
      })
      return Response.json({ user: { leave } }, { status: 200 })
    }
    const attends = await db.attends.findMany({
      where: {
        userId,
        dates: { gte: DateTime.now().startOf('month').toJSDate(), lte: DateTime.now().endOf('month').toJSDate() }

      }
    })
    const shift = await db.attendBranch.findFirst({ where: { userId } })
    let clockdata: { id: string; date: string; time: string; shiftTime: string | null | undefined; status: $Enums.AttendStatus; smallDate: string; clockInLocation: string | null; }[] = []
    attends.map((a) => {
      if (a.clockIn != null) {
        let d = {
          id: a.id,
          date: dayjs(a.dates).format("DD/MM"),
          time: dayjs(a.clockIn).format("HH/mm"),
          shiftTime: shift?.clockIn,
          type: "Clock In",
          status: a.status,
          smallDate: dayjs(a.createdAt).format("DD/MM HH:mm"),
          clockInLocation: a.locationIn
        }
        clockdata.push(d);
      }
      if (a.clockOut != null) {
        let d = {
          id: a.id,
          date: dayjs(a.dates).format("DD/MM"),
          time: dayjs(a.clockOut).format("HH/mm"),
          shiftTime: shift?.clockOut,
          type: "Clock out",
          status: a.status,
          smallDate: dayjs(a.createdAt).format("DD/MM HH:mm"),
          clockInLocation: a.locationOut
        }
        clockdata.push(d);
      }

    })

    return Response.json({ user: { clock: clockdata } }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  const { userId } = await req.json();
  let notify = await db.notificationUser.findFirst({
    where: { userId },
  });
  const currentArray = Array.isArray(notify?.leave) ? notify?.leave : [];
  // return notify?.leave;
  return Response.json({ data: notify?.leave }, { status: 201 });
};

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/function";
import { NextResponse } from "next/server";
const { DateTime } = require("luxon");
export const GET = async () => {
  let user = await db.leave.findMany({
    include: {
      users: {
        select: {
          name: true,
          username: true,
          userImg: true,
          AttendBranch: { select: { team: true } },
        },
      },
    },
  });
  return Response.json({ user }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, reason, type, startDate, endDate, status } = await req.json();
  let nstart = DateTime.fromISO(startDate);
  let nEnd = DateTime.fromISO(endDate);
  console.log("🚀 ~ POST ~ nstart:", nstart);
  let data = {
    userId,
    reason,
    type,
    startDate: nstart,
    endDate: nEnd,
    status,
  };
  let user = await db.leave.create({ data });
  return Response.json({ user }, { status: 201 });
};

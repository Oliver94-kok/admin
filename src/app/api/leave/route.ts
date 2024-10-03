import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { hashPassword, saveImageLeaveUser } from "@/lib/function";
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
  user.forEach((e) => {
    const startDate = DateTime.fromISO(e.startDate)
      .toLocal()
      .toFormat("yyyy-MM-dd HH:mm:ss");
    console.log("🚀 ~ user.forEach ~ startDate:", startDate);
    const endDate = DateTime.fromISO(e.endDate)
      .toLocal()
      .toFormat("yyyy-MM-dd HH:mm:ss");
    console.log("🚀 ~ user.forEach ~ endDate:", endDate);
  });
  return Response.json({ user }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, reason, type, startDate, endDate, status, imgs } =
    await req.json();
  console.log("🚀 ~ POST ~ startDate:", startDate);
  console.log("🚀 ~ POST ~ endDate:", endDate);
  const users = await getUserById(userId);
  let imgname = "";
  if (imgs) {
    imgname = await saveImageLeaveUser(imgs, users?.username!);
  }
  let data = {
    userId,
    reason,
    type,
    startDate,
    endDate,
    status,
    img: imgname,
  };
  let user = await db.leave.create({ data });
  return Response.json({ user }, { status: 201 });
};

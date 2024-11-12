import { checkUsername, getUserById } from "@/data/user";
import { db } from "@/lib/db";
import {
  countDaysBetween,
  extractDateAndDay,
  formatDateTime,
  formatDateTimeIntl,
  hashPassword,
  mergeArrays,
  postImage,
  sendtoAdmin,
} from "@/lib/function";
import { NextRequest, NextResponse } from "next/server";
const { DateTime } = require("luxon");
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  let user = await db.leave.findFirst({
    where: { userId: userId!, status: "Pending" },
  });
  if (user) {
    return Response.json({ result: user }, { status: 200 });
  }
  return Response.json({ result: "not have" }, { status: 400 });
};

export const POST = async (req: Request) => {
  const { userId, reason, type, startDate, endDate, status, imgs, notify } =
    await req.json();
  console.log("🚀 ~ POST ~ startDate:", notify);
  const users = await getUserById(userId);
  let imgname = "";
  if (imgs) {
    let result = await postImage(imgs, users?.username!, "leave");
    if (result?.error)
      return Response.json({ error: "Error upload image" }, { status: 400 });
    imgname = result?.success;
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
  let noti = await db.notificationUser.findFirst({
    where: { userId },
    select: { leave: true, id: true },
  });
  const currentArray = Array.isArray(noti?.leave) ? noti?.leave : [];
  const updatedArray = [...currentArray, notify];
  await db.notificationUser.update({
    where: { id: noti?.id },
    data: { leave: updatedArray },
  });
  await sendtoAdmin("Leave", `Has new request leave`);
  return Response.json({ id: user.id }, { status: 201 });
};

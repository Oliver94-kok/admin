import { checkUsername, getUserById } from "@/data/user";
import { db } from "@/lib/db";
import {
  formatDateTime,
  formatDateTimeIntl,
  hashPassword,
  postImage,
  saveImageLeaveUser,
  sendtoAdmin,
} from "@/lib/function";
import { NextResponse } from "next/server";
const { DateTime } = require("luxon");
export const GET = async () => {
  let checkuser = await checkUsername();
  let username = "";
  if (checkuser) {
    let lastest = parseInt(checkuser?.username.substring(5));
    console.log("🚀 ~ GET ~ lastest:", lastest);
    if (lastest < 9) {
      username = `user0${lastest + 1}`;
    } else {
      username = `user${lastest + 1}`;
    }
  }
  let u = await db.user.findMany({
    orderBy: { username: "desc" },
    where: { role: "USER" },
  });
  return Response.json({ username, u }, { status: 200 });
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

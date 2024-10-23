import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import {
  formatDateTime,
  formatDateTimeIntl,
  hashPassword,
  saveImageLeaveUser,
  sendtoAdmin,
} from "@/lib/function";
import { NextResponse } from "next/server";
const { DateTime } = require("luxon");
export const GET = async () => {
  // let randomid = uuidv7();
  // let smdate = await formatDateTime(new Date());
  const currentDates = new Date();
  const currentDate = DateTime.local(currentDates);
  const currentDateInAsia = currentDate.setZone("Asia/Kuala_Lumpur");
  const formattedDateInAsia = currentDateInAsia.toFormat("yyyy-MM-dd HH:mm:ss");
  let smdate = currentDateInAsia.toFormat("MM/dd HH:mm");
  let newnoti = {
    id: "randomid",
    type: "a.type",
    status: "a.status",
    endDate: "a.endDate",
    smallDate: smdate,
    startDate: " a.startDate",
    create: formattedDateInAsia,
  };

  return Response.json({ newnoti }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, reason, type, startDate, endDate, status, imgs, notify } =
    await req.json();
  console.log("🚀 ~ POST ~ startDate:", notify);
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

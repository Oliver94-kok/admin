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
  saveImageLeaveUser,
  sendtoAdmin,
  updateSalaryDays,
} from "@/lib/function";
import { NextResponse } from "next/server";
const { DateTime } = require("luxon");
export const GET = async () => {
  const startLeave = await extractDateAndDay("29-10-2024");
  const endLeave = await extractDateAndDay("31-10-2024");
  let totalleave =  countDaysBetween(startLeave.date, endLeave.date);
  let old = [{
    id:28,
   
          date:" startLeave.date",
          clockIn: null,
          clockOut: null,
          late: null,
          noClockin: null,
          fine: null,
          absent: 0,
          leave: 1,
  }]
  let newd = [];
  for(startLeave.day -1;startLeave.day<=endLeave.day;startLeave.day++){
    console.log("🚀 ~ GET ~ startLeave.day:", startLeave.day)
    let data = {
      id : startLeave.day,
      date:" startLeave",
          clockIn: null,
          clockOut: null,
          late: null,
          noClockin: null,
          fine: null,
          absent: 0,
          leave: 1,
    }
    newd.push(data);
  }
  const currentArray = Array.isArray(newd) ? newd : [];
  const updatedSalary = await mergeArrays( currentArray,newd);
  // const o =await updateSalaryDays(newd)
  return Response.json({ old,newd,updatedSalary }, { status: 200 });
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


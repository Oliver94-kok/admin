import { Logging } from "@/data/log";
import { checkUsername, getUserById } from "@/data/user";
import { db } from "@/lib/db";
import {
  postImage,
  sendtoAdmin,
} from "@/lib/function";
import { NextRequest, } from "next/server";
import dayjs from "dayjs";
import { leaveTypeMap } from "@/types/leave";

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
  // const requestBody = await req.json();
  const { userId, reason, type, startDate, endDate, status, imgs, totalDay, notify, } =
    await req.json();

  try {
    const users = await getUserById(userId);
    let imgname = "";
    if (imgs) {
      let result = await postImage(imgs, users?.username!, "leave");
      if (result?.error)
        throw new Error("Error upload image")
      imgname = result?.success;
    }
    let startTime;
    let endTime
    let startDateFormat = removeAmPm(startDate);
    let endDateFormat = removeAmPm(endDate);
    let newformatStartDate = formatToIsoDateTime(startDateFormat);
    let newformatEndDate = formatToIsoDateTime(endDateFormat);
    if (totalDay == null || totalDay == undefined) {

      startTime = dayjs(newformatStartDate, 'YYYY-MM-DD HH:mm', true);
      endTime = dayjs(newformatEndDate, 'YYYY-MM-DD HH:mm', true);
    } else {
      startTime = dayjs(newformatStartDate, 'YYYY-MM-DD HH:mm');
      endTime = dayjs(newformatEndDate, 'YYYY-MM-DD HH:mm');
    }
    console.log("🚀 ~ POST ~ startTime:", startTime)
    console.log("🚀 ~ POST ~ endTime:", endTime)
    let duration = endTime.diff(startTime, 'day') + 1;
    const englishType = leaveTypeMap[type] || "Unknown leave type";
    let data = {
      userId,
      reason,
      type:englishType,
      startDate: startTime.format("YYYY-MM-DD HH:mm"),
      endDate: endTime.format("YYYY-MM-DD HH:mm"),
      status,
      img: imgname,
      duration: totalDay ? totalDay : duration,
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
    await sendtoAdmin(
      "Leave",
      `Has new request leave by ${users?.name}`,
      users?.AttendBranch?.team!,
    );
    return Response.json({ id: user.id }, { status: 201 });
  } catch (error) {
    let err = error instanceof Error ? error.message : "An unknown error occurred"
    await Logging(userId, "Leave", err)
    return Response.json({
      Error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 400 })
  }


};
function removeAmPm(dateTimeStr: string): string {
  // Split into [date, time, period (AM/PM)]
  const [datePart, timePart, period] = dateTimeStr.split(/\s+/);

  if (!period) {
    // If no AM/PM exists, return as-is (assumes 24-hour format)
    return dateTimeStr;
  }

  let [hours, minutes] = timePart.split(':').map(Number);

  // Convert 12-hour to 24-hour format
  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0; // 12 AM → 00:00
  }

  // Pad hours with leading zero if needed (e.g., 7 → "07")
  const hours24 = hours.toString().padStart(2, '0');
  const time24 = `${hours24}:${minutes.toString().padStart(2, '0')}`;

  return `${datePart} ${time24}`;
}

function formatToIsoDateTime(input: string): string {
  const [datePart, timePart] = input.split(' ');
  const [day, month, year] = datePart.split('-');

  // Rebuild as YYYY-MM-DD HH:mm
  return `${year}-${month}-${day} ${timePart}`;
}
import { checkClockIn } from "@/data/attend";
import { AddSalary } from "@/data/salary";
import { db } from "@/lib/db";
import { checkWorkingHour, saveImage } from "@/lib/function";
import { AttendsInterface } from "@/types/attendents";
import { NextRequest } from "next/server";

export const GET = async (req: Request) => {
  let d = await AddSalary("cm177r63b00078s0twal5wswj");

  return Response.json({ d }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn, imgClockIn } = await req.json();
  let attendImg = await saveImage(imgClockIn);
  let data = {
    userId,
    clockIn,
    img: attendImg,
  };
  let t = await db.attends.create({ data });
  return Response.json({ t }, { status: 201 });
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut, id } = await req.json();
  let d = req.arrayBuffer();
  let attend = await checkClockIn(userId);
  if (!attend)
    return Response.json({ Error: "user not clock in" }, { status: 400 });
  let workingHour = await checkWorkingHour(attend.clockIn as Date, clockOut);
  let data = {
    clockOut,
    workingHour: workingHour,
  };
  let update = await db.attends.update({
    data,
    where: { id: id },
  });
  return Response.json({ update }, { status: 200 });
};

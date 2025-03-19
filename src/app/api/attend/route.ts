import {
  checkClockIn,
  handleClockIn,
  handleClockOut,
  processClockOut,
} from "@/data/attend";

import { db } from "@/lib/db";

import { getUserById } from "@/data/user";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import { Logging } from "@/data/log";
import { z } from 'zod';

export const GET = async (req: Request) => {
  const today = dayjs.utc().startOf("day");
  let user = await db.attends.findFirst({ where: { userId: "cm7mqrsfs06qegu7e1m4yc8xq", dates: today.toDate() } });
  return Response.json({ user }, { status: 200 });
};

export const POST = async (req: Request) => {
  let userid: string | undefined;
  try {
    const { userId, clockIn, imgClockIn, location, notify } =
      await req.json();
    userid = userId;

    const [user, alreadyClockIn] = await Promise.all([
      getUserById(userId),
      checkClockIn(userId)
    ]);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    console.log("data", alreadyClockIn)
    if (alreadyClockIn) {
      return Response.json({ error: "User already clocked in" }, { status: 400 });
    }

    if (clockIn) {
      return handleClockIn(userId, imgClockIn, location, notify, user.username);
    }
    // Handle clock out
    return handleClockOut(userId, location, notify, user.username);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    await Logging(userid || "unknown", "POST attendance", errorMessage);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
};


const notificationSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{2}\/\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.string(),
  shiftTime: z.string().regex(/^\d{2}:\d{2}$/),
  smallDate: z.string().regex(/^\d{2}\/\d{2} \d{2}:\d{2}$/),
  clockInLocation: z.string(),
});

const clockOutRequestSchema = z.object({
  userId: z.string().nonempty(),
  location: z.string().optional(),
  notify: notificationSchema.optional()
});

export const PATCH = async (req: Request): Promise<Response> => {
  let userId: string | undefined;;
  try {
    const body = await req.json();
    const validatedData = clockOutRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return Response.json({
        error: "Invalid request data",
        details: validatedData.error.format()
      }, { status: 400 });
    }
    const { userId: validatedUserId, location, notify } = validatedData.data;
    userId = validatedUserId;

    const attendance = await checkClockIn(userId);
    if (!attendance) {
      throw new Error("No clock-in record found");
    }

    if (attendance.status === AttendStatus.Full_Attend || attendance.status === AttendStatus.Late || attendance.status === AttendStatus.No_ClockIn_ClockOut) {
      throw new Error("You have already clocked out");
    }
    return await processClockOut(userId, attendance, location, notify);
  } catch (error) {
    let err = error instanceof Error ? error.message : "An unknown error occurred"
    await Logging(userId!, "Patch clock", err)
    return Response.json({
      Error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 400 })
  }
};

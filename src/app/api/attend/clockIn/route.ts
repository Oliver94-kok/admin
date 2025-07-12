import { isOffDay } from "@/data/attend";
import { getNoClockIn } from "@/data/salary";
import { AttendanceService } from "@/lib/attendService";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendsInterface } from "@/types/attendents";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";

export const POST = async (req: Request) => {
  return Response.json({
    error: "this api not use"
  }, { status: 500 })

}
import { calOverTime2 } from "@/data/attend";
import { CheckSalarys, getNoClockOut } from "@/data/salary";
import { db } from "@/lib/db";
import { checkWorkingHour } from "@/lib/function";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendsInterface } from "@/types/attendents";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
export const POST = async (req: Request) => {
  const { userId, id, clockOut } = await req.json();
  let clock = await db.attends.findFirst({
    where: { userId, status: "Active" },
  });
  if (!clock)
    return Response.json(
      { error: "you have no active attend" },
      { status: 400 },
    );
  //   let overtime = await calOverTime2(userId, clockOut);
  //   let workingHour = await checkWorkingHour(clock?.clockIn as Date, clockOut);
  let data = {
    // workingHour: workingHour,
    // overtime: Number(overtime!),
    // locationOut: "",
    status: AttendStatus.No_ClockOut,
  };
  await db.attends.update({ where: { id: clock.id }, data });
  let fine = await getNoClockOut(
    userId,
    new Date().getMonth() + 1,
    new Date().getFullYear(),
  );
  await CheckSalarys({
    userId,
    fineLate: null,
    fineNoClockIn: null,
    fineNoClockOut: fine,
    overtime: null,
    workingHour: null,
  });
  return Response.json({ result: "okay" }, { status: 200 });
};

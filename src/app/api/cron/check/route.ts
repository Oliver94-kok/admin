import { calculateOvertimeHours, calculateWorkingHours } from "@/data/attend";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
export const dynamic = "force-dynamic";
export const GET = async () => {
  let users = await db.user.findMany({ where: { role: "USER" } });
  let today = dayjs().startOf("month");
  console.log("🚀 ~ GET ~ today:", today);
  let yesterday = dayjs().subtract(1, "day");
  console.log("🚀 ~ GET ~ yesterday:", yesterday);
  if (users) {
    const processResults = await Promise.allSettled(
      users.map(async (user) => {
        let salary = await db.salary.findFirst({
          where: { userId: user.id, month: 12, year: 2024 },
        });
        let attends = await db.attends.findMany({
          where: {
            userId: user.id,
            dates: {
              gte: new Date(today.format("YYYY-MM-DD")),
              lte: new Date(yesterday.format("YYYY-MM-DD")),
            },
          },
        });
        let totaldays = attends.length;
        let totalFine = 0;
        let totalFine2 = 0;
        let totalOvertime = 0;
        let totalWorkinghour = 0;
        attends.map((a) => {
          totalOvertime = totalOvertime + a.overtime!;
          totalWorkinghour = totalWorkinghour + a.workingHour!;

          if (a.status == "No_ClockIn_ClockOut") {
            totalFine2 = totalFine2 + a.fine!;
          } else if (a.status == "Late") {
            totalFine = totalFine + a.fine!;
          }
        });
        await db.salary.update({
          where: { id: salary?.id },
          data: {
            workingDay: totaldays,
            fineLate: totalFine,
            fineNoClockIn: totalFine2,
            workingHoour: totalWorkinghour,
            overTimeHour: totalOvertime,
          },
        });
      }),
    );
  }

  return Response.json({ users }, { status: 200 });
};
export const POST = async (req: Request) => {
  try {
    const users = await db.user.findMany({where:{role:"USER"}})
    let today = dayjs().subtract(1,'days');
    let attends =await db.attends.findMany({where:{dates:new Date(today.format('YYYY-MM-DD'))}})
    const attendedUserIds = new Set(
      attends.map((attend: { userId: any }) => attend?.userId),
    );
    const absentUsers = users.filter((user) => !attendedUserIds.has(user.id));
    const processResults = await Promise.allSettled(
      absentUsers.map(async(u)=>{
        try {
          let data ={
            dates:new Date(today.format('YYYY-MM-DD')),
            userId:u.id,
            status:AttendStatus.Absent
          }
          await db.attends.create({data})
          return {
            userId: u.id,
            type: "success",
            created: true,
          };
        } catch (error) {
          return {
            userId: u.id,
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            created: false,
          };
        }
      })
    )
    const processedResults = processResults.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          userId: "unknown",
          type: "error",
          error: result.reason,
          created: false,
        };
      }
    });
    const summary = {
      total: users.length,
      successful: processedResults.filter((r) => r.type === "success").length,
      failed: processedResults.filter((r) => r.type === "error").length,
      details: processedResults.filter((r) => r.type === "success"),
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    return Response.json({error},{status:400})
  }
};

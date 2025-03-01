import { db } from "@/lib/db";


export const GET =async()=>{
    try {
        const salaryRecords = await db.salary.findMany({
              where: {
                month:2,
                year:2025,
                users: { role: "USER", AttendBranch: { team:"A" } },
              },
              orderBy:{users:{AttendBranch:{branch:"asc"}}},
              select: {
                id: true,
                month: true,
                year: true,
                workingDay: true,
                workingHoour: true,
                fineLate: true,
                fineNoClockIn: true,
                fineNoClockOut: true,
                late: true,
                notClockIn: true,
                overTimeHour: true,
                overTime: true,
                total: true,
                perDay: true,
                bonus: true,
                allowance: true,
                cover: true,
                userId: true,
                advances: true,
                transport: true,
                short: true,
                m: true,
                users: {
                  select: {
                    name: true,
                    AttendBranch: {
                      select: {
                        team: true,
                        branch: true,
                        clockIn: true,
                        clockOut: true,
                      },
                    },
                  },
                },
              },
            });
            return Response.json({salaryRecords},{status:200})
    } catch (error) {
        return Response.json(error,{status:400})
    }
}
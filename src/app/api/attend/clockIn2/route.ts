import { isOffDay } from "@/data/attend";
import { getNoClockIn } from "@/data/salary";
import { AttendanceService } from "@/lib/attendService";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendsInterface } from "@/types/attendents";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";

export const POST = async (req: Request) => {
    try {
        const { userId } = await req.json();
        const today = dayjs();
        const t = new Date(today.format("YYYY-MM-DD"));
         const attendanceService = new AttendanceService({
            gracePeriodMinutes: 15,
            maxOvertimeHours: 4,
            timezone: "UTC",
          });
        let attend  =await db.attends.findFirst({where:{userId,dates:t}})
        console.log("🚀 ~ POST ~ attend:", attend)
        if(attend){
          if(attend.status == "Active") return Response.json({id:attend.id,status:"Active",shiftIn:attend.clockIn,locationIn:attend.locationIn},{status:200});
          return Response.json({id:attend.id,status:attend.status,shiftIn:attend.clockIn,shiftOut:attend.clockOut,locationIn:attend.locationIn,locationOut:attend.locationOut},{status:200})
        }
        let shift =await db.attendBranch.findFirst({where:{userId}})
        if(!shift) throw new Error("No shift time")
        if(shift.offDay){
          let offdays = shift.offDay.split(",");
          let resultOffDay = await isOffDay(offdays, "TODAY");
          if(resultOffDay){
            await db.attends.create({data:{userId,status:"OffDay",dates:t}})
            return Response.json({status:"OffDay"},{status:200})
          }
        }
        return Response.json({status:"Not_Start_shift"},{status:200})
    } catch (error) {
          return Response.json(error,{status:400})
    }
}
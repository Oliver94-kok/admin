import { calOverTime2, leaveForgetClockAttend } from "@/data/attend";
import { addLeaveAttend, forEachDate } from "@/data/leave";
import { CheckSalarys, getAttendLate, getNoClockIn, getNoClockOut } from "@/data/salary";
import { db } from "@/lib/db";
import { checkWorkingHour, extractDateAndDay } from "@/lib/function";

import { TimeUtils } from "@/lib/timeUtility";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import { DateTime } from "luxon";

export const GET = async (request: Request) => {
  let data;
};

export const POST = async (req: Request) => {
  const {data} = await req.json();
  const jsonArray = data;
  for(const d of jsonArray){
   
    if(d.clockIn && d.clockOut){
     console.log("test masuk dua ada",d)
     
      if (d.late == 1) {
        var userlate = await getAttendLate(
          d.userId,
          new Date().getMonth() + 1,
          new Date().getFullYear(),
        );
      }
      let overtime = await calOverTime2(d.userId, d.clockOut);
  // let workingHour = await checkWorkingHour(d.clockIn as Date, d.clockOut);
      const today = dayjs.utc(d.clockIn);
    let data = {
      userId:d.userId,
      dates: today.toDate(),
      clockIn:d.clockIn,
      clockOut:d.clockOut,
      // img: attendImg,
      fine: userlate!,
      locationIn: d.location,
      overtime:Number(overtime),
      // workingHour,
      status: d.late == 1 ? AttendStatus.Late:AttendStatus.Full_Attend
    };
    await db.attends.create({ data });
    await CheckSalarys({
      userId:d.userId,
      fineLate: d.late ==1 ?userlate!:null,
      fineNoClockIn: null,
      fineNoClockOut: null,
      overtime: Number(overtime!),
      workingHour: null,
    });
    }else if(d.clockIn&& !d.clockOut){
      console.log("test masuk in ada out x ada",d);
      if (d.late == 1) {
        var userlate = await getAttendLate(
          d.userId,
          new Date().getMonth() + 1,
          new Date().getFullYear(),
        );
      }
      // let overtime = await calOverTime2(d.userId, d.clockOut);
  // let workingHour = await checkWorkingHour(d.clockIn as Date, d.clockOut);
  let fine = await getNoClockOut(
    d.userId,
    new Date().getMonth() + 1,
    new Date().getFullYear(),
  );
      const today = dayjs.utc(d.clockIn);
    let data = {
      userId:d.userId,
      dates: today.toDate(),
      clockIn:d.clockIn,
      clockOut:d.clockOut,
      // img: attendImg,
      fine: fine!,
      locationIn: d.location,
      // overtime:Number(overtime),
      // workingHour,
      status: AttendStatus.No_ClockOut
    };
    await db.attends.create({ data });
    await CheckSalarys({
      userId:d.userId,
      fineLate: null,
      fineNoClockIn: null,
      fineNoClockOut: fine,
      overtime: null,
      workingHour: null,
    });
    }else if(!d.clockIn &&d.clockOut){
      console.log("test masuk out ada in x ada",d)
      let fine2 = await getNoClockIn(
        d.userId,
        new Date().getMonth() + 1,
        new Date().getFullYear(),
      );
      let overtime = await calOverTime2(d.userId, d.clockOut);
      const formattedTimestamp = d.clockOut.replace(" ", "T");
      var start = DateTime.fromISO(formattedTimestamp);
      console.log("🚀 ~ POST ~ start:", start);
      let checkDate = TimeUtils.checkMorning(d.clockOut);
      const today = dayjs.utc(d.clockOut);
    
      let data = {
        userId:d.userId,
        dates: checkDate ? today.subtract(1, "day").toDate() : today.toDate(),
        clockOut: start.toISO(),
        fine: fine2!,
        locationOut: d.location,
        overtime: Number(overtime!),
        status: AttendStatus.No_ClockIn,
      };
      console.log("🚀 ~ POST ~ data:", data);
      let t = await db.attends.create({ data });
      // await checkSalary(t.userId, t.fine!, t.fine2!, day, Number(overtime));
      await CheckSalarys({
        userId:d.userId,
        fineLate: null,
        fineNoClockIn: fine2,
        fineNoClockOut: null,
        overtime: Number(overtime!),
        workingHour: null,
      });
    }else{
      console.log("test masuk dua x ada",d)
      console.log("status",d.status)
      if(d.status == "Absent"){
        let dates = new Date(d.dd);
        let data ={
          userId:d.userId,
          dates,
          status:AttendStatus.Absent
        }
        await db.attends.create({data})
      }else if(d.status == "Leave"){
        let dates = new Date(d.dd);
        let data ={
          userId:d.userId,
          dates,
          status:AttendStatus.Leave
        }
        await db.attends.create({data})
      }
    }
    
  }
  return Response.json({jsonArray},{status:200})
};

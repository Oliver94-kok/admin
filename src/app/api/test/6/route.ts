import { db } from "@/lib/db"
import { AttendStatus } from "@prisma/client"
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc);

dayjs.extend(timezone);
export const GET =async()=>{
  try {
    const now = dayjs();
    const tz = "Asia/Kuala_Lumpur";
    console.log("🚀 ~ GET ~ now:", now)
  return Response.json({time: now.tz(tz),"hshs":"sdsds"},{status:200})
  } catch (error) {
    return Response.json(error,{status:200})
  }
}

export const POST = async()=>{
  try {
    let data = {
       userId: "cm6nat8bs060lyycl74gs2pqg",
    dates: new Date("2025-03-02"),
    locationIn: "Jalan Maju,3-7,80400,Johor Bahru,Malaysia",
    status:AttendStatus.Full_Attend
    }
    let result = await db.attends.create({data})
    return Response.json(result,{status:200})
  } catch (error) {
    return Response.json(error,{status:400})
  }
}
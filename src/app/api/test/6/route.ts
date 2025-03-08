import { db } from "@/lib/db"
import { AttendStatus } from "@prisma/client"


export const POST =async(req:Request)=>{
  try {
      let data ={
        userId:"cm7wnmlcx00dsgu01acq60d1w",
        dates: new Date("2025-03-05"),
        status:AttendStatus.Full_Attend
      }
      await db.attends.create({data})
      return Response.json({"status":"okay"},{status:200})
  } catch (error) {
    return Response.json(error,{status:400})
  }
}
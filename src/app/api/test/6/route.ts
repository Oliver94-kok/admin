import { db } from "@/lib/db"
import { AttendStatus } from "@prisma/client"


export const POST =async(req:Request)=>{
  try {
      let data ={
        userId:"cm7sy21x500chgur22mbj8zzi",
        dates: new Date("2025-03-04"),
        status:AttendStatus.Active
      }
      await db.attends.create({data})
      return Response.json({"status":"okay"},{status:200})
  } catch (error) {
    return Response.json(error,{status:400})
  }
}
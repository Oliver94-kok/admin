import { db } from "@/lib/db"



export const notificationClock=async(userId:string,data:any)=>{
    let noti = await db.notificationUser.findFirst({where:{userId}});
      const currentArray = Array.isArray(noti?.clock) ? noti?.clock : [];
  const updatedArray = [...currentArray, data];
}
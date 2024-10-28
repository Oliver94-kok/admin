import { cronAttend } from "@/data/attend";
import { getAllUser } from "@/data/user";
import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";
import { DateTime } from "luxon";

export const POST = async (req: Request) => {
  let attendTody: AttendsInterface[] = await cronAttend();
  const attendedUserIds = new Set(attendTody.map((attend) => attend?.userId));
  let user = await getAllUser();
  const absentUser = user.filter((users) => !attendedUserIds.has(users.id));
  let date = DateTime.now().toFormat("dd");
  let day = {
    id: parseInt(date),
    date,
    clockIn: null,
    clockOut:null,
    late: null,
    noClockin: null,
    fine: null,
    absent:1
  };
  absentUser.forEach(async(users)=>{
    let salary = await db.salary.findFirst({where:{userId:users.id,month:new Date().getMonth()+1,year:new Date().getFullYear()}})
    const currentArray = Array.isArray(salary?.day) ? salary?.day : [];
     const updatedArray = [...currentArray, day];
    let result= await db.salary.update({where:{id:salary?.id},data:{day:updatedArray}})
    console.log(result);
    
  })
  return Response.json({ absentUser }, { status: 200 });
};
